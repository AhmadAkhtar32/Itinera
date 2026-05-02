"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Package,
  PenLine,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Star,
  Wallet,
} from "lucide-react";

export default function PartnerDashboardPage() {
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const application = useQuery(
    api.partners.getMyApplication,
    isSignedIn ? {} : "skip"
  );

  const summary = useQuery(
    api.partners.getPartnerDashboardSummary,
    currentUser?.role === "agency" ||
      currentUser?.role === "collaborator" ||
      currentUser?.role === "admin"
      ? {}
      : "skip"
  );

  const isLoading =
    !isLoaded ||
    (isSignedIn && currentUser === undefined) ||
    ((currentUser?.role === "agency" ||
      currentUser?.role === "collaborator" ||
      currentUser?.role === "admin") &&
      summary === undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">
          Loading partner dashboard...
        </p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <ShieldCheck className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to access the partner dashboard.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Clock className="mx-auto text-yellow-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Profile not ready
          </h1>
          <p className="text-gray-600 mt-3">
            Your Itinera user profile is still being created. Refresh the page
            in a moment.
          </p>
        </div>
      </div>
    );
  }

  if (
    currentUser.role !== "agency" &&
    currentUser.role !== "collaborator" &&
    currentUser.role !== "admin"
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Partner Access Required
          </h1>

          {application?.status === "pending" ? (
            <p className="text-gray-600 mt-3">
              Your partner application is still pending admin approval.
            </p>
          ) : (
            <p className="text-gray-600 mt-3">
              You need an approved partner application to access this dashboard.
            </p>
          )}

          <div className="flex justify-center gap-3 mt-6">
            <Link href="/partner/application-status">
              <Button variant="outline">View Status</Button>
            </Link>
            <Link href="/partner/apply">
              <Button>Apply Now</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!summary?.profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Clock className="mx-auto text-yellow-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Partner Profile Missing
          </h1>
          <p className="text-gray-600 mt-3">
            Your role is partner, but no partner profile was found. Ask admin to
            review your account.
          </p>
          <Link href="/partner/application-status">
            <Button className="mt-6" variant="outline">
              View Application Status
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile, stats } = summary;
  const isAgency = profile.partnerType === "agency";

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex gap-5 items-start">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                  isAgency
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {isAgency ? <Building2 size={34} /> : <PenLine size={34} />}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-950">
                    {profile.displayName}
                  </h1>

                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase inline-flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    {profile.status}
                  </span>

                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                    {profile.partnerType}
                  </span>
                </div>

                <p className="text-gray-600 mt-3 max-w-3xl leading-relaxed">
                  {profile.bio}
                </p>

                <p className="text-sm text-gray-400 mt-3">
                  {profile.city || "No city"}, {profile.country || "No country"}{" "}
                  • Commission rate:{" "}
                  <span className="font-bold text-gray-700">
                    {profile.commissionRate}%
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {isAgency ? (
                <Link href="/partner/packages/new">
                  <Button>
                    <PlusCircle className="mr-2" size={16} />
                    Add Package
                  </Button>
                </Link>
              ) : (
                <Link href="/partner/plans/new">
                  <Button>
                    <PlusCircle className="mr-2" size={16} />
                    Add Paid Plan
                  </Button>
                </Link>
              )}

              <Link href={isAgency ? "/partner/packages" : "/partner/plans"}>
                <Button variant="outline">
                  Manage {isAgency ? "Packages" : "Plans"}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Sales"
            value={stats.totalSales}
            icon={<ShoppingBag size={22} />}
          />

          <StatCard
            title="Total Revenue"
            value={`PKR ${stats.totalRevenue.toLocaleString()}`}
            icon={<BarChart3 size={22} />}
          />

          <StatCard
            title="Itinera Commission"
            value={`PKR ${stats.totalCommission.toLocaleString()}`}
            icon={<Wallet size={22} />}
          />

          <StatCard
            title="Partner Earnings"
            value={`PKR ${stats.partnerEarnings.toLocaleString()}`}
            icon={<Wallet size={22} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Link
            href={isAgency ? "/partner/packages" : "/partner/plans"}
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Package size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Manage {isAgency ? "Packages" : "Plans"}
            </h2>
            <p className="text-gray-600 mt-2">
              Create, edit, and manage your marketplace{" "}
              {isAgency ? "travel packages" : "paid travel plans"}.
            </p>
          </Link>

          <Link
            href="/partner/orders"
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Orders</h2>
            <p className="text-gray-600 mt-2">
              View customer bookings, purchases, and order statuses.
            </p>
          </Link>

          <Link
            href="/partner/earnings"
            className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
              <Wallet size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Earnings</h2>
            <p className="text-gray-600 mt-2">
              Track total revenue, Itinera commission, and your earnings.
            </p>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mt-6">
          <div className="flex items-center gap-3">
            <Star className="text-yellow-500" />
            <div>
              <h2 className="font-bold text-gray-900">Public Rating</h2>
              <p className="text-gray-600 text-sm">
                Current rating:{" "}
                <span className="font-bold">
                  {stats.ratingAvg || 0} / 5
                </span>{" "}
                from{" "}
                <span className="font-bold">{stats.ratingCount || 0}</span>{" "}
                reviews.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
    </div>
  );
}