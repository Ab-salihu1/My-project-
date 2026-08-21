const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { register, login, refresh, logout, changePassword } = require("../controllers/auth.controller");

const router = express.Router();

const profileSchema = z
  .object({
    fullName: z.string().min(2),
    department: z.string().min(2),
    matricNo: z.string().min(4).optional(),
    staffId: z.string().min(4).optional(),
    level: z.number().int().optional(),
  })
  .optional();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["STUDENT", "LECTURER", "REGISTRAR"]),
  profile: profileSchema,
});

const loginSchema = z.object({ email: z.string().trim().email("Invalid email or password."), password: z.string().min(1, "Invalid email or password."), });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
});

// Only registrar staff can create new accounts — students/lecturers don't self-register.
router.post("/register", requireAuth, requireRole("REGISTRAR"), validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/change-password", requireAuth, validate(changePasswordSchema), changePassword);

module.exports = router;