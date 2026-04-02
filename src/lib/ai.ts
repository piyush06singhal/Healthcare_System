import { GoogleGenAI, Modality, Type } from "@google/genai";

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const generateAIResponse = async (message: string, history: any[] = [], role: 'doctor' | 'patient' = 'patient') => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const doctorInstruction = `You are MediFlow Clinical AI, a high-level medical practice assistant. 
    Your primary function is to assist doctors with clinical operations, patient data analysis, and practice management.
    
    Core Directives for Doctors:
    1. **Clinical Precision**: Use professional medical terminology (e.g., "myocardial infarction" instead of "heart attack").
    2. **Evidence-Based**: Provide citations or references to current medical guidelines where possible.
    3. **Operational Efficiency**: Help with scheduling, clinical coding (ICD-10/CPT), and drafting SOAP notes.
    4. **Data Analysis**: Analyze patient trends, lab results, and imaging findings with high accuracy.
    5. **HIPAA Awareness**: Remind the doctor to ensure all PII is handled securely.
    6. **Formatting**: Use Markdown. Use bold headers, bullet points, and clinical tables.
    7. **Grounding**: Use Google Search for the most current clinical trials and guidelines.`;

    const patientInstruction = `You are MediFlow AI, a state-of-the-art medical and health assistant. 
    Your primary function is to assist users with health-related queries and medical information.
    
    Core Directives for Patients:
    1. **Medical Disclaimer**: Every response MUST include a clear disclaimer: "Disclaimer: I am an AI assistant, not a licensed medical professional. This information is for educational purposes and should not replace professional medical advice, diagnosis, or treatment."
    2. **Persona**: Professional, empathetic, precise, and evidence-based.
    3. **Formatting**: Use Markdown. Use bold headers, bullet points, and tables.
    4. **Emergency Protocol**: Advise calling emergency services for life-threatening symptoms.
    5. **Grounding**: Use Google Search for the most current medical guidelines.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: role === 'doctor' ? doctorInstruction : patientInstruction,
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
