import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize with the key from your .env.local
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        // Ensure history is valid and starts with a 'user' role
        const validHistory = (history || []).filter((msg: any, index: number) => {
            if (index === 0 && msg.role === 'model') return false;
            return true;
        });

        // 🛠️ THE FIX: Use the specific model identifier that works with stable v1
        // If "gemini-1.5-flash" still 404s, try "gemini-1.5-flash-latest"
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
        });

        const systemInstruction = `You are the friendly AI travel assistant for 'Itinera'. 
        Help users brainstorm ideas for destination, budget, and group size. 
        Always encourage them to use the 'Create New Trip' button for a full itinerary.`;

        const chat = model.startChat({
            history: validHistory,
            generationConfig: {
                maxOutputTokens: 250,
            },
        });

        const result = await chat.sendMessage(`${systemInstruction}\n\nUser: ${message}`);
        const response = await result.response;
        
        return NextResponse.json({ reply: response.text() });

    } catch (error: any) {
        console.error("Chatbot API Error Details:", error.message);
        return NextResponse.json(
            { error: "Failed", details: error.message }, 
            { status: 500 }
        );
    }
}