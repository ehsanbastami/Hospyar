import { GoogleGenAI } from "@google/genai";
import { UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyCase = async (userRole: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const complexity = userRole === 'Specialist' ? 'complex, rare, and detailed' : 'educational and fundamental';
    
    const prompt = `
      You are a medical professor. Write a "Case of the Day" in Persian (Farsi) for a medical dashboard.
      The user is a ${userRole}, so the case should be ${complexity}.
      Structure:
      1. Patient Demographics (Age, Sex).
      2. Chief Complaint.
      3. History of Present Illness (HPI).
      4. Key Physical Exam Findings.
      5. Diagnostic Challenge or Question at the end.
      
      Do not use Markdown formatting like bolding with asterisks too heavily, keep it readable as a paragraph or two.
      Keep it under 150 words.
      The output MUST be in Persian.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || 'خطا در دریافت مورد روزانه.';
  } catch (error) {
    console.error("Gemini Error:", error);
    return "اتصال به هوش مصنوعی برقرار نشد. لطفاً کلید API را بررسی کنید.";
  }
};

export const searchApp = async (query: string, dataContext: string): Promise<string> => {
  try {
    // This function simulates a "smart search" that could interpret natural language
    // In a real app, this would query a vector DB. Here we just ask Gemini to summarize findings based on mock context.
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