import { GoogleGenAI, Type } from "@google/genai";
import { DreamAnalysis } from "../types";

// Explicit mapping for prettier display names, now exported for UI use
export const MODEL_NAME_MAPPING: Record<string, string> = {
  'gemini-2.5-flash': 'Gemini 2.5 Flash (快速版)',
  'gemini-3-pro-preview': 'Gemini 3.0 Pro (深度解析版)',
};

// Helper to format model ID into a readable display name, now exported
export const getModelDisplayName = (id: string): string => {
  if (!id) return 'Unknown Model';
  
  // 1. Check explicit mapping first
  if (MODEL_NAME_MAPPING[id]) {
    return MODEL_NAME_MAPPING[id];
  }
  
  // 2. Fallback to auto-formatting
  const rawName = id.startsWith('gemini-') ? id.substring(7) : id;
  
  const formattedName = rawName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return `Gemini ${formattedName}`;
};

// analyzeDream now accepts the modelId as an argument
export const analyzeDream = async (dreamContent: string, modelId: string, customApiKey?: string): Promise<DreamAnalysis> => {
  const activeKey = customApiKey || process.env.API_KEY;

  if (!activeKey) {
    console.error("API_KEY is not defined.");
    throw new Error("API Key missing");
  }

  const ai = new GoogleGenAI({ apiKey: activeKey });

  console.log(`[GeminiService] Sending request to model: ${modelId}`);

  const prompt = `
    請詳細解析以下夢境："${dreamContent}"。
    請扮演一位精通宗教信仰、心理學與科學的解夢專家，分別從以下五個截然不同的角度進行專業解讀。
    注意：在解釋中請完全避免使用「玄學」一詞，請使用「宗教信仰」、「傳統智慧」或具體的學派名稱來代替。
    
    1. 中式易經 (I Ching)：根據夢境起卦。
    2. 農民曆/周公解夢 (Farmer's Almanac)：分析吉凶。
    3. 吉普賽占卜 (Gypsy Fortune Telling)：分析象徵物與未來運勢。
    4. 西格蒙德·佛洛伊德 (Sigmund Freud)：分析"顯性夢境"與"隱性夢境"。
    5. 現代神經科學 (Neuroscience)：從大腦活動與生理角度解釋。

    此外，請為這五個面向分別評分（1-5分），定義如下：
    - 宗教/占卜類 (易經, 農民曆, 吉普賽)：1=大凶, 5=大吉。
    - 科學/心理類 (佛洛伊德, 神經科學)：1=焦慮/壓力大/負面, 5=平靜/健康/正向。

    重要：所有輸出內容（包括Summary與各項解析）必須使用"繁體中文 (Traditional Chinese)"。
    最後請提供一個"非常簡潔扼要"（約50-80字內）的綜合總結 (Summary)。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId, // Use the passed modelId
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "A very concise summary integrating all perspectives (max 80 chars) in Traditional Chinese."
            },
            scores: {
              type: Type.OBJECT,
              properties: {
                iching: { type: Type.INTEGER, description: "Score 1-5" },
                almanac: { type: Type.INTEGER, description: "Score 1-5" },
                gypsy: { type: Type.INTEGER, description: "Score 1-5" },
                freud: { type: Type.INTEGER, description: "Score 1-5" },
                neuroscience: { type: Type.INTEGER, description: "Score 1-5" }
              },
              required: ["iching", "almanac", "gypsy", "freud", "neuroscience"]
            },
            iching: {
              type: Type.OBJECT,
              properties: {
                hexagramName: { type: Type.STRING, description: "Name of the Hexagram (Traditional Chinese)" },
                hexagramSymbol: { type: Type.STRING, description: "Unicode character for the hexagram" },
                hexagramCode: { type: Type.STRING, description: "String of 6 binary digits (e.g. '101101') representing the lines from TOP to BOTTOM. 1 is Solid(Yang), 0 is Broken(Yin)." },
                interpretation: { type: Type.STRING, description: "Interpretation (Traditional Chinese)" },
                advice: { type: Type.STRING, description: "Philosophical advice (Traditional Chinese)" }
              },
              required: ["hexagramName", "hexagramSymbol", "hexagramCode", "interpretation", "advice"]
            },
            almanac: {
              type: Type.OBJECT,
              properties: {
                luckyNumbers: {
                  type: Type.ARRAY,
                  items: { type: Type.INTEGER },
                  description: "List of 3 lucky numbers"
                },
                goodFor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Activities suitable (Traditional Chinese)"
                },
                badFor: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Activities to avoid (Traditional Chinese)"
                },
                significance: { type: Type.STRING, description: "General auspiciousness (Traditional Chinese)" }
              },
              required: ["luckyNumbers", "goodFor", "badFor", "significance"]
            },
            gypsy: {
              type: Type.OBJECT,
              properties: {
                symbolsDetected: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key symbols (Traditional Chinese)"
                },
                meaning: { type: Type.STRING, description: "Mystical meaning (Traditional Chinese)" },
                prediction: { type: Type.STRING, description: "Future prediction (Traditional Chinese)" }
              },
              required: ["symbolsDetected", "meaning", "prediction"]
            },
            freud: {
              type: Type.OBJECT,
              properties: {
                manifestContent: { type: Type.STRING, description: "Description of the dream as remembered (surface level) (Traditional Chinese)" },
                latentContent: { type: Type.STRING, description: "The hidden psychological meaning and repressed desires (Traditional Chinese)" },
                psychologicalMeaning: { type: Type.STRING, description: "Overall psychological analysis (Traditional Chinese)" }
              },
              required: ["manifestContent", "latentContent", "psychologicalMeaning"]
            },
            neuroscience: {
              type: Type.OBJECT,
              properties: {
                brainActivity: { type: Type.STRING, description: "Explanation of brain regions likely active (Traditional Chinese)" },
                memoryConsolidation: { type: Type.STRING, description: "How this relates to processing daily memories (Traditional Chinese)" },
                sleepCycleAnalysis: { type: Type.STRING, description: "Analysis related to REM/NREM stages (Traditional Chinese)" }
              },
              required: ["brainActivity", "memoryConsolidation", "sleepCycleAnalysis"]
            }
          },
          required: ["summary", "scores", "iching", "almanac", "gypsy", "freud", "neuroscience"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as DreamAnalysis;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Error analyzing dream:", error);
    throw error;
  }
};