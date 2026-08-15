const prisma = require("../config/db");
const { catchAsync } = require("../middleware/errorHandler");

// GET /api/courses — lecturers get only their assigned courses,
// registrar gets the full course catalogue.
const getCourses = catchAsync(async (req, res) => {
  const where = req.user.role === "LECTURER" ? { lecturer: { userId: req.user.sub } } : {};

  const courses = await prisma.course.findMany({
    where,
    include: { lecturer: true },
    orderBy: { code: "asc" },
  });

  res.json({ success: true, data: courses });
});

module.exports = { getCourses };
