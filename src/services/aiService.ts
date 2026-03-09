import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeIssueImage(base64Image: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
            {
              text: "Analyze this device image and identify the most likely repair issue. Return a JSON object with 'issue' (short name), 'description' (brief explanation), 'estimatedCost' (number in INR), and 'estimatedTime' (string like '2 Hours'). Possible issues: Cracked Screen, Battery Issue, Charging Port Problem, Camera Damage, Water Damage, or Other.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return null;
  }
}
