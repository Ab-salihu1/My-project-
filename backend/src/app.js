const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const resultsRoutes = require("./routes/results.routes");
const coursesRoutes = require("./routes/courses.routes");
const semestersRoutes = require("./routes/semesters.routes");
const { errorHandler } = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()),
    credentials: true, // required so the refresh-token cookie is sent
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Blunt brute-force login/refresh attempts. Tighter than general API limits.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: "RATE_LIMITED", message: "Too many attempts. Try again later." } },
});

app.get("/api/health", (req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/semesters", semestersRoutes);

// Any unmatched route
app.use((req, res, next) => next(new AppError(`Route ${req.originalUrl} not found.`, 404, "NOT_FOUND")));

app.use(errorHandler);

module.exports = app;
