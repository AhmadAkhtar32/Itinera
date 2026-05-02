"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Lock,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Wallet,
} from "lucide-react";

export default function PartnerEarningsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isPartner =
    currentUser?.role === "agency" ||
    currentUser?.role === "collaborator" ||
    currentUser?.role === "admin";

  const summary = useQuery(
    api.orders.getPartnerCommissionSummary,
    isPartner ? {} : "skip"
  );

  if (
    !isLoaded ||
    currentUser === undefined ||
    (isPartner && summary === undefined)
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading earnings...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Lock className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to view partner earnings.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!isPartner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Wallet className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Partner Access Required
          </h1>
          <p className="text-gray-600 mt-3">
            Only approved partners can view earnings.
          </p>

          <Link href="/partner">
            <Button className="mt-6">Go to Partner Program</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Wallet className="mx-auto text-yellow-500 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            No Partner Profile
          </h1>
          <p className="text-gray-600 mt-3">
            Your partner profile was not found.
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

  const { profile, stats, ledger } = summary;

  const defaultCurrency = ledger?.[0]?.currency || "PKR";

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/partner/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Partner Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Wallet size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Partner Portal
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              Earnings & Commission
            </h1>

            <p className="text-gray-600 mt-2">
              Track your revenue, Itinera commission, and payout status.
            </p>
          </div>

          <Link href="/partner/orders">
            <Button variant="outline">View Orders</Button>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-green-600" size={20} />
                <h2 className="text-2xl font-bold text-gray-950">
                  {profile.displayName}
                </h2>
              </div>

              <p className="text-gray-500 mt-2 capitalize">
                {profile.partnerType} partner • Commission rate:{" "}
                <span className="font-bold text-gray-900">
                  {profile.commissionRate}%
                </span>
              </p>
            </div>

            <span className="px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-100 text-sm font-bold uppercase inline-flex items-center gap-2 w-fit">
              <CheckCircle2 size={15} />
              {profile.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
          <StatCard
            title="Transactions"
            value={stats.totalTransactions}
            icon={<Receipt size={22} />}
          />

          <StatCard
            title="Gross Revenue"
            value={`${defaultCurrency} ${stats.totalGross.toLocaleString()}`}
            icon={<BarChart3 size={22} />}
          />

          <StatCard
            title="Itinera Commission"
            value={`${defaultCurrency} ${stats.totalCommission.toLocaleString()}`}
            icon={<ShieldCheck size={22} />}
          />

          <StatCard
            title="Total Earning"
            value={`${defaultCurrency} ${stats.totalPartnerEarning.toLocaleString()}`}
            icon={<Wallet size={22} />}
          />

          <StatCard
            title="Unpaid"
            value={`${defaultCurrency} ${stats.unpaidEarnings.toLocaleString()}`}
            icon={<Clock size={22} />}
          />

          <StatCard
            title="Paid"
            value={`${defaultCurrency} ${stats.paidEarnings.toLocaleString()}`}
            icon={<CheckCircle2 size={22} />}
          />
        </div>

        {ledger?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No earnings yet
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Earnings will appear here after users book your packages or buy
              your paid plans.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-950">
                Commission Ledger
              </h2>
              <p className="text-gray-500 mt-1">
                Each row represents one marketplace order and its commission
                split.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Date
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Product Type
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Gross Amount
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Commission Rate
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Itinera Share
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Partner Earning
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Payout
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ledger?.map((entry: any) => (
                    <tr
                      key={entry._id}
                      className="border-b last:border-0 hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-700">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>

                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                          {entry.productType === "agency_package"
                            ? "Agency Package"
                            : "Paid Plan"}
                        </span>
                      </td>

                      <td className="p-4 font-bold text-gray-900">
                        {entry.currency} {entry.grossAmount.toLocaleString()}
                      </td>

                      <td className="p-4 text-gray-700">
                        {entry.commissionRate}%
                      </td>

                      <td className="p-4 text-blue-700 font-semibold">
                        {entry.currency}{" "}
                        {entry.platformCommission.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-700 font-semibold">
                        {entry.currency} {entry.partnerEarning.toLocaleString()}
                      </td>

                      <td className="p-4">
                        <PayoutBadge status={entry.payoutStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mt-8">
          <h3 className="font-bold text-blue-900">FYP Demo Note</h3>
          <p className="text-blue-800 text-sm mt-2 leading-relaxed">
            Payouts are dummy in this project. Admin can mark payout status as
            paid in the admin commission ledger later. This page demonstrates
            how platform commission and partner earnings are tracked.
          </p>
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
      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="text-xl font-bold text-gray-900 mt-2">{value}</h2>
    </div>
  );
}

function PayoutBadge({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase inline-flex items-center gap-1">
        <CheckCircle2 size={13} />
        Paid
      </span>
    );
  }

  return (
    <span className="px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-100 text-xs font-bold uppercase inline-flex items-center gap-1">
      <Clock size={13} />
      Unpaid
    </span>
  );
}