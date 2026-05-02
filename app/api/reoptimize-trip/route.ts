import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN,
});

const REOPTIMIZER_PROMPT = `
You are Itinera, an expert AI Trip Re-Optimizer.

You will receive:
1. An existing trip JSON
2. A user's optimization instruction

Your task:
- Keep the same JSON structure as the original trip.
- Improve the itinerary according to the user's instruction.
- Keep destination, origin, duration, budget, and group_size unless the user explicitly asks to change them.
- Improve hotels, itinerary, activities, timing, and travel notes where useful.
- If user asks for cheaper trip, reduce paid activities and suggest budget hotels.
- If user asks for family friendly trip, reduce risky activities and add safer attractions.
- If user asks for rainy-day backup, add indoor alternatives.
- If user asks to reduce walking, choose nearby activities and shorter routes.
- If user asks for food-focused trip, add food stops and local cuisine suggestions.
- Do not add markdown.
- Do not add explanation outside JSON.
- Return only valid JSON.

Required output JSON shape:
{
  "budget": "string",
  "destination": "string",
  "duration": "string",
  "group_size": "string",
  "origin": "string",
  "hotels": [
    {
      "hotel_name": "string",
      "hotel_address": "string",
      "price_per_night": "string",
      "hotel_image_url": "string",
      "geo_coordinates": {
        "latitude": number,
        "longitude": number
      },
      "rating": number,
      "description": "string"
    }
  ],
  "itinerary": [
    {
      "day": number,
      "day_plan": "string",
      "best_time_to_visit_day": "string",
      "activities": [
        {
          "place_name": "string",
          "place_details": "string",
          "place_image_url": "string",
          "geo_coordinates": {
            "latitude": number,
            "longitude": number
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
`;

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("AI response did not contain valid JSON.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in first." },
      { status: 401 }
    );
  }

  try {
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json(
        {
          error:
            "GITHUB_TOKEN is missing. Add it to your .env.local before using AI re-optimization.",
        },
        { status: 500 }
      );
    }

    const { tripDetail, instruction } = await req.json();

    if (!tripDetail) {
      return NextResponse.json(
        { error: "tripDetail is required." },
        { status: 400 }
      );
    }

    if (!instruction || String(instruction).trim().length < 5) {
      return NextResponse.json(
        { error: "Please provide a proper optimization instruction." },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: REOPTIMIZER_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify({
            existingTrip: tripDetail,
            optimizationInstruction: instruction,
          }),
        },
      ],
      temperature: 0.7,
    });

    const rawText = response.choices[0]?.message?.content ?? "";
    const jsonText = extractJson(rawText);
    const optimizedTrip = JSON.parse(jsonText);

    return NextResponse.json({
      success: true,
      optimizedTrip,
    });
  } catch (error: any) {
    console.error("Trip re-optimization failed:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to re-optimize trip. Please try again.",
      },
      { status: 500 }
    );
  }
}