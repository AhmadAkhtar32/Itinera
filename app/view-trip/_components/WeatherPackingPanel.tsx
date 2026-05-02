"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  CloudSun,
  Loader2,
  Luggage,
  FileCheck2,
  AlertTriangle,
  Umbrella,
  Shirt,
  Wind,
} from "lucide-react";

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

type WeatherResponse = {
  success: boolean;
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  days: WeatherDay[];
};

function parseDurationDays(duration: string | undefined) {
  if (!duration) return 5;

  const lower = String(duration).toLowerCase();

  const numberMatch = lower.match(/\d+/);
  const number = numberMatch ? Number(numberMatch[0]) : 5;

  if (lower.includes("week")) return Math.min(number * 7, 7);

  return Math.min(Math.max(number, 1), 7);
}

function getPackingSuggestions(weatherDays: WeatherDay[]) {
  const items = new Set<string>();

  items.add("Phone charger and power bank");
  items.add("Comfortable walking shoes");
  items.add("Reusable water bottle");
  items.add("Basic medicines and first-aid items");
  items.add("Toiletries and personal hygiene items");
  items.add("Small backpack for daily sightseeing");

  const maxTemps = weatherDays
    .map((day) => day.tempMax)
    .filter((temp): temp is number => typeof temp === "number");

  const minTemps = weatherDays
    .map((day) => day.tempMin)
    .filter((temp): temp is number => typeof temp === "number");

  const highestTemp = maxTemps.length ? Math.max(...maxTemps) : 25;
  const lowestTemp = minTemps.length ? Math.min(...minTemps) : 15;

  const rainy = weatherDays.some(
    (day) =>
      (day.rainProbability ?? 0) >= 45 ||
      (day.rainSum ?? 0) >= 1 ||
      day.condition.toLowerCase().includes("rain")
  );

  const windy = weatherDays.some((day) => (day.windMax ?? 0) >= 25);

  if (highestTemp >= 30) {
    items.add("Light cotton clothes");
    items.add("Sunglasses");
    items.add("Sunscreen");
    items.add("Cap or sun hat");
  }

  if (lowestTemp <= 18) {
    items.add("Light jacket or hoodie");
  }

  if (lowestTemp <= 10) {
    items.add("Warm jacket");
    items.add("Thermal innerwear");
    items.add("Warm socks and gloves");
  }

  if (rainy) {
    items.add("Umbrella or raincoat");
    items.add("Waterproof shoes or sandals");
    items.add("Plastic zip bags for electronics");
  }

  if (windy) {
    items.add("Windbreaker jacket");
  }

  return Array.from(items);
}

function getDocumentChecklist(country: string | undefined) {
  const isPakistan =
    !country || country.toLowerCase().includes("pakistan");

  if (isPakistan) {
    return [
      "CNIC or valid government ID",
      "Hotel booking confirmation",
      "Transport tickets or booking proof",
      "Emergency contact numbers",
      "Student card, if discounts are available",
      "Cash and digital wallet access",
    ];
  }

  return [
    "Valid passport",
    "Visa or entry permit, if required",
    "Flight tickets or transport booking proof",
    "Hotel booking confirmation",
    "Travel insurance document",
    "Emergency contact numbers",
    "International debit/credit card or travel cash",
    "Copies of passport, visa, and important documents",
  ];
}

function getTravelWarnings(weatherDays: WeatherDay[]) {
  const warnings: string[] = [];

  const rainyDays = weatherDays.filter(
    (day) => (day.rainProbability ?? 0) >= 60 || (day.rainSum ?? 0) >= 3
  );

  const stormDays = weatherDays.filter((day) =>
    day.condition.toLowerCase().includes("thunderstorm")
  );

  const hotDays = weatherDays.filter((day) => (day.tempMax ?? 0) >= 35);
  const coldDays = weatherDays.filter((day) => (day.tempMin ?? 99) <= 5);

  if (rainyDays.length > 0) {
    warnings.push("Rain is possible during your trip. Keep flexible outdoor plans.");
  }

  if (stormDays.length > 0) {
    warnings.push("Thunderstorm risk detected. Avoid hiking or exposed viewpoints during storms.");
  }

  if (hotDays.length > 0) {
    warnings.push("High temperature expected. Stay hydrated and avoid peak afternoon heat.");
  }

  if (coldDays.length > 0) {
    warnings.push("Very cold conditions expected. Pack warm layers.");
  }

  return warnings;
}

