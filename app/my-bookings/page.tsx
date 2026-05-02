"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Package,
  PenLine,
  Receipt,
  ShoppingBag,
  Star,
} from "lucide-react";

export default function MyBookingsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const orders = useQuery(api.orders.getMyOrders, isSignedIn ? {} : "skip");

  if (!isLoaded || (isSignedIn && orders === undefined)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading your bookings...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <ShoppingBag className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to view your bookings and purchases.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Receipt size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                My Orders
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              My Bookings & Purchases
            </h1>

            <p className="text-gray-600 mt-2">
              View your booked agency packages and purchased collaborator travel
              plans.
            </p>
          </div>

          <Link href="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>

        {orders?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <ShoppingBag className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No bookings yet
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              You have not booked any agency package or purchased any paid travel
              plan yet.
            </p>

            <Link href="/marketplace">
              <Button className="mt-6">Explore Marketplace</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {orders?.map((order: any) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const isPackage = order.productType === "agency_package";
  const product = order.product;
  const partner = order.partner;

  const destination = product?.destination || "Destination not available";
  const durationDays = product?.durationDays || 0;

  const fullPlanLines =
    !isPackage && Array.isArray(product?.fullPlan) ? product.fullPlan : [];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
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
                <MapPin size={16} />
                <span>{destination}</span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays size={16} />
                <span>{durationDays} days</span>
              </div>

              <div className="flex items-center gap-2">
                <Package size={16} />
                <span>{partner?.displayName || "Itinera Partner"}</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Ordered on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="text-left lg:text-right">
          <p className="text-sm text-gray-500 font-bold uppercase">Paid</p>
          <p className="text-2xl font-bold text-gray-950">
            {order.currency} {order.amount?.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {isPackage ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
              <h3 className="font-bold text-indigo-900">
                Booking Confirmation
              </h3>
              <p className="text-indigo-800 text-sm mt-2 leading-relaxed">
                Your agency package booking has been confirmed through dummy
                payment. The partner agency can view this booking in their portal.
              </p>

              {product?.description && (
                <p className="text-indigo-800 text-sm mt-4 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    Unlocked Paid Plan Content
                  </h3>
                  <p className="text-sm text-gray-500">
                    This content is visible because you purchased the plan.
                  </p>
                </div>
              </div>

              {fullPlanLines.length > 0 ? (
                <ul className="space-y-3">
                  {fullPlanLines.map((line: string, index: number) => (
                    <li
                      key={index}
                      className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-700"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No full plan content available.</p>
              )}
            </div>
          )}

          <ReviewBox order={order} />
        </div>

        <div className="space-y-3">
          <InfoRow label="Payment Status" value={order.paymentStatus} />
          <InfoRow label="Order Status" value={order.orderStatus} />
          <InfoRow
            label="Payment Method"
            value={order.dummyPaymentMethod?.toUpperCase()}
          />
          <InfoRow label="Dummy TID" value={order.dummyTransactionId} />
          <InfoRow
            label="Itinera Commission"
            value={`${order.currency} ${order.platformCommission?.toLocaleString()}`}
          />
          <InfoRow
            label="Partner Earning"
            value={`${order.currency} ${order.partnerEarning?.toLocaleString()}`}
          />

          <Link href={`/orders/${order._id}`}>
            <Button variant="outline" className="w-full mt-2">
              View Receipt
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReviewBox({ order }: { order: any }) {
  const existingReview = useQuery(api.reviews.getMyReviewForOrder, {
    orderId: order._id as any,
  });

  const createReview = useMutation(api.reviews.createReview);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!comment.trim() || comment.trim().length < 10) {
      alert("Please write at least 10 characters.");
      return;
    }

    try {
      setSubmitting(true);

      await createReview({
        orderId: order._id as any,
        rating,
        comment,
      });

      alert("Review submitted successfully.");
      setComment("");
      setRating(5);
    } catch (error: any) {
      console.error("Review submission failed:", error);
      alert(error?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  if (existingReview === undefined) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
        <p className="text-gray-500 text-sm">Checking review status...</p>
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="text-green-600" size={20} />
          <h3 className="font-bold text-green-900">Review Submitted</h3>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={18}
              className={
                index < existingReview.rating
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }
            />
          ))}
        </div>

        <p className="text-green-800 text-sm leading-relaxed">
          {existingReview.comment}
        </p>

        <p className="text-xs text-green-700 mt-3 capitalize">
          Status: {existingReview.status}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Star className="text-yellow-500 fill-yellow-500" size={20} />
        <h3 className="font-bold text-gray-900">Leave a Review</h3>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Rate your experience with this{" "}
        {order.productType === "agency_package" ? "agency package" : "paid plan"}.
      </p>

      <div className="flex items-center gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, index) => {
          const starValue = index + 1;

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => setRating(starValue)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  starValue <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }
              />
            </button>
          );
        })}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="min-h-[120px] resize-none"
      />

      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmitReview} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
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