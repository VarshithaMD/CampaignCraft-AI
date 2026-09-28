import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface CampaignData {
  subjectLines: string[];
  bodyCopy: string;
  targetAudience: string;
  tone: string;
  imagePrompt: string;
}

export async function generateCampaignText(prompt: string): Promise<CampaignData> {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a complete email marketing campaign based on this prompt: "${prompt}". 
    Provide 3-5 subject line options, a structured body copy (with placeholders like [Name]), 
    a description of the target audience, the tone used, and a specific prompt for an AI image generator that would complement this email.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subjectLines: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of catchy subject lines.",
          },
          bodyCopy: {
            type: Type.STRING,
            description: "The full email body text with placeholders.",
          },
          targetAudience: {
            type: Type.STRING,
            description: "Brief description of who this email is for.",
          },
          tone: {
            type: Type.STRING,
            description: "The emotional tone of the campaign.",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed prompt for an image generator (like DALL-E or Midjourney) to create a hero image for this email.",
          },
        },
        required: ["subjectLines", "bodyCopy", "targetAudience", "tone", "imagePrompt"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse campaign JSON", e);
    throw new Error("Failed to generate campaign structure.");
  }
}

export async function generateCampaignImage(imagePrompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          text: `Create a high-quality, professional marketing hero image for an email campaign. Style: Modern, clean, high-end photography. Subject: ${imagePrompt}`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated.");
}
