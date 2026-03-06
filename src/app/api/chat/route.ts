import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { model } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { sessionId, message } = await req.json();

    // Save user message
    await prisma.message.create({
      data: { sessionId, role: "user", content: message },
    });

    // Get AI response
    const result = await model.generateContent(message);
    const aiText = result.response.text();

    // Save AI response
    await prisma.message.create({
      data: { sessionId, role: "model", content: aiText },
    });

    return NextResponse.json({ response: aiText });
  } catch (error) {
    return NextResponse.json({ error: "Error in Chat API" }, { status: 500 });
  }
}