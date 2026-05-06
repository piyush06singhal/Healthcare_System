/// <reference types="vite/client" />
import axios from "axios";

// Unified AI Relay Engine v4.5
// All AI requests are proxied via the MediFlow Secure Gateway (/api/ai/*)
// to protect credentials and ensure clinical safety.

export const generateAIResponse = async (message: string, history: any[] = [], role: 'doctor' | 'patient' = 'patient', clinicalContext: string = '') => {
  try {
    const response = await axios.post('/api/ai/chat', {
      messages: [...history, { sender: 'user', text: message }],
      role,
      clinicalContext
    });
    if (response.data.reply) return response.data.reply;
    throw new Error("No response from AI secure relay");
  } catch (error: any) {
    console.error("MediFlow AI Error:", error);
    throw new Error(error.response?.data?.error || "AI Core link disrupted. Please verify credentials.");
  }
};

export const generateSymptomAnalysis = async (symptoms: string) => {
  return generateAIResponse(`Predict potential conditions based on these symptoms: ${symptoms}. Provide analysis for: Diagnoses, Severity, and Emergency Red Flags.`, [], 'patient', 'Symptom analysis request');
};

export const analyzeClinicalImage = async (base64Image: string, prompt: string = "Analyze this medical image for clinical findings. Return JSON.") => {
  try {
    const response = await axios.post('/api/ai/analyze-image', {
      image: base64Image,
      prompt: `${prompt} FORMAT: Respond strictly in JSON format with the following keys: findings, differentialDiagnosis, recommendations, anatomicalAssessment, severity, confidence.`
    });
    return response.data.result;
  } catch (error: any) {
    console.error("Clinical Vision Error:", error);
    throw new Error(error.response?.data?.error || "Vision AI failed. Verify clinical secure uplink.");
  }
};

export const searchMedicalKnowledge = async (query: string) => {
  try {
    const response = await axios.post('/api/ai/search', { query });
    return {
      text: response.data.text,
      sources: response.data.sources || []
    };
  } catch (error: any) {
    console.error("Medical Search Error:", error);
    throw new Error(error.response?.data?.error || "Search engine failed.");
  }
};

export const generateSpeech = async (text: string) => {
  // TTS Relay integration can be added here
  return null;
};
