const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getCourses, createCourse } = require("../controllers/courses.controller");

const router = express.Router();

router.get("/", requireAuth, requireRole("LECTURER", "REGISTRAR"), getCourses);
router.post("/", requireAuth, requireRole("REGISTRAR"), createCourse);

module.exports = router;