const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getCourses } = require("../controllers/courses.controller");

const router = express.Router();

router.get("/", requireAuth, requireRole("LECTURER", "REGISTRAR"), getCourses);

module.exports = router;
