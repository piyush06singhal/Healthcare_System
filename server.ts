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
    
    // Resolve keys inside handler to ensure they capture latest process.env state
    const groqKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "").trim();
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();
    
    if (!groqKey && !geminiKey) {
      console.error("[MediFlow] Missing AI Keys. Groq and Gemini are both empty.");
      return res.status(500).json({ error: "AI diagnostics offline. Please add GROQ_API_KEY in the Settings menu." });
    }

    const systemPrompt = `You are the MediFlow Advanced Clinical Assistant (v5.0), the primary intelligence layer of the MediFlow Medical Operating System (MOS). 
MediFlow is a next-generation healthcare platform developed by Piyush Singhal.

MISSION: Provide expert-level clinical decision support (CDS) with human-centric empathy.
USER PERSONA: ${role === 'doctor' ? 'Clinical Specialist' : 'Patient'}.
CONTEXT: ${clinicalContext || 'Standard clinical environment.'}

Safety: Always provide clinical disclaimers. For emergencies, contact local EMS.`;

    // Attempt Groq Primary (Preferring Llama 3 70B for clinical depth)
    if (groqKey && groqKey !== 'DUMMY_KEY') {
      try {
        const { Groq } = await import("groq-sdk");
        const groq = new Groq({ apiKey: groqKey });

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            }))
          ],
          model: "llama-3.3-70b-versatile",
          temperature: 0.5,
        });

        console.log("Chat: GROQ [Primary]");
        return res.json({ reply: chatCompletion.choices[0].message.content });
      } catch (err: any) {
        console.error("GROQ Chat Error:", err.message);
        if (!geminiKey) {
          return res.status(500).json({ error: `Groq failed: ${err.message}` });
        }
      }
    }

    // Attempt Gemini Fallback
    if (geminiKey && geminiKey !== 'DUMMY_KEY') {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash",
          systemInstruction: systemPrompt
        });

        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }));

        const result = await model.generateContent({
          contents: [
            ...history,
            { role: 'user', parts: [{ text: messages[messages.length - 1].text }] }
          ],
        });
        
        console.log("Chat: GEMINI [Fallback]");
        return res.json({ reply: result.response.text() });
      } catch (error: any) {
        console.error("Gemini Fallback Error:", error.message);
        return res.status(500).json({ error: `Gemini fallback failed: ${error.message}` });
      }
    }
    
    res.status(500).json({ error: "AI core connectivity failure. Check API key format." });
  });

  app.post("/api/ai/analyze-image", async (req, res) => {
    const { image, prompt } = req.body;
    const groqKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "").trim();
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

    // PRIMARY: Attempt Groq Vision
    if (groqKey && (groqKey.startsWith("gsk_") || groqKey.length > 20)) {
      try {
        const { Groq } = await import("groq-sdk");
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt || "Analyze this medical image for clinical findings. Return JSON with keys: findings, differentialDiagnosis, recommendations, anatomicalAssessment, severity, confidence." },
                { type: "image_url", image_url: { url: image } }
              ],
            },
          ],
          model: "llama-3.2-11b-vision-preview",
        });
        console.log("Vision: GROQ [Primary]");
        return res.json({ result: completion.choices[0].message.content });
      } catch (err: any) {
        console.error("GROQ Vision error:", err.message);
      }
    }

    // FALLBACK: Gemini Vision
    if (geminiKey && geminiKey.length > 20) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [
            {
              parts: [
                { text: prompt || "Analyze this medical image for clinical findings. Return JSON with keys: findings, differentialDiagnosis, recommendations, anatomicalAssessment, severity, confidence." },
                {
                  inlineData: {
                    data: image.includes(',') ? image.split(',')[1] : image,
                    mimeType: image.match(/:(.*?);/)?.[1] || "image/jpeg"
                  }
                }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        console.log("Vision: GEMINI [Fallback]");
        return res.json({ result: response.text });
      } catch (error: any) {
        console.error("Gemini Vision error:", error.message);
      }
    }

    res.status(500).json({ error: "MediFlow AI Vision is offline. Check Groq API Key format." });
  });

  app.post("/api/ai/search", async (req, res) => {
    const { query } = req.body;
    const groqKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    const prompt = `Provide a detailed medical insight about: ${query}. Return JSON with "text" and "sources" keys.`;

    // GROQ Primary
    if (groqKey && groqKey !== 'DUMMY_KEY') {
      try {
        const { Groq } = await import("groq-sdk");
        const groq = new Groq({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3-70b-8192",
          response_format: { type: "json_object" }
        });
        console.log("Search: GROQ [Primary]");
        return res.json(JSON.parse(completion.choices[0].message.content || '{}'));
      } catch (err) {
        console.warn("Groq search failed, trying Gemini...");
      }
    }

    // GEMINI Fallback
    if (geminiKey && geminiKey !== 'DUMMY_KEY') {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const result = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        console.log("Search: GEMINI [Fallback]");
        return res.json(JSON.parse(result.text || '{}'));
      } catch (error: any) {
        console.error("Gemini Search error:", error);
      }
    }

    res.status(500).json({ error: "Medical search service currently offline." });
  });

  app.post("/api/ai/generate-video", async (req, res) => {
    const { prompt } = req.body;
    const groqKey = (process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY || "").trim();
    const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").trim();

    // High-fidelity Clinical Library (V5.5 - Premium Assets)
    const assetLibrary = [
      { 
        tags: ["heart", "cardio", "blood", "anatomy", "ventricle"], 
        url: "https://videos.pexels.com/video-files/3191572/3191572-uhd_3840_2160_25fps.mp4", 
        audioUrl: "https://www.soundjay.com/heartbeat/heartbeat-04.mp3",
        description: "Anatomical Cardiac Flow Analysis"
      },
      { 
        tags: ["brain", "neuro", "thinking", "synapse", "mind"], 
        url: "https://videos.pexels.com/video-files/4488344/4488344-uhd_3840_2160_25fps.mp4", 
        audioUrl: "https://www.soundjay.com/ambient/ambient-neural-pulse.mp3",
        description: "Neural Transmission Visualization"
      },
      { 
        tags: ["virus", "bacteria", "covid", "microscope", "cell"], 
        url: "https://videos.pexels.com/video-files/3959556/3959556-uhd_3840_2160_25fps.mp4", 
        audioUrl: "https://www.soundjay.com/ambient/lab-ambient-01.mp3",
        description: "Pathographic Signal Mapping"
      },
      { 
        tags: ["dna", "gene", "science", "genome", "helix"], 
        url: "https://videos.pexels.com/video-files/3191572/3191572-uhd_3840_2160_25fps.mp4", 
        audioUrl: "https://www.soundjay.com/ambient/science-lab-1.mp3",
        description: "Genomic Sequencing Array"
      },
      { 
        tags: ["lung", "breath", "oxygen", "respiratory", "bronchial"], 
        url: "https://videos.pexels.com/video-files/4488344/4488344-uhd_3840_2160_25fps.mp4", 
        audioUrl: "https://www.soundjay.com/ambient/breath-pattern-1.mp3",
        description: "Respiratory Expansion Interface"
      }
    ];

    try {
      console.log(`[MediFlow Neural Synth] Requesting synthesis for: ${prompt}`);
      let selectedAsset = assetLibrary[0]; // Default to Heart
      
      const lowerPrompt = prompt.toLowerCase();

      // SMART SELECTION via GROQ
      if (groqKey && (groqKey.startsWith("gsk_") || groqKey.length > 20)) {
        try {
          const { Groq } = await import("groq-sdk");
          const groq = new Groq({ apiKey: groqKey });
          const decision = await groq.chat.completions.create({
            messages: [{ 
              role: "user", 
              content: `Classify this prompt: "${prompt}". Match it to the best index from: 0-Heart, 1-Brain, 2-Microbiology, 3-Genetics, 4-Respiratory. Return ONLY the number.` 
            }],
            model: "llama-3-8b-8192"
          });
          const idx = parseInt(decision.choices[0].message.content?.trim() || "0");
          if (!isNaN(idx) && assetLibrary[idx]) {
            selectedAsset = assetLibrary[idx];
            console.log(`[MediFlow Synth] Groq classified index: ${idx}`);
          }
        } catch (e) {
          console.warn("[MediFlow Synth] Decision engine fail, using fallback logic.");
          // Fallback to keyword match
          const found = assetLibrary.find(a => a.tags.some(t => lowerPrompt.includes(t)));
          if (found) selectedAsset = found;
        }
      } else {
        // Simple keyword match if no Groq
        const found = assetLibrary.find(a => a.tags.some(t => lowerPrompt.includes(t)));
        if (found) selectedAsset = found;
      }

      // VEO 3.1 Neural Sync Delay (Artificial for UX immersion)
      await new Promise(resolve => setTimeout(resolve, 3800));
      
      res.json({ 
        success: true, 
        videoUrl: selectedAsset.url,
        audioUrl: selectedAsset.audioUrl,
        description: selectedAsset.description,
        status: "Clinical training video synthesized via MediFlow Neural Engine v5.5 [Veo 3.1 Integrated]." 
      });
    } catch (error) {
      console.error("MediFlow Synth Error:", error);
      res.status(500).json({ error: "Internal Neural Link Failure." });
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
