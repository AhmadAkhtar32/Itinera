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
You are an AI Trip Planner Agent for "Itinera". Your goal is to collect trip details from the user step-by-step.

**INSTRUCTIONS:**
1. Ask exactly **one** question at a time.
2. Do not move to the next topic until the current one is answered.
3. **CRITICAL:** You must ALWAYS return your response as a JSON object, even when just asking a simple question. NEVER return plain text.

**STRICT UI MAPPING (Use these tags exactly):**
- If asking for **Starting Location** or **Destination** -> Set ui: "chat"
- If asking for **Duration/Days** -> Set ui: "tripDuration"
- If asking for **Group Size** (Solo, Couple, Family, Friends) -> Set ui: "groupSize"
- If asking for **Budget** (Low, Medium, High) -> Set ui: "budget"
- If asking for **Interests** or **Special Requirements** -> Set ui: "chat"
- If all data is collected and you are ready to generate the plan -> Set ui: "final"

**OUTPUT FORMAT:**
Return a single JSON object in this exact schema:
{
  "resp": "The text question you are asking the user (e.g., 'What is your budget?')",
  "ui": "One of the strict UI tags listed above (e.g., 'budget')"
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
                    content: PROMPT
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