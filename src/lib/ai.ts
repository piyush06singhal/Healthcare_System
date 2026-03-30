import { GoogleGenAI, Modality, Type } from "@google/genai";

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIResponse = async (message: string, history: any[] = []) => {
  try {
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
        systemInstruction: `You are MediFlow AI, a state-of-the-art medical and health assistant. 
        Your primary function is to assist users with health-related queries, clinical operations, and medical information.
        
        Core Directives:
        1. **Medical Disclaimer**: Every response MUST include a clear disclaimer: "Disclaimer: I am an AI assistant, not a licensed medical professional. This information is for educational purposes and should not replace professional medical advice, diagnosis, or treatment."
        2. **Persona**: Professional, empathetic, precise, and evidence-based.
        3. **Formatting**: Use Markdown. Use bold headers, bullet points, and tables.
        4. **Emergency Protocol**: Advise calling emergency services for life-threatening symptoms.
        5. **Grounding**: Use Google Search for the most current medical guidelines.`,
        tools: [{ googleSearch: {} }]
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export const generateSymptomAnalysis = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Predict potential conditions based on these symptoms: ${symptoms}. 
      Provide a highly detailed and structured clinical analysis including:
      1. **Potential Diagnoses**: List 3-5 possible conditions.
      2. **Differential Diagnosis**: Other conditions that might share these symptoms.
      3. **Severity Assessment**: Low, Moderate, High, or Emergency.
      4. **Actionable Next Steps**: Specific diagnostic tests or lifestyle changes.
      5. **Specialist Recommendation**: Which type of doctor to see.
      6. **Emergency Red Flags**: Specific "alarm symptoms" requiring immediate ER visit.`,
      config: {
        systemInstruction: "You are a professional clinical diagnostic assistant. Provide structured, evidence-based analysis.",
        tools: [{ googleSearch: {} }]
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
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
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
