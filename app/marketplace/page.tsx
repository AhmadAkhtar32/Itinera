"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Building2,
  CalendarDays,
  Loader2,
  MapPin,
  Package,
  PenLine,
  Search,
  Star,
} from "lucide-react";

type ActiveTab = "all" | "packages" | "plans";

export default function MarketplacePage() {
  const packages = useQuery(api.marketplace.getPublishedPackages, {});
  const plans = useQuery(api.marketplace.getPublishedPlans, {});

  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const isLoading = packages === undefined || plans === undefined;

  const filteredPackages = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return (packages ?? []).filter((item: any) => {
      if (activeTab === "plans") return false;

      if (!term) return true;

      return (
        item.title?.toLowerCase().includes(term) ||
        item.destination?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term)
      );
    });
  }, [packages, searchTerm, activeTab]);

  const filteredPlans = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return (plans ?? []).filter((item: any) => {
      if (activeTab === "packages") return false;

      if (!term) return true;

      return (
        item.title?.toLowerCase().includes(term) ||
        item.destination?.toLowerCase().includes(term) ||
        item.previewText?.toLowerCase().includes(term) ||
        item.tags?.some((tag: string) => tag.toLowerCase().includes(term))
      );
    });
  }, [plans, searchTerm, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading marketplace...</p>
      </div>
    );
  }

  const totalResults = filteredPackages.length + filteredPlans.length;

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold mb-5">
              <Package size={16} />
              Itinera Marketplace
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-950 leading-tight">
              Book agency packages and buy expert travel plans.
            </h1>

            <p className="text-gray-600 text-lg mt-5 leading-relaxed">
              Explore verified travel agency packages and paid itinerary guides
              created by approved Itinera partners.
            </p>
          </div>

          <div className="mt-8 max-w-2xl relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destination, package, plan, or tag..."
              className="w-full border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-blue-500 bg-white shadow-sm"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "all"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setActiveTab("packages")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "packages"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Agency Packages
            </button>

            <button
              onClick={() => setActiveTab("plans")}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                activeTab === "plans"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Paid Plans
            </button>
          </div>

          <p className="text-gray-500 font-medium">
            {totalResults} result{totalResults === 1 ? "" : "s"} found
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <Search className="mx-auto text-gray-400 mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900">
              No marketplace items found
            </h2>
            <p className="text-gray-500 mt-2">
              Published agency packages and collaborator plans will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredPackages.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Building2 className="text-indigo-600" size={22} />
                  <h2 className="text-2xl font-bold text-gray-950">
                    Agency Packages
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((item: any) => (
                    <PackageCard key={item._id} item={item} />
                  ))}
                </div>
              </section>
            )}

            {filteredPlans.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <PenLine className="text-orange-600" size={22} />
                  <h2 className="text-2xl font-bold text-gray-950">
                    Paid Travel Plans
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map((item: any) => (
                    <PlanCard key={item._id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PackageCard({ item }: { item: any }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="h-48 bg-indigo-50 overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-500">
            <Building2 size={48} />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-bold uppercase">
            Agency Package
          </span>

          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={15} className="fill-yellow-500" />
            <span className="text-sm font-bold text-gray-700">
              {item.ratingAvg ?? 0}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-950 line-clamp-2">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-gray-500 mt-3 text-sm">
          <MapPin size={16} />
          <span>{item.destination}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
          <CalendarDays size={16} />
          <span>{item.durationDays} days</span>
        </div>

        <p className="text-gray-600 mt-4 line-clamp-3">
          {item.description}
        </p>

        <div className="flex items-center justify-between mt-5">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Price
            </p>
            <p className="text-xl font-bold text-gray-950">
              {item.currency} {item.price?.toLocaleString()}
            </p>
          </div>

          <Link href={`/marketplace/packages/${item._id}`}>
            <Button>View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ item }: { item: any }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="h-48 bg-orange-50 overflow-hidden">
        {item.coverImage ? (
          <img
            src={item.coverImage}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-orange-500">
            <PenLine size={48} />
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100 text-xs font-bold uppercase">
            Paid Plan
          </span>

          <div className="flex items-center gap-1 text-yellow-500">
            <Star size={15} className="fill-yellow-500" />
            <span className="text-sm font-bold text-gray-700">
              {item.ratingAvg ?? 0}
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-950 line-clamp-2">
          {item.title}
        </h3>

        <div className="flex items-center gap-2 text-gray-500 mt-3 text-sm">
          <MapPin size={16} />
          <span>{item.destination}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-500 mt-2 text-sm">
          <CalendarDays size={16} />
          <span>{item.durationDays} days</span>
        </div>

        <p className="text-gray-600 mt-4 line-clamp-3">
          {item.previewText}
        </p>

        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {item.tags.slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-5">
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">
              Price
            </p>
            <p className="text-xl font-bold text-gray-950">
              {item.currency} {item.price?.toLocaleString()}
            </p>
          </div>

          <Link href={`/marketplace/plans/${item._id}`}>
            <Button>View Details</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}