import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

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

export async function generateMetadata({ title, summary, link, existingTags }) {
  const client = getClient();
  const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash';
  
  let systemInstruction = "You are a helpful assistant. Analyze the given content (title, summary, link) and extract the best title, a concise summary, a single category (among: Book, Webtoon, Drama, Video, Article, Other), and an array of up to 3 relevant tags. Return the result strictly as a valid JSON object matching this schema: { \"title\": \"string\", \"summary\": \"string\", \"category\": \"string\", \"tags\": [\"string\"] }. Do not include markdown code blocks, just output the raw JSON.\n\nIMPORTANT INSTRUCTIONS FOR TAGS:\n1. Tags should NOT be highly specific to this single content (e.g., avoid \"겨드랑이색소침착\", \"화요일아침루틴\"). Instead, generate general, reusable subject/category-level tags (e.g., \"바디케어\", \"뷰티팁\", \"생활습관\").";

  if (existingTags && Array.isArray(existingTags) && existingTags.length > 0) {
    systemInstruction += `\n2. The user already uses the following tags: ${JSON.stringify(existingTags)}. If any of these existing tags fit the content's meaning and subject, you MUST prioritize reusing them. ONLY generate new general tags if absolutely none of the existing tags are appropriate.`;
  }

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction
  });

  const prompt = `Title: ${title || 'N/A'}\nSummary: ${summary || 'N/A'}\nLink: ${link || 'N/A'}\n\nPlease generate the JSON metadata.`;
  
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  try {
    const jsonStr = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    throw new Error("Failed to parse Gemini response as JSON: " + text);
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
