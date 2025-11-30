import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

// 1. Azure/GitHub Models Configuration
export const openai = new OpenAI({
    baseURL: 'https://models.inference.ai.azure.com',
    apiKey: process.env.GITHUB_TOKEN, // Ensure this is set in .env.local
});

// 2. IMPROVED PROMPT
// This prompts ensures the AI always speaks in JSON and maps questions to specific UI components correctly.
const PROMPT = `
You are an AI Trip Planner for "Itinera". Your goal is to collect trip details to generate a plan.

**REQUIRED DETAILS TO COLLECT:**
1. Starting Location (Source)
2. Destination
3. Trip Duration (in Days)
4. Group Size (Solo, Couple, Family, Friends)
5. Budget (Low, Medium, High)
6. Interests/Preferences

**INTELLIGENT SKIPPING RULES:**
- **Analyze the user's input deeply.** If the user provides multiple details at once (e.g., "I want to go from Lahore to London for 3 days"), **YOU MUST EXTRACT THEM ALL immediately.**
- **DO NOT** ask for information the user has already provided.
- **SKIP** to the next missing piece of information in the list above.

**EXAMPLE BEHAVIOR:**
- User: "Plan a trip to Paris." -> You ask: "Where are you starting from?" (ui: chat)
- User: "Lahore to Dubai for 5 days." -> You detected Source, Dest, and Days. -> You ask: "Who are you traveling with?" (ui: groupSize)

**STRICT UI MAPPING:**
- asking for Source/Destination -> ui: "chat"
- asking for Duration -> ui: "tripDuration"
- asking for Group Size -> ui: "groupSize"
- asking for Budget -> ui: "budget"
- asking for Interests -> ui: "chat"
- asking for Final Confirmation -> ui: "final"

**OUTPUT FORMAT:**
Return a single JSON object:
{
  "resp": "Your response question here",
  "ui": "The associated UI tag"
}
`;

const FINAL_PROMPT = `Generate Travel Plan with give details, give me Hotels options list with HotelName,
Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and  suggest itinerary with placeName, Place Details, Place Image Url,
    Geo Coordinates, Place address, ticket Pricing, Time travel each of the location, with each day plan with best time to visit in JSON format.
 Output Schema:
{
    "trip_plan": {
        "destination": "string",
            "duration": "string",
                "origin": "string",
                    "budget": "string",
                        "group_size": "string",
                            "hotels": [
                                {
                                    "hotel_name": "string",
                                    "hotel_address": "string",
                                    "price_per_night": "string",
                                    "hotel_image_url": "string",
                                    "geo_coordinates": {
                                        "latitude": "number",
                                        "longitude": "number"
                                    },
                                    "rating": "number",
                                    "description": "string"
                                }
                            ],
                                "itinerary": [
                                    {
                                        "day": "number",
                                        "day_plan": "string",
                                        "best_time_to_visit_day": "string",
                                        "activities": [
                                            {
                                                "place_name": "string",
                                                "place_details": "string",
                                                "place_image_url": "string",
                                                "geo_coordinates": {
                                                    "latitude": "number",
                                                    "longitude": "number"
                                                },
                                                "place_address": "string",
                                                "ticket_pricing": "string",
                                                "time_travel_each_location": "string",
                                                "best_time_to_visit": "string"
                                            }
                                        ]
                                    }
                                ]
    }
}`

export async function POST(req: NextRequest) {
    const { messages, isFinal } = await req.json();
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: isFinal ? FINAL_PROMPT : PROMPT
                },
                ...messages
            ],
            // This forces the model to obey the JSON structure every time
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const messageContent = completion.choices[0].message.content;

        // Debugging log to see what the AI actually sent
        console.log("AI Raw Response:", messageContent);

        if (!messageContent) {
            throw new Error("No content received from AI");
        }

        return NextResponse.json(JSON.parse(messageContent));
    }
    catch (e) {
        console.error("API Error:", e);
        return NextResponse.json(
            { error: "Failed to process request", details: String(e) },
            { status: 500 }
        );
    }
}