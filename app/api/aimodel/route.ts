import { NextRequest, NextResponse } from "next/server";
import OpenAI from 'openai';
import { aj } from "../arcjet/route";
import { auth, currentUser } from "@clerk/nextjs/server";

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

**CRITICAL BUDGETING LOGIC (MUST FOLLOW):**
1. **Analyze the Budget:** Extract the exact numeric value (e.g., $300).
2. **Allocation Strategy:**
   - If the budget is **Low (under $500)**: You MUST suggest **Hostels, Budget Inns, or 2-star hotels**. Do NOT suggest luxury resorts. Focus on **Free activities** (walking tours, parks) and cheap street food.
   - If the budget is **Medium**: Suggest 3-4 star hotels and a mix of paid/free activities.
   - If the budget is **High**: Suggest 5-star hotels and premium experiences.
3. **Math Verification:** Ensure (Hotel Price x Nights) + (Activity Costs) does NOT exceed the Total Budget.

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
      // Generate at least 3 objects here
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": { "latitude": 0, "longitude": 0 },
        "rating": 4.5,
        "description": "string"
      },
      { "hotel_name": "Option 2..." },
      { "hotel_name": "Option 3..." }
    ],
    "itinerary": [
      {
        "day": 1,
        "day_plan": "Full Day Title (e.g., 'Historical Tour & Nightlife')",
        "best_time_to_visit_day": "All Day",
        "activities": [
          {
            "place_name": "Morning Activity Name",
            "place_details": "Description of what to do here",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": 0, "longitude": 0 },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "Morning"
          },
          {
            "place_name": "Afternoon Activity Name",
            "place_details": "Description...",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": 0, "longitude": 0 },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "Afternoon"
          },
          {
            "place_name": "Evening Activity Name",
            "place_details": "Description...",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": 0, "longitude": 0 },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "Evening"
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
  // We expect 'isFinal' to be sent from the frontend when the user says "Yes, generate plan"
  const { messages, isFinal } = await req.json();
  const user = await currentUser();
  const { has } = await auth();
  const hasPremiumAccess = has({ plan: 'monthly' });
  console.log("hasPremiumAccess", hasPremiumAccess)
  const decision = await aj.protect(req, { userId: user?.primaryEmailAddress?.emailAddress ?? '', requested: isFinal ? 5 : 0 });

  //@ts-ignore
  if (decision?.reason?.remaining == 0 && !hasPremiumAccess) {
    return NextResponse.json({
      resp: 'Your Daily Limit reached(No Free Credit remaining) !',
      ui: 'limit'
    })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          // Dynamically switch prompt based on 'isFinal' flag
          content: isFinal ? FINAL_PROMPT : PROMPT
        },
        ...messages
      ],
      // Force JSON mode
      response_format: { type: 'json_object' },
      temperature: 0.7,
      // 🛠️ FIX 1: Increase token limit significantly. 
      // A full itinerary + 3 hotels uses a lot of tokens. If this is too low, the JSON cuts off.
      max_tokens: 8000,
    });

    let messageContent = completion.choices[0].message.content;

    // Debugging log
    console.log("AI Raw Response (isFinal: " + isFinal + "):", messageContent);

    if (!messageContent) {
      throw new Error("No content received from AI");
    }

    // 🛠️ FIX 2: Sanitize the output before parsing
    // Sometimes AI adds ```json at the start even in JSON mode. We must remove it.
    messageContent = messageContent.replace(/```json/g, "").replace(/```/g, "").trim();

    // 🛠️ FIX 3: Safe Parsing
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