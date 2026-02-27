import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // 1. CLEAN HISTORY: Ensure all messages have text and valid roles
        const validContents = (history || [])
            .filter((msg: any) => (msg.text || msg.content)) // Skip empty messages
            .map((msg: any) => ({
                // Gemini REST API only accepts 'user' and 'model'
                role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
                parts: [{ text: String(msg.text || msg.content) }]
            }));

        // 2. ENSURE HISTORY STARTS WITH 'USER'
        if (validContents.length > 0 && validContents[0].role === 'model') {
            validContents.shift();
        }

        // 3. ADD THE CURRENT MESSAGE
        validContents.push({
            role: "user",
            parts: [{ text: message }]
        });

        // 4. SYSTEM INSTRUCTION (Prepend to the first user message for best results)
        const systemPrompt = "You are the Itinera travel assistant. Keep answers brief and suggest Pakistan trips. ";
        validContents[0].parts[0].text = systemPrompt + validContents[0].parts[0].text;

        // 5. CALL THE STABLE 2.0 FLASH MODEL
        const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: validContents })
    }
);

        const data = await response.json();

        if (data.error) {
            console.error("Gemini API Detailed Error:", JSON.stringify(data.error, null, 2));
            throw new Error(data.error.message);
        }

        // 6. EXTRACT RESPONSE
        const aiReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";

        return NextResponse.json({ reply: aiReply });

    } catch (error: any) {
        console.error("Final API Error:", error.message);
        return NextResponse.json({ error: "Failed", details: error.message }, { status: 500 });
    }
}