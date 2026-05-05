import { GoogleGenAI, Modality, Type } from "@google/genai";

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
    const ai = getAI();
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const doctorInstruction = `You are MediFlow Clinical AI, a high-level medical practice assistant. 
    Your primary function is to assist doctors with clinical operations, patient data analysis, and practice management.
    
    Current Clinical Context (READ CAREFULLY):
    ${clinicalContext}

    Core Directives for Doctors:
    1. **Clinical Precision**: Use professional medical terminology.
    2. **Evidence-Based**: Cite guidelines where possible.
    3. **Operational Efficiency**: Help with scheduling, ICD-10 coding, and SOAP notes.
    4. **Data Analysis**: Analyze patient trends shown in the context above.
    5. **HIPAA Awareness**: Remind the doctor to ensure all PII is handled securely.
    6. **Grounding**: Search for current clinical trials and guidelines.`;

    const patientInstruction = `You are MediFlow AI, a state-of-the-art medical and health assistant. 
    Your primary function is to assist users with health-related queries and medical information.
    
    Current Health Data (CONFIDENTIAL):
    ${clinicalContext}

    Core Directives for Patients:
    1. **Medical Disclaimer**: Every response MUST include: "Disclaimer: I am an AI assistant, not a licensed medical professional. This information is for educational purposes and should not replace professional medical advice."
    2. **Persona**: Empathetic, precise, and evidence-based.
    3. **Emergency Protocol**: Advise calling emergency services for life-threatening symptoms (e.g. chest pain, severe bleeding).
    4. **Grounding**: Use Google Search for the most current medical guidelines.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: role === 'doctor' ? doctorInstruction : patientInstruction,
        // search tool can sometimes cause 400 errors if not supported by the specific model/region
        // tools: [{ googleSearch: {} }] 
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
