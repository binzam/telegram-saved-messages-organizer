import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/messages.js";
import { clearAllSessions } from "./utils/scripts.js";
import telegramService from "./services/telegramService.js";

const app = express();

// --- Middleware ---
app.use(cors());
app.use(json());

// --- Routes ---
app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);

// --- Health check ---
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 4000;
let server;

// --- Start Server  ---
async function startServer() {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(`🚀 Backend listening on ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

startServer();

// --- Graceful Shutdown ---
async function shutdown(signal) {
  console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("HTTP server closed");
    }

    await telegramService.disconnect();
    console.log("Telegram client disconnected");

    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

// Handle all shutdown signals
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, shutdown);
});

// --- Global Error Handlers ---
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});
