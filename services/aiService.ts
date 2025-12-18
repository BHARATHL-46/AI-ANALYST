
import { GoogleGenAI } from "@google/genai";
import { AnalysisConfig, AIModel } from "../types";

export const performAnalysis = async (config: AnalysisConfig): Promise<string> => {
  if (config.provider === 'gemini') {
    return performGeminiAnalysis(config);
  } else {
    return performOpenAIAnalysis(config);
  }
};

const performGeminiAnalysis = async (config: AnalysisConfig): Promise<string> => {
  // Always use process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    // Formatting history for Gemini
    const contents = [
      ...config.history.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      { role: 'user', parts: [{ text: config.question }] }
    ];

    const response = await ai.models.generateContent({
      model: AIModel.GEMINI,
      contents: contents as any,
      config: {
        systemInstruction: config.systemPrompt,
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        // Optional: reserve some tokens if thinking is used, 
        // but here we just pass the budget if requested.
        thinkingConfig: { 
          thinkingBudget: config.maxTokens > 100 ? 0 : 0 // Set to 0 by default for standard flash tasks
        },
      },
    });

    return response.text || "No response received from Gemini.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(error instanceof Error ? error.message : "Gemini analysis failed");
  }
};

const performOpenAIAnalysis = async (config: AnalysisConfig): Promise<string> => {
  // Using the custom base_url and key provided in the prompt
  const BASE_URL = "https://apidev.navigatelabsai.com/v1/chat/completions";
  const API_KEY = "sk-AztPIFWJK0itNf8c95Zjlg";

  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: AIModel.CHATGPT,
        messages: [
          { role: "system", content: config.systemPrompt },
          ...config.history.map(m => ({ role: m.role, content: m.content })),
          { role: "user", content: config.question }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `ChatGPT Proxy Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No response received from ChatGPT.";
  } catch (error) {
    console.error("OpenAI Proxy Error:", error);
    throw new Error(error instanceof Error ? error.message : "ChatGPT analysis failed");
  }
};
