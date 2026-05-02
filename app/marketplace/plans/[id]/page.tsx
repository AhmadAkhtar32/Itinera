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
  FileText,
  Loader2,
  Lock,
  MapPin,
  PenLine,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tags,
} from "lucide-react";

export default function PlanDetailPage() {
  const params = useParams();
  const planId = params.id as string;

  const planData = useQuery(
    api.marketplace.getPlanById,
    planId ? { planId: planId as any } : "skip"
  );

  if (planData === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading plan details...</p>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Plan Not Available
          </h1>
          <p className="text-gray-600 mt-3">
            This plan does not exist, is not published, or has been removed.
          </p>

          <Link href="/marketplace">
            <Button className="mt-6">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const tags = Array.isArray(planData.tags) ? planData.tags : [];
  const lockedPlanLines = Array.isArray(planData.fullPlan)
    ? planData.fullPlan
    : [];

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Marketplace
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="h-[360px] bg-orange-50 overflow-hidden">
                {planData.coverImage ? (
                  <img
                    src={planData.coverImage}
                    alt={planData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-orange-500">
                    <PenLine size={80} />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold uppercase">
                    Paid Travel Plan
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase inline-flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Admin Verified
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-950 leading-tight">
                  {planData.title}
                </h1>

                <div className="flex flex-wrap gap-5 text-gray-600 mt-5">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-orange-600" />
                    <span>{planData.destination}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-orange-600" />
                    <span>{planData.durationDays} days</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span>
                      {planData.ratingAvg ?? 0} / 5 (
                      {planData.ratingCount ?? 0} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mt-6 leading-relaxed text-lg">
                  {planData.previewText}
                </p>

                {tags.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Tags size={18} className="text-orange-600" />
                      <h3 className="font-bold text-gray-900">Tags</h3>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Lock size={24} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-950">
                    Full Plan Content
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Purchase this plan to unlock the complete itinerary and
                    travel guide.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {lockedPlanLines.slice(0, 4).map((line: string, index: number) => (
                  <div
                    key={index}
                    className="relative overflow-hidden bg-gray-50 border border-gray-100 rounded-2xl p-4"
                  >
                    <p className="text-gray-400 blur-[3px] select-none">
                      {line}
                    </p>
                    <div className="absolute inset-0 bg-white/40" />
                  </div>
                ))}

                {lockedPlanLines.length === 0 && (
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    <p className="text-gray-400 blur-[3px] select-none">
                      Full paid plan content will appear here after purchase.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-5">
                <h3 className="font-bold text-orange-900">
                  What you unlock after purchase
                </h3>
                <ul className="mt-3 space-y-2 text-orange-800 text-sm">
                  <li>• Complete day-wise travel plan</li>
                  <li>• Budget tips and planning notes</li>
                  <li>• Destination-specific recommendations</li>
                  <li>• Hidden gems, food suggestions, and travel hacks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right purchase card */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sticky top-24">
              <div className="border-b border-gray-100 pb-5 mb-5">
                <p className="text-sm text-gray-500 font-bold uppercase">
                  Plan Price
                </p>
                <h2 className="text-4xl font-bold text-gray-950 mt-1">
                  {planData.currency} {planData.price?.toLocaleString()}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Dummy payment will be used for FYP demo.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <InfoRow label="Destination" value={planData.destination} />
                <InfoRow
                  label="Duration"
                  value={`${planData.durationDays} days`}
                />
                <InfoRow
                  label="Creator"
                  value={planData.partner?.displayName || "Travel Creator"}
                />
                <InfoRow
                  label="Purchases"
                  value={String(planData.purchaseCount ?? 0)}
                />
              </div>

              <Link href={`/checkout/plan/${planData._id}`}>
                <Button className="w-full h-12 text-base">
                  <ShoppingCart className="mr-2" size={18} />
                  Buy Plan
                </Button>
              </Link>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Purchase and payment are dummy for project evaluation.
                Commission will be calculated after checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 text-right">{value}</p>
    </div>
  );
}