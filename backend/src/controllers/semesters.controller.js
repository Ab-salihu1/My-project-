const prisma = require("../config/db");
const { catchAsync } = require("../middleware/errorHandler");

// GET /api/semesters
const getSemesters = catchAsync(async (req, res) => {
  const semesters = await prisma.semester.findMany({ orderBy: [{ session: "desc" }, { name: "asc" }] });
  res.json({ success: true, data: semesters });
});

module.exports = { getSemesters };
