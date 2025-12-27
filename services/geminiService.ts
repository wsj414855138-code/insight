import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AudioAnalysisResult, SurveySchema, GeneratedReport, QuestionType, DetailedInterviewReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes an audio file (Base64) for transcription and insights.
 */
export const analyzeAudioContent = async (base64Audio: string, mimeType: string): Promise<AudioAnalysisResult> => {
  // Switch to gemini-2.0-flash-exp for reliable multimodal (audio) support
  const model = "gemini-2.0-flash-exp"; 
  
  const prompt = `
    你是一位专业的用户研究专家助手。请处理这段音频文件：
    1. 逐字转录音频内容 (Verbatim Transcription)。
    2. 分析说话者的情感倾向 (Sentiment)。
    3. 提取核心发现 (Key Findings) 和具体的用户痛点 (Pain Points)。
    4. 提供一份简要的执行摘要 (Executive Summary)。
    
    **重要**：所有生成的文本内容（摘要、转录、观点等）必须使用**简体中文**。
    
    Return the response in JSON format matching the schema.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      transcription: { type: Type.STRING },
      summary: { type: Type.STRING },
      sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative', 'Mixed'] },
      sentimentScore: { type: Type.NUMBER, description: "A score from 0 to 100 where 100 is very positive" },
      keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["transcription", "summary", "sentiment", "sentimentScore", "keyPoints", "painPoints"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Audio } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as AudioAnalysisResult;
  } catch (error) {
    console.error("Audio Analysis Error Details:", error);
    throw error;
  }
};

/**
 * Generates a detailed, structured report based on the Pyramid Principle.
 */
export const generateDetailedInterviewReport = async (transcription: string): Promise<DetailedInterviewReport> => {
  const model = "gemini-2.0-flash-exp"; // Using the smarter model for synthesis

  const prompt = `
    作为首席用户研究员，请根据以下访谈转录文本，撰写一份高质量的**结构化深度访谈报告**。
    
    **遵循金字塔原理 (Pyramid Principle)**：
    1. **结论先行**：用一句话概括最核心的战略性发现。
    2. **话题数据化**：统计用户在对话中提到的最关键的5个话题或关键词及其提及的大致频次（用于生成图表）。
    3. **逻辑论证**：将发现拆解为 3-4 个逻辑支撑点（Section）。每个支撑点需要包含：
       - 核心论点
       - 详细阐述
       - 用户原声引用 (Quotes) 以增加真实感。
    
    访谈文本：
    ${transcription.substring(0, 25000)} (截取前部分以防超长)
    
    请严格按照 JSON 格式输出。
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      mainConclusion: { type: Type.STRING, description: "一句话核心结论，金字塔顶端" },
      topicAnalysis: {
        type: Type.ARRAY,
        description: "话题提及频率分析，用于生成图表",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "话题关键词" },
            value: { type: Type.NUMBER, description: "提及频次或重要性权重(1-10)" }
          },
          required: ["name", "value"]
        }
      },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            icon: { type: Type.STRING, enum: ['star', 'quote', 'bulb', 'list'] },
            content: { type: Type.STRING, description: "该论点的详细分析" },
            quotes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "支持该论点的用户原话" }
          },
          required: ["title", "icon", "content", "quotes"]
        }
      }
    },
    required: ["mainConclusion", "topicAnalysis", "sections"]
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    if (!response.text) throw new Error("No response from AI");
    return JSON.parse(response.text) as DetailedInterviewReport;
  } catch (error) {
    console.error("Detailed Report Generation Error:", error);
    throw error;
  }
};

// Deprecated or Placeholder functions for now
export const generateSurveySchema = async (goal: string, audience: string): Promise<SurveySchema> => {
   throw new Error("Feature under development");
};

export const generateResearchReport = async (context: string): Promise<GeneratedReport> => {
  throw new Error("Feature under development");
};