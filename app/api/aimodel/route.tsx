import { NextRequest } from "next/server";
import OpenAI from 'openai';


export const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: NextRequest) {
    const { messages } = await req.json();

    const completion = await openai.chat.completions.create({
        model: 'openai/gpt-4.1-mini',
        messages: [
            {
                role: 'user',
                content: 'What is the meaning of life?',
            },
        ],
    });
    console.log(completion.choices[0].message);

}