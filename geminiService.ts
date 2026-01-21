import { GoogleGenAI, Type } from "@google/genai";
import { FormStructure } from "./types";

const SYSTEM_INSTRUCTION = `
あなたは、アンケート設計とデータ分析のプロフェッショナルです。
ユーザーから提供される「提案書」「企画書」「イベント概要」などのテキストを入力として、
その目的を達成するために最適な「Googleフォームの構成案」を作成してください。

## 設計の指針
1. 目的の明確化: フォームのタイトルと説明文は、回答者が「何のために回答するのか」が一目でわかる魅力的なものにする。
2. 質問タイプの多様性: 回答負荷を下げるためにラジオボタン、チェックボックス、プルダウン、リニアスケール（評価）を適切に組み合わせる。
3. 必須項目の判断: 核心となる質問は「必須」、付加的な情報は「任意」と適切に判断する。
4. 構造化データ: 指定されたJSONスキーマに従って出力してください。
`;

export const generateFormStructure = async (proposalText: string): Promise<FormStructure> => {
  // Access API key from environment variables
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("APIキーが見つかりません。VercelのEnvironment Variables設定を確認してください。");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: proposalText,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          formTitle: { type: Type.STRING },
          formDescription: { type: Type.STRING },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                helpText: { type: Type.STRING, nullable: true },
                type: { 
                  type: Type.STRING, 
                  enum: ['TEXT', 'PARAGRAPH', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'SCALE', 'DATE', 'TIME'] 
                },
                isRequired: { type: Type.BOOLEAN },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  nullable: true
                },
                scaleDetails: {
                  type: Type.OBJECT,
                  nullable: true,
                  properties: {
                    min: { type: Type.NUMBER },
                    max: { type: Type.NUMBER },
                    minLabel: { type: Type.STRING },
                    maxLabel: { type: Type.STRING }
                  },
                  required: ["min", "max", "minLabel", "maxLabel"]
                }
              },
              required: ["title", "type", "isRequired"]
            }
          }
        },
        required: ["formTitle", "formDescription", "items"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Geminiから有効な応答が得られませんでした。");
  }

  try {
    return JSON.parse(text) as FormStructure;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("AIの応答解析に失敗しました。入力を変えて再度お試しください。");
  }
};