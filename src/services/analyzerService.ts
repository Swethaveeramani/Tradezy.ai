import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "undefined" || apiKey === "MY_GEMINI_API_KEY") {
  console.warn("GEMINI_API_KEY is not configured. Please set it in your environment variables.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface AnalysisResult {
  tradeType: 'CALL' | 'PUT' | 'NEUTRAL';
  confidence: number;
  explanation: string;
  keyIndicators: string[];
  sentiment: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  recommendedEntry?: string;
  stopLoss?: string;
  takeProfit?: string;
  checklist: string[];
  marketContext?: string;
  symbol?: string;
  validityMinutes: number;
  isBestTrade: boolean;
}

async function compressImage(base64: string, maxWidth = 800): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
}

export async function analyzeTradeScreenshot(originalBase64: string): Promise<AnalysisResult> {
  const base64Image = await compressImage(originalBase64);
  
  const prompt = `
    Analyze this trading chart. Determine:
    1. Trade Type (CALL/PUT/NEUTRAL)
    2. Confidence (0-100)
    3. Brief explanation
    4. Key indicators seen
    5. Sentiment (BULLISH/BEARISH/SIDEWAYS)
    6. Entry/SL/TP levels if clear
    7. Checklist of 4 things to do
    8. Symbol (e.g. BTC, Nifty)
    9. Validity in minutes
    10. If it's a high quality "Best Trade" setup (true/false)

    Return ONLY JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      },
    });

    let resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    
    // Safety check for potential markdown blocks
    resultText = resultText.trim();
    if (resultText.includes("```")) {
      resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    try {
      return JSON.parse(resultText) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error. Content:", resultText);
      throw new Error("Invalid AI response format. Please try again.");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
