// Run: npm run seed
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };
function scoreToGrade(score) {
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

async function main() {
  console.log("Seeding database...");

  // --- Registrar account ---
  const registrarUser = await prisma.user.upsert({
    where: { email: "registrar@fusta.edu.ng" },
    update: {},
    create: {
      email: "registrar@fusta.edu.ng",
      passwordHash: await bcrypt.hash("Registrar@123", 12),
      role: "REGISTRAR",
    },
  });

  // --- Lecturer account ---
  const lecturerUser = await prisma.user.upsert({
    where: { email: "lecturer@fusta.edu.ng" },
    update: {},
    create: {
      email: "lecturer@fusta.edu.ng",
      passwordHash: await bcrypt.hash("Lecturer@123", 12),
      role: "LECTURER",
    },
  });
  const lecturer = await prisma.lecturer.upsert({
    where: { userId: lecturerUser.id },
    update: {},
    create: {
      staffId: "FUSTA/STF/0021",
      fullName: "Dr. Ibrahim Adeyemi",
      department: "Computer Science",
      userId: lecturerUser.id,
    },
  });

  // --- Student account ---
  const studentUser = await prisma.user.upsert({
    where: { email: "student@fusta.edu.ng" },
    update: {},
    create: {
      email: "student@fusta.edu.ng",
      passwordHash: await bcrypt.hash("Student@123", 12),
      role: "STUDENT",
    },
  });
  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      matricNo: "FUSTA/CSC/21/0452",
      fullName: "Abubakar Salihu",
      department: "Computer Science",
      level: 400,
      userId: studentUser.id,
    },
  });

  // --- Semester ---
  const semester = await prisma.semester.upsert({
    where: { name_session: { name: "First Semester", session: "2024/2025" } },
    update: {},
    create: { name: "First Semester", session: "2024/2025", isActive: true },
  });

  // --- Courses ---
  const courseData = [
    { code: "CSC 401", title: "Software Engineering", unit: 3 },
    { code: "CSC 403", title: "Database Systems", unit: 3 },
    { code: "CSC 407", title: "Computer Networks", unit: 2 },
    { code: "CSC 409", title: "Artificial Intelligence", unit: 3 },
    { code: "MTH 401", title: "Numerical Analysis", unit: 2 },
  ];

  const courses = [];
  for (const c of courseData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: { ...c, department: "Computer Science", lecturerId: lecturer.id },
    });
    courses.push(course);
  }

  // --- Results ---
  const scores = [78, 66, 59, 71, 48];
  for (let i = 0; i < courses.length; i++) {
    const score = scores[i];
    const grade = scoreToGrade(score);
    await prisma.result.upsert({
      where: {
        studentId_courseId_semesterId: {
          studentId: student.id,
          courseId: courses[i].id,
          semesterId: semester.id,
        },
      },
      update: {},
      create: {
        studentId: student.id,
        courseId: courses[i].id,
        semesterId: semester.id,
        score,
        grade,
        gradePoint: GRADE_POINTS[grade],
        publishedBy: registrarUser.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log("Login accounts:");
  console.log("  Registrar: registrar@fusta.edu.ng / Registrar@123");
  console.log("  Lecturer:  lecturer@fusta.edu.ng / Lecturer@123");
  console.log("  Student:   student@fusta.edu.ng / Student@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
