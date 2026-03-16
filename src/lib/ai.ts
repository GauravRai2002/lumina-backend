import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) {
    console.error("[AI] WARNING: GEMINI_API_KEY is missing!");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateWithAI(prompt: string): Promise<string> {
  const model = getGenAI().getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateNotes(text: string): Promise<string> {
  const prompt = `You are an expert study assistant. Analyze the following content and create well-structured, comprehensive study notes.

Format the notes in Markdown with:
- A clear, descriptive title (# heading)
- Key concepts organized with ## subheadings
- Important terms in **bold**
- Bullet points for lists and key facts
- A "Key Takeaways" section at the end

Content:
${text}

Generate detailed, well-organized study notes:`;

  return generateWithAI(prompt);
}

export async function generateQuiz(text: string): Promise<string> {
  const prompt = `You are an expert educator. Based on the following content, generate 10 multiple-choice questions to test understanding.

Return ONLY a valid JSON array with this exact format (no markdown code fences):
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]

The "correct" field is the zero-based index of the correct option.
Make questions that test real understanding, not just memorization.

Content:
${text}

Generate the quiz JSON:`;

  return generateWithAI(prompt);
}

export async function generateFlashcards(text: string): Promise<string> {
  const prompt = `You are an expert study assistant. Based on the following content, generate 15 flashcard pairs for spaced repetition study.

Return ONLY a valid JSON array with this exact format (no markdown code fences):
[
  {
    "front": "Question or key term",
    "back": "Answer or definition"
  }
]

Make flashcards that cover the most important concepts, terms, and facts.
Keep answers concise but complete.

Content:
${text}

Generate the flashcard JSON:`;

  return generateWithAI(prompt);
}

export async function chatWithTutor(
  question: string,
  context: string,
  chatHistory: { role: string; content: string }[]
): Promise<string> {
  const historyText = chatHistory
    .slice(-10) // Keep last 10 messages for context
    .map((m) => `${m.role === "user" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a helpful, patient AI study tutor. You help students understand their study material.

Study Material Context:
${context.slice(0, 8000)}

${historyText ? `Previous conversation:\n${historyText}\n` : ""}

Student's question: ${question}

Instructions:
- Answer based primarily on the study material provided
- If the answer isn't in the material, say so but still try to help
- Be encouraging and explain concepts clearly
- Use examples when helpful
- Keep responses concise but thorough

Your response:`;

  return generateWithAI(prompt);
}
