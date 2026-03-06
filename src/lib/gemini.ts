import { GoogleGenerativeAI } from "@google/generative-ai";

// process.env se key uthana sahi tareeka hai
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  // Agar key missing ho toh error throw karein taake debugging asaan ho
  throw new Error("Missing GEMINI_API_KEY in .env.local file");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Aapke bataye mutabiq hum 2.5 use kar rahe hain
export const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash" 
});