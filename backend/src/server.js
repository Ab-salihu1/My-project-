require("dotenv").config();
const app = require("./app");
const prisma = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  logger.info(`FUSTA Result Portal API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});

// Close DB connections and the HTTP server cleanly instead of dropping
// in-flight requests when the process is stopped (e.g. on Render redeploys).
async function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
});
