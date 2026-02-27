import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // System prompt to tell the AI how to behave
        const systemInstruction = `You are the friendly AI travel assistant for an app called 'Itinera'. 
        Your job is to chat with users, ask about their travel preferences (budget, group size, destination), 
        give them quick recommendations, and encourage them to click the 'Create New Trip' button to generate a full itinerary. Keep responses short, engaging, and conversational.`;

        // Combine history with the new message
        const chat = model.startChat({
            history: history || [],
            generationConfig: { maxOutputTokens: 200 }, // Keep responses short
        });

        // Send the prompt with the system instruction hidden inside
        const result = await chat.sendMessage(`${systemInstruction}\n\nUser: ${message}`);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });

    } catch (error) {
        console.error("Chatbot API Error:", error);
        return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
    }
}