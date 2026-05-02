import { NextRequest, NextResponse } from "next/server";

type WeatherDay = {
  date: string;
  code: number;
  condition: string;
  emoji: string;
  tempMax: number | null;
  tempMin: number | null;
  rainProbability: number | null;
  rainSum: number | null;
  windMax: number | null;
};

function getWeatherCondition(code: number) {
  if (code === 0) return { condition: "Clear sky", emoji: "☀️" };
  if ([1, 2].includes(code)) return { condition: "Partly cloudy", emoji: "🌤️" };
  if (code === 3) return { condition: "Cloudy", emoji: "☁️" };
  if ([45, 48].includes(code)) return { condition: "Foggy", emoji: "🌫️" };
  if ([51, 53, 55, 56, 57].includes(code)) return { condition: "Drizzle", emoji: "🌦️" };
  if ([61, 63, 65, 66, 67].includes(code)) return { condition: "Rain", emoji: "🌧️" };
  if ([71, 73, 75, 77].includes(code)) return { condition: "Snow", emoji: "❄️" };
  if ([80, 81, 82].includes(code)) return { condition: "Rain showers", emoji: "🌦️" };
  if ([85, 86].includes(code)) return { condition: "Snow showers", emoji: "🌨️" };
  if ([95, 96, 99].includes(code)) return { condition: "Thunderstorm", emoji: "⛈️" };

  return { condition: "Mixed weather", emoji: "🌍" };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const destination = searchParams.get("destination");
    const daysParam = Number(searchParams.get("days") || "5");

    if (!destination) {
      return NextResponse.json(
        { error: "Destination is required." },
        { status: 400 }
      );
    }

    const forecastDays = Math.min(Math.max(daysParam, 1), 7);

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      destination
    )}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl, {
      cache: "no-store",
    });

    if (!geoResponse.ok) {
      throw new Error("Failed to geocode destination.");
    }

    const geoData = await geoResponse.json();

    const location = geoData?.results?.[0];

    if (!location) {
      return NextResponse.json(
        { error: "Could not find weather location for this destination." },
        { status: 404 }
      );
    }

    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${location.latitude}` +
      `&longitude=${location.longitude}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max` +
      `&timezone=auto` +
      `&forecast_days=${forecastDays}`;

    const weatherResponse = await fetch(weatherUrl, {
      cache: "no-store",
    });

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather forecast.");
    }

    const weatherData = await weatherResponse.json();
    const daily = weatherData.daily;

    const days: WeatherDay[] = (daily?.time || []).map(
      (date: string, index: number) => {
        const code = Number(daily.weather_code?.[index] ?? 0);
        const details = getWeatherCondition(code);

        return {
          date,
          code,
          condition: details.condition,
          emoji: details.emoji,
          tempMax: daily.temperature_2m_max?.[index] ?? null,
          tempMin: daily.temperature_2m_min?.[index] ?? null,
          rainProbability: daily.precipitation_probability_max?.[index] ?? null,
          rainSum: daily.precipitation_sum?.[index] ?? null,
          windMax: daily.wind_speed_10m_max?.[index] ?? null,
        };
      }
    );

    return NextResponse.json({
      success: true,
      location: {
        name: location.name,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
      },
      days,
    });
  } catch (error: any) {
    console.error("Trip weather route failed:", error);

    return NextResponse.json(
      {
        error: error?.message || "Failed to fetch trip weather.",
      },
      { status: 500 }
    );
  }
}