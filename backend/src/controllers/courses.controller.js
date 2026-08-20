const prisma = require("../config/db");
const { catchAsync } = require("../middleware/errorHandler");
const AppError = require("../utils/AppError");

// GET /api/courses — lecturers get only their assigned courses,
// registrar gets the full course catalogue.
const getCourses = catchAsync(async (req, res) => {
  const where = req.user.role === "LECTURER" ? { lecturerId: req.user.sub } : {};

  const courses = await prisma.course.findMany({
    where,
    include: { lecturer: true },
    orderBy: { code: "asc" },
  });

  res.json({ success: true, data: courses });
});

// POST /api/courses — registrar-only, creates a new course
const createCourse = catchAsync(async (req, res) => {
  const { code, title, unit, department, lecturerId } = req.body;

  if (!code || !title || !unit || !department) {
    throw new AppError("code, title, unit, and department are required.", 400, "VALIDATION_ERROR");
  }

  const existing = await prisma.course.findUnique({ where: { code } });
  if (existing) {
    throw new AppError("A course with this code already exists.", 409, "COURSE_EXISTS");
  }

  const course = await prisma.course.create({
    data: {
      code,
      title,
      unit: Number(unit),
      department,
      lecturerId: lecturerId || null,
    },
  });

  res.status(201).json({ success: true, data: course });
});

module.exports = { getCourses, createCourse };