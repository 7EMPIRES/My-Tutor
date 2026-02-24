import { GoogleGenAI } from "@google/genai";

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export async function generateStudyGuide(courseText: string, language: 'English' | 'French' = 'English') {
  const ai = getAI();
  const model = "gemini-3-flash-preview";

  const instruction = `You are an expert tutor and academic reconstructor. Your mission is to transform the provided course material into an EXHAUSTIVE, high-density study guide that covers the material in its absolute ENTIRETY, from the first page to the last.

CRITICAL PEDAGOGICAL REQUIREMENTS:
1. NO SUMMARIZATION: Your objective is NOT to synthesize. You must process the whole file chapter by chapter, point by point. No chapter, section, or minor detail can be omitted.
2. DEEP EXPLANATIONS (THE "WHY"): For every Question (Q:) and Answer (A:), do not just provide the fact. Explain the logic, the process, and the reasoning. Use a teaching style: "It works like this... because of this... that is why we apply this step."
3. MANDATORY EXERCISES: For EVERY chapter or major section, you MUST provide a MINIMUM OF FIVE (5) practical exercises.
   - For technical subjects (Math, Physics, Chemistry, Logic, Programming), these exercises must include detailed, step-by-step worked examples showing exactly how to reach the solution.
4. SYMBOL PRECISION: Use standard LaTeX ($...$ for inline, $$...$$ for blocks) for all mathematical, physical, and chemical symbols. Accuracy is non-negotiable.
5. VERIFICATION: Use Google Search to verify any external constants, formulas, or historical facts to ensure 100% accuracy.

STRUCTURE & FORMAT:
- Organize by '## Chapter X: [Title]'.
- Use 'Q:' and 'A:' for the core content.
- Use '### Exercises' for the mandatory practice section.
- Use bold for questions and exercise prompts.
- LANGUAGE: All content MUST be written in ${language}.

Your goal is to ensure that a student who reads this guide has missed NOTHING from the original syllabus and understands the deep logic behind every concept.`;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: instruction },
          { text: `\n\nCOURSE CONTENT:\n${courseText.slice(0, 500000)}` }
        ]
      }
    ],
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  return response.text || "Failed to generate content.";
}
