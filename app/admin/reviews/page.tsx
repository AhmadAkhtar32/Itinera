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
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Star,
} from "lucide-react";

type StatusFilter = "all" | "published" | "hidden";

export default function AdminReviewsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const reviews = useQuery(api.reviews.adminGetReviews, isAdmin ? {} : "skip");

  const hideReview = useMutation(api.reviews.adminHideReview);
  const publishReview = useMutation(api.reviews.adminPublishReview);

  const isLoading =
    !isLoaded ||
    (isSignedIn && currentUser === undefined) ||
    (isAdmin && reviews === undefined);

  const filteredReviews = useMemo(() => {
    if (!reviews) return [];

    if (activeStatus === "all") return reviews;

    return reviews.filter((review: any) => review.status === activeStatus);
  }, [reviews, activeStatus]);

  const handleHideReview = async (reviewId: string) => {
    if (!window.confirm("Hide this review from public pages?")) return;

    try {
      setProcessingId(reviewId);

      await hideReview({
        reviewId: reviewId as any,
      });

      alert("Review hidden successfully.");
    } catch (error: any) {
      console.error("Hide review failed:", error);
      alert(error?.message || "Failed to hide review.");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublishReview = async (reviewId: string) => {
    if (!window.confirm("Publish this review again?")) return;

    try {
      setProcessingId(reviewId);

      await publishReview({
        reviewId: reviewId as any,
      });

      alert("Review published successfully.");
    } catch (error: any) {
      console.error("Publish review failed:", error);
      alert(error?.message || "Failed to publish review.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading reviews...</p>
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

  const publishedCount =
    reviews?.filter((review: any) => review.status === "published").length ?? 0;

  const hiddenCount =
    reviews?.filter((review: any) => review.status === "hidden").length ?? 0;

  const avgRating =
    reviews && reviews.length > 0
      ? Number(
          (
            reviews.reduce((sum: number, review: any) => sum + review.rating, 0) /
            reviews.length
          ).toFixed(1)
        )
      : 0;

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
              Review Management
            </h1>

            <p className="text-gray-600 mt-2">
              Manage public customer reviews for marketplace packages and paid
              plans.
            </p>
          </div>

          <Link href="/marketplace">
            <Button variant="outline">View Marketplace</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Reviews"
            value={reviews?.length ?? 0}
            icon={<MessageSquare size={22} />}
          />

          <StatCard
            title="Published"
            value={publishedCount}
            icon={<Eye size={22} />}
          />

          <StatCard
            title="Hidden"
            value={hiddenCount}
            icon={<EyeOff size={22} />}
          />

          <StatCard
            title="Average Rating"
            value={`${avgRating} / 5`}
            icon={<Star size={22} />}
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2 mb-8">
          {(["all", "published", "hidden"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeStatus === status
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {filteredReviews.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No reviews found
            </h2>
            <p className="text-gray-500 mt-2">
              Customer reviews will appear here after users submit ratings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReviews.map((review: any) => (
              <ReviewCard
                key={review._id}
                review={review}
                processing={processingId === review._id}
                onHide={() => handleHideReview(review._id)}
                onPublish={() => handlePublishReview(review._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({
  review,
  processing,
  onHide,
  onPublish,
}: {
  review: any;
  processing: boolean;
  onHide: () => void;
  onPublish: () => void;
}) {
  const isPackage = review.productType === "agency_package";

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <StatusBadge status={review.status} />

            <span
              className={`px-3 py-1 rounded-full border text-xs font-bold uppercase ${
                isPackage
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : "bg-orange-50 text-orange-700 border-orange-100"
              }`}
            >
              {isPackage ? "Agency Package" : "Paid Plan"}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-950">
            {review.product?.title || review.order?.productTitle || "Product"}
          </h2>

          <p className="text-gray-500 mt-1">
            Partner:{" "}
            <span className="font-medium text-gray-700">
              {review.partner?.displayName || "Unknown Partner"}
            </span>
          </p>

          <p className="text-gray-400 text-sm mt-1">
            Submitted on {new Date(review.createdAt).toLocaleDateString()} at{" "}
            {new Date(review.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex gap-3">
          {review.status === "published" ? (
            <Button
              onClick={onHide}
              disabled={processing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <EyeOff className="mr-2" size={16} />
              )}
              Hide
            </Button>
          ) : (
            <Button
              onClick={onPublish}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Eye className="mr-2" size={16} />
              )}
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={22}
                className={
                  index < review.rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-gray-300"
                }
              />
            ))}
            <span className="ml-2 font-bold text-gray-900">
              {review.rating} / 5
            </span>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
          </div>
        </div>

        <div className="space-y-3">
          <InfoBox
            label="Reviewer"
            value={review.reviewer?.name || "Itinera User"}
          />
          <InfoBox
            label="Reviewer Email"
            value={review.reviewer?.email || "No email"}
          />
          <InfoBox
            label="Order Status"
            value={review.order?.orderStatus || "Unknown"}
          />
          <InfoBox
            label="Payment Status"
            value={review.order?.paymentStatus || "Unknown"}
          />

          {review.order?._id && (
            <Link href={`/orders/${review.order._id}`}>
              <Button variant="outline" className="w-full">
                View Order Receipt
              </Button>
            </Link>
          )}
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
      <h2 className="text-2xl font-bold text-gray-900 mt-2">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 text-xs font-bold uppercase">
        <CheckCircle2 size={13} />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 text-xs font-bold uppercase">
      <EyeOff size={13} />
      Hidden
    </span>
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