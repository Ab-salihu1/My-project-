const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { getSemesters } = require("../controllers/semesters.controller");

const router = express.Router();

router.get("/", requireAuth, requireRole("LECTURER", "REGISTRAR"), getSemesters);

module.exports = router;