export default function WeatherPackingPanel({ tripDetail }: { tripDetail: any }) {
  const destination = tripDetail?.destination;
  const duration = tripDetail?.duration;

  const days = useMemo(() => parseDurationDays(duration), [duration]);

  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  useEffect(() => {
    const fetchWeather = async () => {
      if (!destination) return;

      try {
        setLoading(true);
        setWeatherError("");

        const response = await fetch(
          `/api/trip-weather?destination=${encodeURIComponent(
            destination
          )}&days=${days}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Failed to load weather.");
        }

        setWeather(data);
      } catch (error: any) {
        console.error("Weather fetch failed:", error);
        setWeatherError(error?.message || "Weather unavailable.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [destination, days]);

  const packingItems = useMemo(
    () => getPackingSuggestions(weather?.days ?? []),
    [weather]
  );

  const documents = useMemo(
    () => getDocumentChecklist(weather?.location?.country),
    [weather]
  );

  const warnings = useMemo(
    () => getTravelWarnings(weather?.days ?? []),
    [weather]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CloudSun size={24} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-950">
              Weather on Trip Days
            </h2>
            <p className="text-gray-500 text-sm">
              Forecast for {destination}. Day 1 starts from today.
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="animate-spin" size={20} />
            <span>Fetching destination weather...</span>
          </div>
        )}

        {!loading && weatherError && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-red-700 flex gap-3">
            <AlertTriangle size={20} className="shrink-0" />
            <p>{weatherError}</p>
          </div>
        )}

        {!loading && weather && (
          <>
            <div className="mb-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-blue-900 font-bold">
                {weather.location.name}, {weather.location.country}
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Showing up to 7 forecast days because live forecast APIs have a
                limited forecast window.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {weather.days.map((day, index) => (
                <div
                  key={day.date}
                  className="border border-gray-100 rounded-2xl p-4 bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                        Day {index + 1}
                      </p>
                      <p className="font-bold text-gray-900">
                        {new Date(day.date).toLocaleDateString()}
                      </p>
                    </div>

                    <span className="text-3xl">{day.emoji}</span>
                  </div>

                  <p className="font-semibold text-gray-800 mt-3">
                    {day.condition}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                    <WeatherMini label="High" value={`${day.tempMax ?? "-"}°C`} />
                    <WeatherMini label="Low" value={`${day.tempMin ?? "-"}°C`} />
                    <WeatherMini
                      label="Rain"
                      value={`${day.rainProbability ?? 0}%`}
                    />
                    <WeatherMini
                      label="Wind"
                      value={`${day.windMax ?? "-"} km/h`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-yellow-600" />
            <h2 className="text-xl font-bold text-yellow-900">
              Weather Travel Alerts
            </h2>
          </div>

          <ul className="space-y-2">
            {warnings.map((warning, index) => (
              <li key={index} className="text-yellow-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Luggage size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-950">
                Smart Packing List
              </h2>
              <p className="text-gray-500 text-sm">
                Suggested from destination weather.
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {packingItems.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3 text-gray-700"
              >
                {item.toLowerCase().includes("rain") ||
                item.toLowerCase().includes("umbrella") ? (
                  <Umbrella className="text-blue-600 shrink-0" size={18} />
                ) : item.toLowerCase().includes("jacket") ||
                  item.toLowerCase().includes("clothes") ? (
                  <Shirt className="text-indigo-600 shrink-0" size={18} />
                ) : item.toLowerCase().includes("wind") ? (
                  <Wind className="text-gray-600 shrink-0" size={18} />
                ) : (
                  <Luggage className="text-indigo-600 shrink-0" size={18} />
                )}

                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
              <FileCheck2 size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-950">
                Document Check
              </h2>
              <p className="text-gray-500 text-sm">
                Basic checklist for your destination.
              </p>
            </div>
          </div>

          <ul className="space-y-3">
            {documents.map((item, index) => (
              <li
                key={index}
                className="flex gap-3 bg-gray-50 border border-gray-100 rounded-2xl p-3 text-gray-700"
              >
                <FileCheck2 className="text-green-600 shrink-0" size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function WeatherMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3">
      <p className="text-xs text-gray-400 uppercase font-bold">{label}</p>
      <p className="font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}