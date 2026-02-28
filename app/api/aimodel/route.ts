import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';

// 1. Azure/GitHub Models Configuration
export const openai = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

// ============================================================================
// PROMPT 1: CONVERSATIONAL AGENT (Collects Info)
// ============================================================================
const PROMPT = `
You are an AI Trip Planner for "Itinera". Your goal is to collect trip details to generate a plan.

**REQUIRED DETAILS TO COLLECT (In this Order):**
1. Starting Location (Source)
2. Destination
3. Trip Duration (in Days)
4. Group Size (Solo, Couple, Family, Friends)
5. Budget (Specific Amount & Currency, e.g., "$1000", "500 Euros", or "50k PKR")
6. Interests/Preferences

**INTELLIGENT SKIPPING & EXTRACTION RULES:**
- **Analyze the user's input deeply.** If the user provides multiple details at once (e.g., "I want to go from Lahore to London for 3 days"), **YOU MUST EXTRACT THEM ALL immediately** and not ask for them again.
- **Budget Rule:** Do NOT ask for "Low/Medium/High". You must ask for a **specific numerical budget** or range. If the user gives a vague answer (e.g., "cheap"), politely ask for a maximum spending limit.
- **SKIP** to the next missing piece of information in the list above.

**STRICT UI MAPPING:**
- asking for Source/Destination -> ui: "chat"
- asking for Duration -> ui: "tripDuration"
- asking for Group Size -> ui: "groupSize"
- asking for Budget -> ui: "budget"  <-- TRIGGERS THE NUMBER INPUT
- asking for Interests -> ui: "chat"
- asking for Final Confirmation -> ui: "final"

**OUTPUT FORMAT:**
Return a single JSON object:
{
  "resp": "Your response question here",
  "ui": "The associated UI tag"
}
`;

// ============================================================================
// PROMPT 2: FINAL GENERATOR (Creates the Plan)
// ============================================================================
const FINAL_PROMPT = `
Generate a detailed Travel Plan based on the user's chat history. 

**CRITICAL RULES (MUST FOLLOW):**
1. **DURATION ENFORCEMENT:** You MUST generate an itinerary that covers exactly the number of days the user requested. If the user asks for 7 days, the 'itinerary' array MUST contain exactly 7 objects (Day 1 through Day 7). Do not summarize, group days, or stop early.
2. **Analyze the Budget:** Extract the exact numeric value (e.g., $300).
3. **Allocation Strategy:**
   - If the budget is **Low (under $500)**: Suggest Hostels, Budget Inns, or 2-star hotels. Focus on Free activities and cheap street food.
   - If the budget is **Medium**: Suggest 3-4 star hotels and a mix of paid/free activities.
   - If the budget is **High**: Suggest 5-star hotels and premium experiences.
4. **Math Verification:** Ensure (Hotel Price x Nights) + (Activity Costs) does NOT exceed the Total Budget.

**OUTPUT REQUIREMENTS:**
Return a **Strict JSON** object following this schema. 
- Ensure 'price_per_night' and 'ticket_pricing' are actual numbers or realistic strings (e.g. "$40").

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
        "geo_coordinates": { "latitude": 0, "longitude": 0 },
        "rating": 4.5,
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "day_plan": "Full Day Title",
        "best_time_to_visit_day": "All Day",
        "activities": [
          {
            "place_name": "Activity Name",
            "place_details": "Description",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": 0, "longitude": 0 },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "Morning"
          }
        ]
      }
    ]
  }
}
`;

// ============================================================================
// API ROUTE HANDLER
// ============================================================================
export async function POST(req: NextRequest) {
  const { messages, isFinal } = await req.json();

  // 🛠️ 1. Clean the messages array! OpenAi rejects custom properties like 'ui'
  const cleanMessages = messages.map((m: any) => ({
    role: m.role,
    content: m.content
  }));

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: isFinal ? FINAL_PROMPT : PROMPT
        },
        ...cleanMessages // Pass the cleaned messages here
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4096, // Standard safe limit for GitHub/Azure endpoints
    });

    let messageContent = completion.choices[0].message.content;

    console.log("AI Raw Response (isFinal: " + isFinal + "):", messageContent);

    if (!messageContent) {
      throw new Error("No content received from AI");
    }

    messageContent = messageContent.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsedData = JSON.parse(messageContent);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("JSON PARSE ERROR. The AI returned:", messageContent);
      return NextResponse.json(
        { error: "Invalid JSON response from AI", details: String(parseError) },
        { status: 500 }
      );
    }
  }
  catch (e) {
    console.error("API Error:", e);
    return NextResponse.json(
      { error: "Failed to process request", details: String(e) },
      { status: 500 }
    );
  }
}