import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'X-Google-API-KEY': process?.env?.GOOGLE_PLACE_API_KEY,

        }
    }
}