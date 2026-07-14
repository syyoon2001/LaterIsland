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
    systemInstruction += `\n2. The user already uses the following tags: ${JSON.stringify(existingTags)}. Reuse an existing tag ONLY when it is genuinely relevant to this content's actual topic. Judge relevance by real subject matter, never by mere availability of a tag — do not force-fit an existing tag onto content it doesn't actually relate to.
    - GOOD example: The user has ["현대미술", "미술전시", "문화예술"] and the content is a news article about Damien Hirst's new exhibition. The topic genuinely overlaps, so reuse "현대미술", "미술전시", or "문화예술" instead of creating new tags like "전시", "디자인", "데이미언허스트".
    - BAD example (do NOT do this): The content is a review of using a public health center's Korean medicine clinic (topic: health/medical), and the existing tags are only ["재테크", "문화예술", "자기계발"]. None of these are actually related to health or medicine, so you must NOT reuse any of them just because they exist. Instead, create new tags such as "건강", "의료정보" that truly reflect the content's real topic.
    - Rule: If the content's real topic does not genuinely overlap with any existing tag — even broadly — do not reuse any existing tag, no matter how few tags exist.
    - Rule: When none of the existing tags are genuinely relevant, do not hesitate — immediately create new tag(s) that accurately reflect this content's real topic. An accurate new tag is always better than a force-reused irrelevant one.
    - Rule: Exact wording match is not required — if a tag truly belongs to the same broad subject/category as the content, reuse it.
    - Rule: Any new tag you create must still follow instruction #1 above — general and reusable, not overly specific to this single piece of content.`;
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
