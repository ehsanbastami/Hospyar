import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, DailyCase } from "../types.ts";

export const generateDailyCase = async (userRole: string): Promise<DailyCase | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    const complexity = userRole.includes('Specialist') ? 'complex, rare, and challenging' : 'educational and fundamental';
    
    const prompt = `
      You are a medical professor. Generate a detailed medical case study in Persian (Farsi) for a ${userRole}.
      The case should be ${complexity}.
      
      Return a JSON object with the following structure:
      - title: A short, professional title for the case.
      - demographics: e.g., "آقای ۵۴ ساله"
      - chiefComplaint: The main reason for visit.
      - presentIllness: A detailed history of present illness.
      - histories: An object with fields 'pmh', 'psh', 'dh', 'fh', 'sh' (all strings).
      - ros: A detailed review of systems.
      - physicalExam: Detailed physical examination findings.
      - problemList: An array of strings listing key problems.
      - differentialDiagnosis: An array of strings listing DDx.
      - labData: Relevant laboratory and imaging results.
      - finalDiagnosis: The confirmed diagnosis.
      - treatment: Management and treatment plan.
      - followUp: Prognosis and follow-up plan.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            demographics: { type: Type.STRING },
            chiefComplaint: { type: Type.STRING },
            presentIllness: { type: Type.STRING },
            histories: {
              type: Type.OBJECT,
              properties: {
                pmh: { type: Type.STRING },
                psh: { type: Type.STRING },
                dh: { type: Type.STRING },
                fh: { type: Type.STRING },
                sh: { type: Type.STRING },
              }
            },
            ros: { type: Type.STRING },
            physicalExam: { type: Type.STRING },
            problemList: { type: Type.ARRAY, items: { type: Type.STRING } },
            differentialDiagnosis: { type: Type.ARRAY, items: { type: Type.STRING } },
            labData: { type: Type.STRING },
            finalDiagnosis: { type: Type.STRING },
            treatment: { type: Type.STRING },
            followUp: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DailyCase;
    }
    return null;
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const searchApp = async (query: string, dataContext: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        User Query: "${query}"
        Context Data (JSON): ${dataContext}
        
        Answer the user's question in Persian based *strictly* on the context data provided. 
        If data is found, present it briefly. If not, say "موردی یافت نشد".
      `
    });
    return response.text || '';
  } catch (e) {
    return "خطا در جستجو";
  }
}