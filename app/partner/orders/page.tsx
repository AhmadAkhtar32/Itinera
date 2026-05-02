"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Lock,
  Package,
  PenLine,
  Receipt,
  ShoppingBag,
  User,
  Wallet,
} from "lucide-react";

export default function PartnerOrdersPage() {
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isPartner =
    currentUser?.role === "agency" ||
    currentUser?.role === "collaborator" ||
    currentUser?.role === "admin";

  const orders = useQuery(
    api.orders.getPartnerOrders,
    isPartner ? {} : "skip"
  );

  if (!isLoaded || currentUser === undefined || (isPartner && orders === undefined)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading partner orders...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Lock className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600 mt-3">
            Please sign in to view partner orders.
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
          <ShoppingBag className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Partner Access Required
          </h1>
          <p className="text-gray-600 mt-3">
            Only approved partners can view customer orders.
          </p>

          <Link href="/partner">
            <Button className="mt-6">Go to Partner Program</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalRevenue =
    orders?.reduce((sum: number, order: any) => sum + (order.amount ?? 0), 0) ??
    0;

  const totalCommission =
    orders?.reduce(
      (sum: number, order: any) => sum + (order.platformCommission ?? 0),
      0
    ) ?? 0;

  const totalEarnings =
    orders?.reduce(
      (sum: number, order: any) => sum + (order.partnerEarning ?? 0),
      0
    ) ?? 0;

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
              <Receipt size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Partner Portal
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              Customer Orders
            </h1>

            <p className="text-gray-600 mt-2">
              View bookings and purchases made by users.
            </p>
          </div>

          <Link href="/partner/earnings">
            <Button variant="outline">View Earnings</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total Orders" value={orders?.length ?? 0} />
          <StatCard title="Total Revenue" value={`PKR ${totalRevenue.toLocaleString()}`} />
          <StatCard title="Itinera Commission" value={`PKR ${totalCommission.toLocaleString()}`} />
          <StatCard title="Your Earnings" value={`PKR ${totalEarnings.toLocaleString()}`} />
        </div>

        {orders?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No orders yet
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Customer orders will appear here after users book your packages or
              purchase your plans.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders?.map((order: any) => (
              <PartnerOrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-2">{value}</h2>
    </div>
  );
}

function PartnerOrderCard({ order }: { order: any }) {
  const isPackage = order.productType === "agency_package";
  const buyer = order.buyer;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex gap-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              isPackage
                ? "bg-indigo-50 text-indigo-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isPackage ? <Building2 size={30} /> : <PenLine size={30} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-950">
                {order.productTitle}
              </h2>

              <span
                className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${
                  isPackage
                    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                    : "bg-orange-50 text-orange-700 border-orange-100"
                }`}
              >
                {isPackage ? "Agency Package" : "Paid Plan"}
              </span>

              <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase inline-flex items-center gap-1">
                <CheckCircle2 size={13} />
                {order.orderStatus}
              </span>
            </div>

            <div className="flex flex-wrap gap-5 text-gray-500 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{buyer?.name || "Customer"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Package size={16} />
                <span>{buyer?.email || "No email"}</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Ordered on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm text-gray-500 font-bold uppercase">Amount</p>
          <p className="text-2xl font-bold text-gray-950">
            {order.currency} {order.amount?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <InfoBox label="Payment Status" value={order.paymentStatus} />
        <InfoBox label="Payment Method" value={order.dummyPaymentMethod?.toUpperCase()} />
        <InfoBox label="Dummy TID" value={order.dummyTransactionId} />
        <InfoBox label="Commission Rate" value={`${order.commissionRate}%`} />
        <InfoBox
          label="Itinera Commission"
          value={`${order.currency} ${order.platformCommission?.toLocaleString()}`}
        />
        <InfoBox
          label="Your Earning"
          value={`${order.currency} ${order.partnerEarning?.toLocaleString()}`}
        />
        <InfoBox label="Order ID" value={order._id} />
        <Link href={`/orders/${order._id}`}>
          <Button variant="outline" className="w-full h-full">
            View Receipt
          </Button>
        </Link>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p className="font-medium text-gray-900 mt-1 break-all capitalize">
        {value}
      </p>
    </div>
  );
}