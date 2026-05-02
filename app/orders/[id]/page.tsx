"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  MapPin,
  PenLine,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function OrderReceiptPage() {
  const params = useParams();
  const { isLoaded, isSignedIn } = useUser();

  const orderId = params.id as string;

  const order = useQuery(
    api.orders.getOrderById,
    isSignedIn && orderId ? { orderId: orderId as any } : "skip"
  );

  if (!isLoaded || (isSignedIn && order === undefined)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading receipt...</p>
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
            Please sign in to view your order receipt.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Receipt className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Receipt Not Found
          </h1>
          <p className="text-gray-600 mt-3">
            This order does not exist or you do not have permission to view it.
          </p>

          <Link href="/my-bookings">
            <Button className="mt-6">Back to My Bookings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPackage = order.productType === "agency_package";
  const product = order.product;
  const partner = order.partner;

  const destination = product?.destination || "Destination not available";
  const durationDays = product?.durationDays || 0;

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/my-bookings"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to My Bookings
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <Receipt size={20} />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    Order Receipt
                  </span>
                </div>

                <h1 className="text-4xl font-bold text-gray-950">
                  Payment Confirmed
                </h1>

                <p className="text-gray-600 mt-2">
                  This is a dummy receipt generated for the Itinera FYP
                  marketplace.
                </p>
              </div>

              <div className="bg-green-50 text-green-700 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-2 font-bold">
                <CheckCircle2 size={20} />
                {order.paymentStatus}
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="border border-gray-100 rounded-3xl p-6">
                <div className="flex gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${
                      isPackage
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {product?.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={order.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : isPackage ? (
                      <Building2 size={30} />
                    ) : (
                      <PenLine size={30} />
                    )}
                  </div>

                  <div>
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${
                        isPackage
                          ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                          : "bg-orange-50 text-orange-700 border-orange-100"
                      }`}
                    >
                      {isPackage ? "Agency Package" : "Paid Travel Plan"}
                    </span>

                    <h2 className="text-2xl font-bold text-gray-950 mt-3">
                      {order.productTitle}
                    </h2>

                    <div className="flex flex-wrap gap-5 text-gray-500 mt-3 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{destination}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <CalendarDays size={16} />
                        <span>{durationDays} days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="border border-gray-100 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <ShieldCheck className="text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-950">
                    Partner Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoBox
                    label="Partner Name"
                    value={partner?.displayName || "Itinera Partner"}
                  />
                  <InfoBox
                    label="Partner Type"
                    value={partner?.partnerType || "partner"}
                  />
                  <InfoBox
                    label="Commission Rate"
                    value={`${order.commissionRate}%`}
                  />
                  <InfoBox
                    label="Partner Status"
                    value={partner?.status || "active"}
                  />
                </div>
              </section>

              <section className="border border-gray-100 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <Wallet className="text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-950">
                    Commission Breakdown
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoBox
                    label="Gross Amount"
                    value={`${order.currency} ${order.amount?.toLocaleString()}`}
                  />
                  <InfoBox
                    label="Itinera Commission"
                    value={`${order.currency} ${order.platformCommission?.toLocaleString()}`}
                  />
                  <InfoBox
                    label="Partner Earning"
                    value={`${order.currency} ${order.partnerEarning?.toLocaleString()}`}
                  />
                </div>

                <p className="text-sm text-gray-500 mt-4">
                  Commission is calculated automatically when the dummy payment
                  is confirmed.
                </p>
              </section>

              {!isPackage && product?.fullPlan && (
                <section className="border border-gray-100 rounded-3xl p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <FileText className="text-orange-600" />
                    <h2 className="text-2xl font-bold text-gray-950">
                      Purchased Plan Content
                    </h2>
                  </div>

                  <ul className="space-y-3">
                    {product.fullPlan.map((line: string, index: number) => (
                      <li
                        key={index}
                        className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-700"
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside className="lg:col-span-1">
              <div className="border border-gray-100 rounded-3xl p-6 sticky top-24">
                <p className="text-xs text-gray-500 font-bold uppercase">
                  Receipt Summary
                </p>

                <h2 className="text-3xl font-bold text-gray-950 mt-2">
                  {order.currency} {order.amount?.toLocaleString()}
                </h2>

                <div className="space-y-4 mt-6">
                  <InfoRow label="Order ID" value={order._id} />
                  <InfoRow label="Payment Status" value={order.paymentStatus} />
                  <InfoRow label="Order Status" value={order.orderStatus} />
                  <InfoRow
                    label="Method"
                    value={order.dummyPaymentMethod?.toUpperCase()}
                  />
                  <InfoRow label="Dummy TID" value={order.dummyTransactionId} />
                  <InfoRow
                    label="Date"
                    value={new Date(order.createdAt).toLocaleDateString()}
                  />
                  <InfoRow
                    label="Time"
                    value={new Date(order.createdAt).toLocaleTimeString()}
                  />
                </div>

                <Link href="/marketplace">
                  <Button className="w-full mt-6">Browse More</Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p className="font-medium text-gray-900 mt-1 break-all capitalize">
        {value}
      </p>
    </div>
  );
}