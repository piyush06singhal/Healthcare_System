/// <reference types="vite/client" />
import { GoogleGenAI, Modality, Type } from "@google/genai";

import axios from "axios";

// Initialize the AI client lazily
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
};

export const generateAIResponse = async (message: string, history: any[] = [], role: 'doctor' | 'patient' = 'patient', clinicalContext: string = '') => {
  try {
    const response = await axios.post('/api/ai/chat', {
      messages: [...history, { sender: 'user', text: message }],
      role,
      clinicalContext
    });
    return response.data.reply;
  } catch (error) {
    console.error("Groq AI API Error:", error);
    // Fallback to Gemini if backend fails
    try {
      const ai = getAI();
      const formattedHistory = history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...formattedHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: `You are MediFlow AI. ${clinicalContext}`,
        }
      });
      return response.text;
    } catch (fallbackError) {
      console.error("AI Fallback Error:", fallbackError);
      throw error;
    }
  }
};

export const generateSymptomAnalysis = async (symptoms: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Predict potential conditions based on these symptoms: ${symptoms}. 
      Provide a highly detailed and structured clinical analysis including:
      1. **Potential Diagnoses**: List 3-5 possible conditions.
      2. **Differential Diagnosis**: Other conditions that might share these symptoms.
      3. **Severity Assessment**: Low, Moderate, High, or Emergency.
      4. **Actionable Next Steps**: Specific diagnostic tests or lifestyle changes.
      5. **Specialist Recommendation**: Which type of doctor to see.
      6. **Emergency Red Flags**: Specific "alarm symptoms" requiring immediate ER visit.`,
      config: {
        systemInstruction: "You are a professional clinical diagnostic assistant. Provide structured, evidence-based analysis."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Symptom Analysis Error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string) => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Say clearly and professionally: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    }
    return null;
  } catch (error) {
    console.error("Speech Generation Error:", error);
    return null;
  }
};
