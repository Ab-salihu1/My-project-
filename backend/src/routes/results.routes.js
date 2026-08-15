const express = require("express");
const { z } = require("zod");
const validate = require("../middleware/validate");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getMyResults, getResultsByMatric, publishResult, searchStudents } = require("../controllers/results.controller");

const router = express.Router();

const publishSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  semesterId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
});

router.get("/me", requireAuth, requireRole("STUDENT"), getMyResults);
router.get("/students/search", requireAuth, requireRole("LECTURER", "REGISTRAR"), searchStudents);
router.get("/student/:matricNo", requireAuth, requireRole("LECTURER", "REGISTRAR"), getResultsByMatric);
router.post("/", requireAuth, requireRole("LECTURER", "REGISTRAR"), validate(publishSchema), publishResult);

module.exports = router;
