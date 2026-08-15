const bcrypt = require("bcryptjs");
const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const { catchAsync } = require("../middleware/errorHandler");
const { signAccessToken, generateRefreshToken, hashToken } = require("../utils/tokens");

const REFRESH_COOKIE_NAME = "fusta_refresh";
const REFRESH_TTL_DAYS = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);

function refreshCookieOptions() {
  return {
    httpOnly: true, // not readable by JS — mitigates XSS token theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
    path: "/api/auth", // only sent to auth endpoints
  };
}

async function issueSession(user, res) {
  const accessToken = signAccessToken(user);
  const { raw, tokenHash } = generateRefreshToken();

  await prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  res.cookie(REFRESH_COOKIE_NAME, raw, refreshCookieOptions());
  return accessToken;
}

// POST /api/auth/register  (registrar-only, creates staff/student login accounts)
const register = catchAsync(async (req, res) => {
  const { email, password, role, profile } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("An account with this email already exists.", 409, "EMAIL_TAKEN");

  const passwordHash = await bcrypt.hash(password, 12);

  // Login + profile row are created together so a STUDENT/LECTURER account
  // is never left half-set-up (a login that can authenticate but has no
  // Student/Lecturer record, which would 404 on their first real request).
  const user = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({ data: { email, passwordHash, role } });

    if (role === "STUDENT" && profile) {
      await tx.student.create({
        data: {
          matricNo: profile.matricNo,
          fullName: profile.fullName,
          department: profile.department,
          level: profile.level,
          userId: created.id,
        },
      });
    }

    if (role === "LECTURER" && profile) {
      await tx.lecturer.create({
        data: {
          staffId: profile.staffId,
          fullName: profile.fullName,
          department: profile.department,
          userId: created.id,
        },
      });
    }

    return created;
  });

  res.status(201).json({ success: true, data: { id: user.id, email: user.email, role: user.role } });
});

// POST /api/auth/login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same error for "no user" and "wrong password" — don't reveal which emails exist.
  if (!user) throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");

  const accessToken = await issueSession(user, res);
  res.json({
    success: true,
    data: { accessToken, user: { id: user.id, email: user.email, role: user.role } },
  });
});

// POST /api/auth/refresh — reads the httpOnly cookie, issues a new access token,
// and rotates the refresh token (old one is revoked so it can't be replayed).
const refresh = catchAsync(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  if (!raw) throw new AppError("No session found. Please sign in again.", 401, "NO_REFRESH_TOKEN");

  const tokenHash = hashToken(raw);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });

  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new AppError("Session expired. Please sign in again.", 401, "SESSION_EXPIRED");
  }

  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });
  const accessToken = await issueSession(stored.user, res);

  res.json({
    success: true,
    data: { accessToken, user: { id: stored.user.id, email: stored.user.email, role: stored.user.role } },
  });
});

// POST /api/auth/logout
const logout = catchAsync(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE_NAME];
  if (raw) {
    const tokenHash = hashToken(raw);
    await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
  }
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
  res.json({ success: true, data: null });
});

module.exports = { register, login, refresh, logout };
