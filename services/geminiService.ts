
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Always use the process.env.API_KEY directly in the constructor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeWaterSample = async (
  imageUri?: string,
  manualData?: any,
  language: string = 'English'
): Promise<AnalysisResult> => {
  // Using gemini-3-flash-preview for general diagnostic tasks
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze this water quality sample for a user in a rural or resource-limited setting. 
    Output language: ${language}.
    
    ${imageUri ? "An image of a test strip or water sample is provided." : ""}
    ${manualData ? `Initial drone telemetry data: ${JSON.stringify(manualData)}` : ""}
    
    CRITICAL INSTRUCTIONS:
    1. Assess safety based on WHO/EPA standards.
    2. Provide a 'simpleExplanation' that is non-technical, clear, and easy to understand for someone without a science background.
    3. Identify 'alerts' for specific health risks like: fluoride toxicity, bacterial suspicion, heavy metals, or high nitrates (blue baby syndrome).
    4. Provide actionable 'recommendations' like 'Boil for 5 mins', 'Use carbon filter', 'Avoid completely', or 'Report to local council'.
    5. Determine RiskLevel: SAFE, CAUTION, or UNSAFE.
  `;

  const contents: any[] = [{ text: prompt }];
  
  if (imageUri) {
    const base64Data = imageUri.split(',')[1];
    contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data
      }
    });
  }

  // Use ai.models.generateContent with model name and contents
  const response = await ai.models.generateContent({
    model,
    contents: { parts: contents },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskLevel: { type: Type.STRING, description: "SAFE, CAUTION, or UNSAFE" },
          score: { type: Type.NUMBER, description: "Safety score from 0-100" },
          summary: { type: Type.STRING, description: "Professional summary" },
          simpleExplanation: { type: Type.STRING, description: "Clear, simple language explanation for the user." },
          parameters: {
            type: Type.OBJECT,
            properties: {
              pH: { type: Type.NUMBER },
              tds: { type: Type.NUMBER },
              turbidity: { type: Type.STRING },
              nitrates: { type: Type.NUMBER },
              chlorine: { type: Type.NUMBER },
              contaminants: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          alerts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, description: "high or medium" }
              }
            }
          },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["riskLevel", "score", "summary", "simpleExplanation", "recommendations", "alerts"]
      }
    }
  });

  // Extract text directly from the response object
  const resultStr = response.text || "{}";
  const resultJson = JSON.parse(resultStr);
  
  return {
    ...resultJson,
    timestamp: new Date().toISOString()
  };
};
