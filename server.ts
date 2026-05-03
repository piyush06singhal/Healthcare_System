import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  const PORT = 3000;

  app.use(helmet({
    contentSecurityPolicy: false, // Disable for development/Vite
  }));
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());

  // Initialize Cron Jobs
  const { initCronJobs } = await import("./server/services/cron");
  initCronJobs();

  // Socket.io connection
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    
    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Handle real-time notifications
    socket.on("send-notification", (data) => {
      const { userId, notification } = data;
      // Emit to the specific user's room
      io.to(userId).emit("new-notification", notification);
      console.log(`Notification sent to user ${userId}:`, notification.title);
    });

    // Handle new appointments
    socket.on("new-appointment", (data) => {
      const { doctorId, appointment } = data;
      // Emit to the specific doctor's room
      io.to(doctorId).emit("appointment-created", appointment);
      console.log(`New appointment alert sent to doctor ${doctorId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "MediFlow AI Server is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
