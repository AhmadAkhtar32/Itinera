import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

// 1. FIXED: Use the correct Azure endpoint for GitHub Models
export const openai = new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey: process.env.GITHUB_TOKEN, // Ensure this is set in .env.local
});

const PROMPT = `You are an AI Trip Planner Agent. Your goal is to help the user plan a trip by **asking one relevant trip-related question at a time**.

 Only ask questions about the following details in order, and wait for the user’s answer before asking the next: 

1. Starting location (source) 
2. Destination city or country 
3. Group size (Solo, Couple, Family, Friends) 
4. Budget (Low, Medium, High) 
5. Trip duration (number of days) 
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation) 
7. Special requirements or preferences (if any)
Do not ask multiple questions at once, and never ask irrelevant questions.
If any answer is missing or unclear, politely ask the user to clarify before proceeding.
Always maintain a conversational, interactive style while asking questions.
Along wth response also send which ui component to display for generative UI for example 'budget/groupSize/tripDuration/final) , where Final means AI generating complete final outpur
Once all required information is collected, generate and return a **strict JSON response only** (no explanations or extra text) with following JSON schema:
{
resp:'Text Resp',
ui:'budget/groupSize/tripDuration/final)'
}
`;

export async function POST(req: NextRequest) {
    try {
        const { messages } = await req.json();

        // 2. FIXED: Use the correct model name for GitHub Models
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PROMPT
                },
                ...messages
            ],
            // 3. Keep JSON mode to ensure the prompt instructions are followed
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const messageContent = completion.choices[0].message.content;

        // Console log for debugging
        console.log("AI Raw Response:", messageContent);

        if (!messageContent) {
            throw new Error("No content received from AI");
        }

        return NextResponse.json(JSON.parse(messageContent));
    }
    catch (e) {
        console.error("API Error:", e);
        return NextResponse.json(
            { error: "Failed to process request", details: e },
            { status: 500 }
        );
    }
}