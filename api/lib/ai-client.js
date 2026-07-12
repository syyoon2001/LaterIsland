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

export async function generateMetadata({ title, summary, link }) {
  const client = getClient();
  const modelName = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
  
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: "You are a helpful assistant. Analyze the given content (title, summary, link) and extract the best title, a concise summary, a single category (among: Book, Webtoon, Drama, Video, Article, Other), and an array of up to 3 relevant tags. Return the result strictly as a valid JSON object matching this schema: { \"title\": \"string\", \"summary\": \"string\", \"category\": \"string\", \"tags\": [\"string\"] }. Do not include markdown code blocks, just output the raw JSON."
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
