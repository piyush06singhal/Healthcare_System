import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import axios from "axios";
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

  app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    console.log(`[NEWSLETTER] New subscription for: ${email}`);
    console.log(`[ACTION] Routing this subscription to: piyush.singhal.2004@gmail.com`);
    
    // In a production environment, you would use a service like SendGrid, Mailchimp, or Nodemailer here.
    // Example:
    // await sendEmail({ to: 'piyush.singhal.2004@gmail.com', subject: 'New Subscriber', body: `New subscriber: ${email}` });

    res.json({ success: true, message: "Successfully subscribed to newsletter" });
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { messages, role, clinicalContext } = req.body;
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
    }
    
    try {
      const { Groq } = await import("groq-sdk");
      const groq = new Groq({ apiKey });

      const systemPrompt = `You are the MediFlow AI Assistant, the core intelligence unit of the MediFlow Medical Operating System (MOS). 
MediFlow is a comprehensive healthcare eco-system developed by Piyush Singhal (piyush.singhal.2004@gmail.com).

Core MediFlow Product Suite:
1. **Pulse Core (Dashboard)**: Central hub for tracking vitals (Heart Rate, BP, Oxygen, Blood Sugar) in real-time.
2. **Neural Diagnostics (Symptom Checker)**: State-of-the-art AI symptom analysis and condition prediction.
3. **Digital Health Vault**: Military-grade encrypted storage for medical records, scans, and prescriptions.
4. **Clinical Sync (Doctors Page)**: Direct connection to verified specialists with a "Smart Queue" management system.
5. **Video Consultations**: Secure, high-definition tele-health platform with live transcription.
6. **Wellness AI (Calculators)**: Professional tools for BMI, BMR, and nutritional mapping.

Technical Project Details:
- Built with: React 18, Vite, Tailwind CSS, Framer Motion (motion/react), Node.js, and Express.
- Data Storage: Real-time Firebase integration for patient records and auth.
- AI Core: Integrated with Groq (Llama 3 70B) for instant clinical reasoning.

User Persona: ${role === 'doctor' ? 'Clinical Professional (MD/Specialist)' : 'Proactive Patient'}
Current Session Context: ${clinicalContext || 'Live biometric streams active.'}

Your Personality: 
- High-tech, clinical, precise, but human-centric. 
- You are not just a chatbot; you are a "Medical OS Interface".
- Use bolding and lists for readability.

Safety Protocols:
- If asked for medical advice by a patient: Provide information but ALWAYS state: "MediFlow AI is an educational assistant. Consult your MD for diagnosis."
- Emergencies: Strongly recommend calling +91 9694984312 or local emergency services.

Project Contact: Piyush Singhal (piyush.singhal.2004@gmail.com).

Deep Training Directives:
- Mention MediFlow features naturally when relevant. 
- For doctors, assist with ICD-10 coding or SOAP structure. 
- For patients, explain their vitals calmly.`;

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m: any) => ({
            role: m.sender === "user" ? "user" : "assistant",
            content: m.text
          }))
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.6,
        max_tokens: 1200,
      });

      res.json({ reply: chatCompletion.choices[0].message.content });
    } catch (error) {
      console.error("Groq AI Error:", error);
      res.status(500).json({ error: "MediFlow AI Core link disrupted. System in offline diagnostic mode." });
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    
    const serviceId = process.env.EMAILJS_SERVICE_ID || "service_5smusmb";
    const templateId = process.env.EMAILJS_TEMPLATE_ID || "template_owrzd6e";
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || "6chpD-awnqZPZdHgN";
    
    try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          name: name,
          email: email,
          title: subject, // Matches {{title}} in the screenshot's subject line
          message: message,
          to_email: 'piyush.singhal.2004@gmail.com',
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://dashboard.emailjs.com' // Sometimes helps bypass strict environment checks
        }
      });
      
      res.json({ success: true, data: response.data });
    } catch (error: any) {
      const errorMsg = error.response?.data || error.message;
      console.error("Email Proxy Error:", errorMsg);
      
      if (typeof errorMsg === 'string' && errorMsg.includes('non-browser environments')) {
        res.status(500).json({ 
          error: "Action Required: Please enable 'API access from non-browser environments' in your EmailJS Security settings.",
          link: "https://dashboard.emailjs.com/admin/account/security"
        });
      } else {
        res.status(500).json({ 
          error: "Failed to send message via MediFlow secure relay.",
          details: errorMsg
        });
      }
    }
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
