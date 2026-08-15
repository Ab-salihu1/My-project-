const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const { catchAsync } = require("../middleware/errorHandler");

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

function scoreToGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function classOfDegree(cgpa) {
  if (cgpa >= 4.5) return "First Class";
  if (cgpa >= 3.5) return "Second Class Upper";
  if (cgpa >= 2.4) return "Second Class Lower";
  if (cgpa >= 1.5) return "Third Class";
  return "Pass";
}

function computeGpa(results) {
  const totalUnits = results.reduce((s, r) => s + r.course.unit, 0);
  const totalPoints = results.reduce((s, r) => s + r.course.unit * r.gradePoint, 0);
  return totalUnits ? Number((totalPoints / totalUnits).toFixed(2)) : 0;
}

// GET /api/results/me?semesterId=...
// A student viewing their own results. Ownership is enforced by req.user.sub,
// never by a client-supplied studentId — that's what stops student A from
// ever seeing student B's record just by guessing an ID.
const getMyResults = catchAsync(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { userId: req.user.sub } });
  if (!student) throw new AppError("No student record linked to this account.", 404, "NOT_A_STUDENT");

  const where = { studentId: student.id, ...(req.query.semesterId ? { semesterId: req.query.semesterId } : {}) };

  const results = await prisma.result.findMany({
    where,
    include: { course: true, semester: true },
    orderBy: { publishedAt: "desc" },
  });

  const allResults = await prisma.result.findMany({ where: { studentId: student.id }, include: { course: true } });
  const cgpa = computeGpa(allResults);

  res.json({
    success: true,
    data: {
      student: { matricNo: student.matricNo, fullName: student.fullName, department: student.department, level: student.level },
      results,
      semesterGpa: computeGpa(results),
      cgpa,
      classOfDegree: classOfDegree(cgpa),
    },
  });
});

// GET /api/results/student/:matricNo — for lecturer/registrar lookup
const getResultsByMatric = catchAsync(async (req, res) => {
  const student = await prisma.student.findUnique({ where: { matricNo: req.params.matricNo } });
  if (!student) throw new AppError("No student found with that matric number.", 404, "STUDENT_NOT_FOUND");

  const results = await prisma.result.findMany({
    where: { studentId: student.id },
    include: { course: true, semester: true },
    orderBy: { publishedAt: "desc" },
  });

  const cgpa = computeGpa(results);
  res.json({
    success: true,
    data: {
      student: { matricNo: student.matricNo, fullName: student.fullName, department: student.department, level: student.level },
      results,
      cgpa,
      classOfDegree: classOfDegree(cgpa),
    },
  });
});

// POST /api/results — registrar or the course's own lecturer publishes a result.
// score -> grade -> gradePoint are derived server-side so a client can never
// submit a mismatched grade/score pair.
const publishResult = catchAsync(async (req, res) => {
  const { studentId, courseId, semesterId, score } = req.body;

  if (score < 0 || score > 100) throw new AppError("Score must be between 0 and 100.", 400, "INVALID_SCORE");

  const grade = scoreToGrade(score);
  const gradePoint = GRADE_POINTS[grade];

  const result = await prisma.result.upsert({
    where: { studentId_courseId_semesterId: { studentId, courseId, semesterId } },
    update: { score, grade, gradePoint, publishedBy: req.user.sub, publishedAt: new Date() },
    create: { studentId, courseId, semesterId, score, grade, gradePoint, publishedBy: req.user.sub },
  });

  res.status(201).json({ success: true, data: result });
});

// GET /api/results/students/search?q=... — registrar/lecturer typeahead search
const searchStudents = catchAsync(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json({ success: true, data: [] });

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { matricNo: { contains: q, mode: "insensitive" } },
        { fullName: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 10,
    orderBy: { fullName: "asc" },
  });

  res.json({ success: true, data: students });
});

module.exports = { getMyResults, getResultsByMatric, publishResult, searchStudents };
