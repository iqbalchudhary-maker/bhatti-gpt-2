"use server";

import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";

// 1. Add Knowledge
export async function addKnowledge(fileName: string, content: string) {
  return await prisma.knowledge.create({ data: { fileName, content } });
}

// 2. Get Knowledge for Admin
export async function getKnowledge() {
  return await prisma.knowledge.findMany({ orderBy: { createdAt: 'desc' } });
}

// 3. Delete Knowledge
export async function deleteKnowledge(id: string) {
  return await prisma.knowledge.delete({ where: { id } });
}

// 4. Handle Chat with RAG
export async function handleChatAction(sessionId: string, userMessage: string) {
  try {
    // A. Fetch Context (Knowledge Base)
    const knowledgeBase = await prisma.knowledge.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const contextText = knowledgeBase.map((k) => k.content).join("\n\n");

    // B. Fetch History
    const history = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 10 
    });

    // C. Gemini Chat Session - Filtered to ensure first role is 'user'
    const filteredHistory = history.filter((msg, index) => {
      if (index === 0 && msg.role === 'model') return false; 
      return true;
    });

    const chat = model.startChat({
      history: filteredHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    });

    // D. Construct Prompt
    const prompt = `
      You are Bhatti-GPT, an expert AI assistant.
      Use the following context to answer the user's question accurately.
      If the context does not contain the answer, use your own knowledge.

      CONTEXT:
      ${contextText || "No additional context provided."}

      USER QUESTION:
      ${userMessage}
    `;

    // E. Get Response
    const result = await chat.sendMessage(prompt);
    const aiResponse = result.response.text();

    // F. Save to DB using Transaction
    await prisma.$transaction([
      prisma.message.create({ data: { sessionId, role: "user", content: userMessage } }),
      prisma.message.create({ data: { sessionId, role: "model", content: aiResponse } }),
    ]);

    return { success: true, data: aiResponse };

  } catch (error: any) {
    console.error("Chat Action Error:", error);
    return { success: false, error: "AI failed to respond. Please check your API key or DB connection." };
  }
}

// 5. Get History
export async function getChatHistory(sessionId: string) {
  const messages = await prisma.message.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });
  return { success: true, data: messages };
}