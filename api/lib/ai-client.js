import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

let genAI = null;
let groqClient = null;

function getClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

function getGroqClient() {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY environment variable is not set.");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

function parseJsonResponse(text) {
  try {
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error("Failed to parse AI response as JSON: " + text);
  }
}

export async function generateMetadata({ title, summary, link, existingTags }) {
  const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';
  
  let systemInstruction = "You are a helpful assistant. Analyze the given content (title, summary, link) and extract the best title, a concise summary, a single category (among: Book, Webtoon, Drama, Video, Article, Other), and an array of up to 3 relevant tags. Return the result strictly as a valid JSON object matching this schema: { \"title\": \"string\", \"summary\": \"string\", \"category\": \"string\", \"tags\": [\"string\"] }. Do not include markdown code blocks, just output the raw JSON.\n\nIMPORTANT INSTRUCTIONS FOR TAGS:\n1. Tags should NOT be highly specific to this single content (e.g., avoid \"겨드랑이색소침착\", \"화요일아침루틴\"). Instead, generate general, reusable subject/category-level tags (e.g., \"바디케어\", \"뷰티팁\", \"생활습관\").";

  if (existingTags && Array.isArray(existingTags) && existingTags.length > 0) {
    systemInstruction += `\n2. The user already uses the following tags: ${JSON.stringify(existingTags)}. If the content's topic overlaps EVEN SLIGHTLY with any of these existing tags (e.g., broad categories, adjacent topics, or parent/child concepts), you MUST prioritize reusing the existing tags rather than creating new ones.
    - Example: If the user has ["현대미술", "미술전시", "문화예술"] and the content is a news article about Damien Hirst's new exhibition, DO NOT create new tags like "전시", "디자인", "데이미언허스트", or "국립현대미술관". You MUST reuse "현대미술", "미술전시", or "문화예술".
    - Rule: Completely identical expressions are not required. If it belongs to the same broad category, reuse the tag.
    - Rule: ONLY generate a completely new tag if absolutely none of the existing tags are even remotely appropriate.`;
  } else {
    systemInstruction += `\n2. The user has no existing tags yet. Create new general tags as instructed above.`;
  }

  const prompt = `Title: ${title || 'N/A'}\nSummary: ${summary || 'N/A'}\nLink: ${link || 'N/A'}\n\nPlease generate the JSON metadata.`;
  
  try {
    const client = getClient();
    const model = client.getGenerativeModel({
      model: modelName,
      systemInstruction
    });
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return parseJsonResponse(text);
  } catch (err) {
    const errorString = err.toString().toLowerCase();
    if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('rate limit')) {
      console.log("Gemini limit reached. Groq fallback used.");
      const groqClient = getGroqClient();
      const groqModelName = process.env.GROQ_TEXT_MODEL || 'llama-3.1-8b-instant';
      
      const groqResult = await groqClient.chat.completions.create({
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: prompt }
        ],
        model: groqModelName,
        response_format: { type: 'json_object' }
      });
      
      const text = groqResult.choices[0]?.message?.content || "";
      return parseJsonResponse(text);
    }
    throw err;
  }
}

export async function generateEmbedding(text) {
  const client = getClient();
  const modelName = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';
  const model = client.getGenerativeModel({ model: modelName });
  
  const result = await model.embedContent(text);
  const embedding = result.embedding;
  
  return {
    vector: embedding.values,
    model: modelName
  };
}
