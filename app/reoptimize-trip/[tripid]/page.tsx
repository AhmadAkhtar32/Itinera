"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Sparkles,
  Wand2,
  AlertTriangle,
  MapPin,
  CalendarDays,
  Users,
  Wallet,
} from "lucide-react";

const presetPrompts = [
  "Make this trip cheaper and budget-friendly.",
  "Add rainy-day indoor alternatives.",
  "Make this trip family friendly.",
  "Reduce walking and travel time between places.",
  "Optimize this trip for food and local experiences.",
  "Add more relaxing time and avoid a rushed schedule.",
];

function parseTripDetail(raw: any) {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  return raw;
}

function createNewTripId() {
  return `reopt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ReOptimizeTripPage() {
  const params = useParams();
  const router = useRouter();

  const tripid = useMemo(() => {
    const rawTripId = params.tripid || params.tripId;

    if (Array.isArray(rawTripId)) {
      return rawTripId[0];
    }

    return rawTripId ? String(rawTripId) : "";
  }, [params]);

  const tripData = useQuery(
    api.reoptimizer.getTripForReOptimization,
    tripid ? { tripId: tripid } : "skip"
  );

  const saveReOptimizedTrip = useMutation(
    api.reoptimizer.saveReOptimizedTrip
  );

  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [optimizedTrip, setOptimizedTrip] = useState<any>(null);
  const [savedTripId, setSavedTripId] = useState("");

  const tripDetail = parseTripDetail(tripData?.tripDetail);

  const handleReOptimize = async () => {
    if (!instruction.trim() || instruction.trim().length < 5) {
      alert("Please write a proper optimization instruction.");
      return;
    }

    if (!tripDetail) {
      alert("Trip detail not found.");
      return;
    }

    try {
      setLoading(true);
      setOptimizedTrip(null);
      setSavedTripId("");

      const response = await fetch("/api/reoptimize-trip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tripDetail,
          instruction,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to re-optimize trip.");
      }

      const newTripId = createNewTripId();

      const saveResult = await saveReOptimizedTrip({
        originalTripId: tripid,
        newTripId,
        tripDetail: data.optimizedTrip,
        optimizationPrompt: instruction.trim(),
      });

      setOptimizedTrip(data.optimizedTrip);
      setSavedTripId(saveResult.tripId);

      alert("Trip re-optimized and saved successfully.");
    } catch (error: any) {
      console.error("Re-optimization failed:", error);
      alert(error?.message || "Failed to re-optimize trip.");
    } finally {
      setLoading(false);
    }
  };

  if (tripData === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading trip...</p>
      </div>
    );
  }

  if (!tripData || !tripDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <AlertTriangle className="mx-auto text-orange-500 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Trip Not Available
          </h1>
          <p className="text-gray-600 mt-3">
            This trip does not exist or you do not have permission to
            re-optimize it.
          </p>

          <Link href="/my-trips">
            <Button className="mt-6">Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const hotels = Array.isArray(tripDetail.hotels) ? tripDetail.hotels : [];
  const itinerary = Array.isArray(tripDetail.itinerary)
    ? tripDetail.itinerary
    : [];

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href={`/view-trip/${tripid}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Trip
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center gap-3 text-purple-600 mb-2">
              <Sparkles size={22} />
              <span className="text-sm font-bold uppercase tracking-wider">
                AI Trip Re-Optimizer
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              Improve Your Existing Trip
            </h1>

            <p className="text-gray-600 mt-3 max-w-3xl">
              Give Itinera an instruction, and it will generate a new optimized
              version of your saved itinerary while keeping the same trip
              structure.
            </p>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <InfoBox
              icon={<MapPin size={20} />}
              label="Destination"
              value={tripDetail.destination || "Not specified"}
            />

            <InfoBox
              icon={<CalendarDays size={20} />}
              label="Duration"
              value={tripDetail.duration || "Not specified"}
            />

            <InfoBox
              icon={<Wallet size={20} />}
              label="Budget"
              value={tripDetail.budget || "Not specified"}
            />

            <InfoBox
              icon={<Users size={20} />}
              label="Group Size"
              value={tripDetail.group_size || "Not specified"}
            />

            <InfoBox
              icon={<CheckCircle2 size={20} />}
              label="Hotels"
              value={`${hotels.length} suggested`}
            />

            <InfoBox
              icon={<CheckCircle2 size={20} />}
              label="Itinerary Days"
              value={`${itinerary.length} days`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-950 mb-3">
              What should AI improve?
            </h2>

            <p className="text-gray-600 mb-5">
              Choose a preset or write your own instruction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {presetPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInstruction(prompt)}
                  className={`text-left border rounded-2xl p-4 transition-all ${
                    instruction === prompt
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-100 bg-gray-50 hover:border-purple-200"
                  }`}
                >
                  <p className="font-medium text-gray-800">{prompt}</p>
                </button>
              ))}
            </div>

            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Example: Make this trip cheaper, reduce walking, and add rainy-day alternatives."
              className="min-h-[160px] resize-none"
            />

            <Button
              onClick={handleReOptimize}
              disabled={loading}
              className="mt-6 h-12"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Re-optimizing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={18} />
                  Generate Optimized Trip
                </>
              )}
            </Button>
          </section>

          <aside className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-950">
              How it works
            </h3>

            <ul className="mt-5 space-y-4 text-gray-700">
              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  1
                </span>
                AI reads your current saved itinerary.
              </li>

              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  2
                </span>
                It applies your optimization instruction.
              </li>

              <li className="flex gap-3">
                <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                  3
                </span>
                A new optimized trip is saved to your trips.
              </li>
            </ul>

            <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mt-6">
              <p className="text-yellow-800 text-sm">
                This creates a new trip copy. Your original trip stays safe and
                unchanged.
              </p>
            </div>
          </aside>
        </div>

        {optimizedTrip && savedTripId && (
          <div className="bg-green-50 border border-green-100 rounded-3xl p-8 mt-8">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-green-600 shrink-0" size={34} />

              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  Optimized Trip Saved
                </h2>

                <p className="text-green-800 mt-2">
                  Your new AI-optimized itinerary has been saved. You can now
                  open it and review the improved trip plan.
                </p>

                <Button
                  className="mt-5 bg-green-600 hover:bg-green-700"
                  onClick={() => router.push(`/view-trip/${savedTripId}`)}
                >
                  Open Optimized Trip
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50">
      <div className="text-purple-600 mb-3">{icon}</div>
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p className="font-bold text-gray-950 mt-1">{value}</p>
    </div>
  );
}