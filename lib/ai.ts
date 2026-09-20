import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const aiModel = genAI.getGenerativeModel({
    model: "gemini-3.5-flash",
    systemInstruction:
        "You are an AI that only outputs valid JSON. Never include markdown formatting, code blocks, or conversational text.",
    generationConfig: {
        responseMimeType: "application/json", // This forces Gemini to output perfect JSON!
    },
});
