"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Ban,
  BarChart3,
  CheckCircle2,
  Clock,
  Loader2,
  Receipt,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
} from "lucide-react";

type ActiveTab = "orders" | "commission";

export default function AdminAnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");
  const [processingLedgerId, setProcessingLedgerId] = useState<string | null>(
    null
  );

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const orders = useQuery(api.orders.adminGetOrders, isAdmin ? {} : "skip");

  const ledger = useQuery(
    api.orders.adminGetCommissionLedger,
    isAdmin ? {} : "skip"
  );

  const markPayoutPaid = useMutation(api.orders.adminMarkPayoutPaid);

  const isLoading =
    !isLoaded ||
    (isSignedIn && currentUser === undefined) ||
    (isAdmin && (orders === undefined || ledger === undefined));

  const stats = useMemo(() => {
    const totalOrders = orders?.length ?? 0;

    const totalRevenue =
      orders?.reduce((sum: number, order: any) => sum + (order.amount ?? 0), 0) ??
      0;

    const totalCommission =
      orders?.reduce(
        (sum: number, order: any) => sum + (order.platformCommission ?? 0),
        0
      ) ?? 0;

    const totalPartnerEarnings =
      orders?.reduce(
        (sum: number, order: any) => sum + (order.partnerEarning ?? 0),
        0
      ) ?? 0;

    const unpaidPayouts =
      ledger
        ?.filter((entry: any) => entry.payoutStatus === "unpaid")
        ?.reduce(
          (sum: number, entry: any) => sum + (entry.partnerEarning ?? 0),
          0
        ) ?? 0;

    const paidPayouts =
      ledger
        ?.filter((entry: any) => entry.payoutStatus === "paid")
        ?.reduce(
          (sum: number, entry: any) => sum + (entry.partnerEarning ?? 0),
          0
        ) ?? 0;

    return {
      totalOrders,
      totalRevenue,
      totalCommission,
      totalPartnerEarnings,
      unpaidPayouts,
      paidPayouts,
    };
  }, [orders, ledger]);

  const handleMarkPaid = async (ledgerId: string) => {
    if (!window.confirm("Mark this partner payout as paid?")) return;

    try {
      setProcessingLedgerId(ledgerId);

      await markPayoutPaid({
        ledgerId: ledgerId as any,
      });

      alert("Payout marked as paid.");
    } catch (error: any) {
      console.error("Failed to mark payout paid:", error);
      alert(error?.message || "Failed to update payout status.");
    } finally {
      setProcessingLedgerId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">
          Loading advanced analytics...
        </p>
      </div>
    );
  }

  if (!isSignedIn || !currentUser || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <Ban size={64} className="text-red-500 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            This area is restricted to system administrators only.
          </p>
          <Link href="/">
            <Button className="mt-6">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const defaultCurrency =
    orders?.[0]?.currency || ledger?.[0]?.currency || "PKR";

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Admin Control Panel
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              Advanced Marketplace Analytics
            </h1>

            <p className="text-gray-600 mt-2">
              Track orders, commission, partner payouts, and marketplace revenue.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/admin/packages">
              <Button variant="outline">Packages</Button>
            </Link>
            <Link href="/admin/plans">
              <Button variant="outline">Plans</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
          <StatCard
            title="Orders"
            value={stats.totalOrders}
            icon={<ShoppingBag size={22} />}
          />

          <StatCard
            title="Gross Revenue"
            value={`${defaultCurrency} ${stats.totalRevenue.toLocaleString()}`}
            icon={<BarChart3 size={22} />}
          />

          <StatCard
            title="Itinera Commission"
            value={`${defaultCurrency} ${stats.totalCommission.toLocaleString()}`}
            icon={<ShieldCheck size={22} />}
          />

          <StatCard
            title="Partner Earnings"
            value={`${defaultCurrency} ${stats.totalPartnerEarnings.toLocaleString()}`}
            icon={<Wallet size={22} />}
          />

          <StatCard
            title="Unpaid Payouts"
            value={`${defaultCurrency} ${stats.unpaidPayouts.toLocaleString()}`}
            icon={<Clock size={22} />}
          />

          <StatCard
            title="Paid Payouts"
            value={`${defaultCurrency} ${stats.paidPayouts.toLocaleString()}`}
            icon={<CheckCircle2 size={22} />}
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "orders"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Orders
          </button>

          <button
            onClick={() => setActiveTab("commission")}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              activeTab === "commission"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Commission Ledger
          </button>
        </div>

        {activeTab === "orders" ? (
          <OrdersTable orders={orders ?? []} />
        ) : (
          <CommissionTable
            ledger={ledger ?? []}
            processingLedgerId={processingLedgerId}
            onMarkPaid={handleMarkPaid}
          />
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 mt-8">
          <h3 className="font-bold text-blue-900">FYP Demo Note</h3>
          <p className="text-blue-800 text-sm mt-2 leading-relaxed">
            These analytics are generated from dummy marketplace transactions.
            They demonstrate Itinera&apos;s business model: users book packages
            or buy plans, Itinera takes commission, and remaining earnings go to
            the partner.
          </p>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
        <Receipt className="mx-auto text-gray-400 mb-4" size={60} />
        <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
        <p className="text-gray-500 mt-2">
          Marketplace orders will appear here after users complete dummy
          checkout.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-950">All Marketplace Orders</h2>
        <p className="text-gray-500 mt-1">
          Complete list of package bookings and paid plan purchases.
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
                Product
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Buyer
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Partner
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Amount
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Commission
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Receipt
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: any) => (
              <tr
                key={order._id}
                className="border-b last:border-0 hover:bg-blue-50/30 transition-colors"
              >
                <td className="p-4 text-sm text-gray-700">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <p className="font-semibold text-gray-900">
                    {order.productTitle}
                  </p>
                  <span className="text-xs text-gray-500 uppercase">
                    {order.productType === "agency_package"
                      ? "Agency Package"
                      : "Paid Plan"}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Users size={15} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.buyer?.name || "Buyer"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.buyer?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <p className="font-medium text-gray-900">
                    {order.partner?.displayName || "Partner"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {order.partner?.partnerType || "partner"}
                  </p>
                </td>

                <td className="p-4 font-bold text-gray-900">
                  {order.currency} {order.amount?.toLocaleString()}
                </td>

                <td className="p-4 text-blue-700 font-semibold">
                  {order.currency} {order.platformCommission?.toLocaleString()}
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase">
                    {order.paymentStatus}
                  </span>
                </td>

                <td className="p-4">
                  <Link href={`/orders/${order._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommissionTable({
  ledger,
  processingLedgerId,
  onMarkPaid,
}: {
  ledger: any[];
  processingLedgerId: string | null;
  onMarkPaid: (ledgerId: string) => void;
}) {
  if (ledger.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
        <Wallet className="mx-auto text-gray-400 mb-4" size={60} />
        <h2 className="text-2xl font-bold text-gray-900">
          No commission records
        </h2>
        <p className="text-gray-500 mt-2">
          Commission records will appear after marketplace orders are created.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-950">Commission Ledger</h2>
        <p className="text-gray-500 mt-1">
          Track Itinera commission and partner payout status.
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
                Partner
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Product Type
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Gross
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Rate
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Itinera Share
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Partner Earning
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Payout Status
              </th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {ledger.map((entry: any) => (
              <tr
                key={entry._id}
                className="border-b last:border-0 hover:bg-blue-50/30 transition-colors"
              >
                <td className="p-4 text-sm text-gray-700">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <p className="font-medium text-gray-900">
                    {entry.partner?.displayName || "Partner"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {entry.partner?.partnerType || "partner"}
                  </p>
                </td>

                <td className="p-4">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold uppercase">
                    {entry.productType === "agency_package"
                      ? "Agency Package"
                      : "Paid Plan"}
                  </span>
                </td>

                <td className="p-4 font-bold text-gray-900">
                  {entry.currency} {entry.grossAmount?.toLocaleString()}
                </td>

                <td className="p-4 text-gray-700">{entry.commissionRate}%</td>

                <td className="p-4 text-blue-700 font-semibold">
                  {entry.currency}{" "}
                  {entry.platformCommission?.toLocaleString()}
                </td>

                <td className="p-4 text-green-700 font-semibold">
                  {entry.currency} {entry.partnerEarning?.toLocaleString()}
                </td>

                <td className="p-4">
                  <PayoutBadge status={entry.payoutStatus} />
                </td>

                <td className="p-4">
                  {entry.payoutStatus === "unpaid" ? (
                    <Button
                      size="sm"
                      disabled={processingLedgerId === entry._id}
                      onClick={() => onMarkPaid(entry._id)}
                    >
                      {processingLedgerId === entry._id ? (
                        <>
                          <Loader2 className="animate-spin mr-2" size={14} />
                          Saving
                        </>
                      ) : (
                        "Mark Paid"
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400">No action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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