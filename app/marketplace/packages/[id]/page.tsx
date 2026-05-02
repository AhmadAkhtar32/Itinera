"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import PublicReviews from "../../_components/PublicReviews";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Users,
  XCircle,
} from "lucide-react";

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;

  const packageData = useQuery(
    api.marketplace.getPackageById,
    packageId ? { packageId: packageId as any } : "skip"
  );

  if (packageData === undefined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading package details...</p>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Package className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Package Not Available
          </h1>
          <p className="text-gray-600 mt-3">
            This package does not exist, is not published, or has been removed.
          </p>

          <Link href="/marketplace">
            <Button className="mt-6">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const itinerary = Array.isArray(packageData.itinerary)
    ? packageData.itinerary
    : [];

  const inclusions = Array.isArray(packageData.inclusions)
    ? packageData.inclusions
    : [];

  const exclusions = Array.isArray(packageData.exclusions)
    ? packageData.exclusions
    : [];

  const gallery = Array.isArray(packageData.gallery)
    ? packageData.gallery
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
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="h-[360px] bg-indigo-50 overflow-hidden">
                {packageData.coverImage ? (
                  <img
                    src={packageData.coverImage}
                    alt={packageData.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-indigo-500">
                    <Building2 size={80} />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold uppercase">
                    Agency Package
                  </span>

                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase inline-flex items-center gap-1">
                    <ShieldCheck size={13} />
                    Admin Verified
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-950 leading-tight">
                  {packageData.title}
                </h1>

                <div className="flex flex-wrap gap-5 text-gray-600 mt-5">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    <span>
                      {packageData.origin
                        ? `${packageData.origin} → ${packageData.destination}`
                        : packageData.destination}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} className="text-blue-600" />
                    <span>{packageData.durationDays} days</span>
                  </div>

                  {packageData.groupSize && (
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-blue-600" />
                      <span>{packageData.groupSize}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span>
                      {packageData.ratingAvg ?? 0} / 5 (
                      {packageData.ratingCount ?? 0} reviews)
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mt-6 leading-relaxed text-lg">
                  {packageData.description}
                </p>
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-950 mb-5">
                  Gallery
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gallery.map((imageUrl: string, index: number) => (
                    <div
                      key={index}
                      className="h-44 rounded-2xl bg-gray-100 overflow-hidden"
                    >
                      <img
                        src={imageUrl}
                        alt={`Package gallery ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-950 mb-5">
                Day-wise Itinerary
              </h2>

              {itinerary.length === 0 ? (
                <p className="text-gray-500">No itinerary added.</p>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((item: string, index: number) => (
                    <div
                      key={index}
                      className="flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ListCard title="Inclusions" type="include" items={inclusions} />

              <ListCard title="Exclusions" type="exclude" items={exclusions} />
            </div>

            {packageData.terms && (
              <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
                <h2 className="text-2xl font-bold text-gray-950 mb-4">
                  Terms & Conditions
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {packageData.terms}
                </p>
              </div>
            )}

            <PublicReviews productType="package" productId={packageData._id} />
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sticky top-24">
              <div className="border-b border-gray-100 pb-5 mb-5">
                <p className="text-sm text-gray-500 font-bold uppercase">
                  Package Price
                </p>
                <h2 className="text-4xl font-bold text-gray-950 mt-1">
                  {packageData.currency} {packageData.price?.toLocaleString()}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Dummy payment will be used for FYP demo.
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <InfoRow label="Destination" value={packageData.destination} />
                <InfoRow
                  label="Duration"
                  value={`${packageData.durationDays} days`}
                />
                <InfoRow
                  label="Partner"
                  value={packageData.partner?.displayName || "Agency Partner"}
                />
                <InfoRow
                  label="Purchases"
                  value={String(packageData.purchaseCount ?? 0)}
                />
              </div>

              <Link href={`/checkout/package/${packageData._id}`}>
                <Button className="w-full h-12 text-base">
                  <ShoppingCart className="mr-2" size={18} />
                  Book Package
                </Button>
              </Link>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Booking and payment are dummy for project evaluation. Commission
                will be calculated after checkout.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function ListCard({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "include" | "exclude";
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-950 mb-5">{title}</h2>

      {items.length === 0 ? (
        <p className="text-gray-500">No items added.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex gap-3 text-gray-700">
              {type === "include" ? (
                <CheckCircle2
                  size={19}
                  className="text-green-600 shrink-0 mt-0.5"
                />
              ) : (
                <XCircle
                  size={19}
                  className="text-red-500 shrink-0 mt-0.5"
                />
              )}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
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