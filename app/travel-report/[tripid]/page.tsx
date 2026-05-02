"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Hotel,
  Loader2,
  MapPin,
  Plane,
  Printer,
  Users,
  Wallet,
} from "lucide-react";

export default function TravelReportPage() {
  const params = useParams();
  const tripid = params.tripid as string;

  const tripData = useQuery(
    api.tripDetail.GetPublicTripById,
    tripid ? { tripid } : "skip"
  );

  if (tripData === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading travel report...</p>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Plane className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Report Not Available
          </h1>
          <p className="text-gray-600 mt-3">
            This trip does not exist, is private, or you do not have permission
            to view it.
          </p>

          <Link href="/my-trips">
            <Button className="mt-6">Back to My Trips</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trip = tripData.tripDetail;
  const hotels = Array.isArray(trip?.hotels) ? trip.hotels : [];
  const itinerary = Array.isArray(trip?.itinerary) ? trip.itinerary : [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 print:bg-white">
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .print-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            max-width: 100% !important;
          }

          .page-break {
            page-break-before: always;
          }
        }
      `}</style>

      <div className="no-print max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href={`/view-trip/${tripid}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Back to Trip
        </Link>

        <Button onClick={handlePrint}>
          <Printer className="mr-2" size={16} />
          Print / Save as PDF
        </Button>
      </div>

      <main className="print-page max-w-5xl mx-auto bg-white shadow-xl border border-gray-200 rounded-3xl overflow-hidden mb-10">
        {/* Cover */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10">
          <div className="flex items-center gap-3 mb-8">
            <Plane size={34} />
            <div>
              <h2 className="text-2xl font-bold">Itinera</h2>
              <p className="text-blue-100">AI Trip Architect</p>
            </div>
          </div>

          <p className="text-blue-100 font-semibold uppercase tracking-wider">
            Travel Report
          </p>

          <h1 className="text-5xl font-bold mt-3 leading-tight">
            {trip?.destination || "Your Trip"}
          </h1>

          <p className="text-blue-100 mt-4 text-lg">
            Generated itinerary report with hotels, daily plan, activities, and
            travel essentials.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
            <SummaryBox
              icon={<MapPin size={20} />}
              label="Origin"
              value={trip?.origin || "Not specified"}
            />

            <SummaryBox
              icon={<CalendarDays size={20} />}
              label="Duration"
              value={trip?.duration || "Not specified"}
            />

            <SummaryBox
              icon={<Users size={20} />}
              label="Group"
              value={trip?.group_size || "Not specified"}
            />

            <SummaryBox
              icon={<Wallet size={20} />}
              label="Budget"
              value={trip?.budget || "Not specified"}
            />
          </div>
        </section>

        {/* Trip Summary */}
        <section className="p-10">
          <h2 className="text-3xl font-bold text-gray-950 mb-5">
            Trip Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoCard label="Destination" value={trip?.destination} />
            <InfoCard label="Starting Point" value={trip?.origin} />
            <InfoCard label="Duration" value={trip?.duration} />
            <InfoCard label="Travel Group" value={trip?.group_size} />
            <InfoCard label="Budget Type" value={trip?.budget} />
            <InfoCard
              label="Report Date"
              value={new Date().toLocaleDateString()}
            />
          </div>
        </section>

        {/* Hotels */}
        <section className="p-10 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Hotel className="text-blue-600" size={28} />
            <h2 className="text-3xl font-bold text-gray-950">
              Recommended Hotels
            </h2>
          </div>

          {hotels.length === 0 ? (
            <p className="text-gray-500">No hotel recommendations available.</p>
          ) : (
            <div className="space-y-5">
              {hotels.map((hotel: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-2xl p-5 bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-bold text-gray-950">
                        {hotel.hotel_name || `Hotel ${index + 1}`}
                      </h3>

                      <p className="text-gray-600 mt-2">
                        {hotel.hotel_address || "Address not available"}
                      </p>

                      <p className="text-gray-700 mt-3 leading-relaxed">
                        {hotel.description || "No description available."}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-blue-700">
                        {hotel.price_per_night || "Price N/A"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Rating: {hotel.rating || 0}/5
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Itinerary */}
        <section className="p-10 border-t border-gray-100 page-break">
          <h2 className="text-3xl font-bold text-gray-950 mb-6">
            Day-wise Itinerary
          </h2>

          {itinerary.length === 0 ? (
            <p className="text-gray-500">No itinerary available.</p>
          ) : (
            <div className="space-y-8">
              {itinerary.map((day: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-100 rounded-3xl overflow-hidden"
                >
                  <div className="bg-blue-50 border-b border-blue-100 p-5">
                    <p className="text-sm font-bold uppercase tracking-wider text-blue-600">
                      Day {day.day || index + 1}
                    </p>

                    <h3 className="text-2xl font-bold text-gray-950 mt-1">
                      {day.day_plan || "Daily Plan"}
                    </h3>

                    {day.best_time_to_visit_day && (
                      <p className="text-gray-600 mt-2">
                        Best time: {day.best_time_to_visit_day}
                      </p>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {Array.isArray(day.activities) &&
                    day.activities.length > 0 ? (
                      day.activities.map((activity: any, activityIndex: number) => (
                        <div
                          key={activityIndex}
                          className="bg-gray-50 border border-gray-100 rounded-2xl p-4"
                        >
                          <div className="flex gap-4">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                              {activityIndex + 1}
                            </div>

                            <div>
                              <h4 className="font-bold text-gray-950">
                                {activity.place_name || "Activity"}
                              </h4>

                              <p className="text-gray-700 mt-2 leading-relaxed">
                                {activity.place_details ||
                                  "No details available."}
                              </p>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm text-gray-600">
                                <p>
                                  <span className="font-semibold">
                                    Address:
                                  </span>{" "}
                                  {activity.place_address || "N/A"}
                                </p>

                                <p>
                                  <span className="font-semibold">
                                    Ticket:
                                  </span>{" "}
                                  {activity.ticket_pricing || "N/A"}
                                </p>

                                <p>
                                  <span className="font-semibold">
                                    Travel time:
                                  </span>{" "}
                                  {activity.time_travel_each_location || "N/A"}
                                </p>

                                <p>
                                  <span className="font-semibold">
                                    Best time:
                                  </span>{" "}
                                  {activity.best_time_to_visit || "N/A"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No activities added.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Essentials */}
        <section className="p-10 border-t border-gray-100">
          <h2 className="text-3xl font-bold text-gray-950 mb-6">
            Travel Essentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChecklistCard
              title="General Packing"
              items={[
                "Phone charger and power bank",
                "Comfortable walking shoes",
                "Reusable water bottle",
                "Basic medicines and first-aid kit",
                "Toiletries and hygiene items",
                "Small backpack for daily sightseeing",
              ]}
            />

            <ChecklistCard
              title="Documents"
              items={[
                "CNIC or passport",
                "Hotel booking confirmation",
                "Transport ticket or booking proof",
                "Emergency contact numbers",
                "Cash or digital wallet access",
                "Copies of important documents",
              ]}
            />
          </div>
        </section>

        {/* Footer */}
        <section className="p-10 border-t border-gray-100 text-center">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xl">
            <Plane size={24} />
            Itinera
          </div>

          <p className="text-gray-500 mt-2">
            AI Trip Architect - Travel report generated for FYP demonstration.
          </p>
        </section>
      </main>

      <div className="no-print max-w-5xl mx-auto px-6 pb-10">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <Download className="text-blue-600 shrink-0" size={22} />
          <div>
            <h3 className="font-bold text-blue-900">
              How to export as PDF
            </h3>
            <p className="text-blue-800 text-sm mt-1">
              Click <b>Print / Save as PDF</b>, then choose <b>Save as PDF</b>{" "}
              from your browser print dialog.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white/10 border border-white/20 rounded-2xl p-4">
      <div className="text-white mb-2">{icon}</div>
      <p className="text-blue-100 text-xs uppercase font-bold">{label}</p>
      <p className="font-bold text-white mt-1">{value}</p>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border border-gray-100 bg-gray-50 rounded-2xl p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">
        {label}
      </p>
      <p className="font-bold text-gray-950 mt-1">
        {value || "Not specified"}
      </p>
    </div>
  );
}

function ChecklistCard({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <div className="border border-gray-100 bg-gray-50 rounded-2xl p-5">
      <h3 className="font-bold text-gray-950 mb-4">{title}</h3>

      <ul className="space-y-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3 text-gray-700">
            <span className="w-5 h-5 border border-gray-300 rounded-md shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}