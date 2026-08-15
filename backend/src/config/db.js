const { PrismaClient } = require("@prisma/client");

// A single shared client. Creating a new PrismaClient per request will
// exhaust Postgres connections under load — this is the standard fix.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
