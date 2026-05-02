"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, MessageSquare, Star } from "lucide-react";

type Props = {
  productType: "package" | "plan";
  productId: string;
};

export default function PublicReviews({ productType, productId }: Props) {
  const packageReviews = useQuery(
    api.reviews.getReviewsForPackage,
    productType === "package" && productId
      ? { packageId: productId as any }
      : "skip"
  );

  const planReviews = useQuery(
    api.reviews.getReviewsForPlan,
    productType === "plan" && productId ? { planId: productId as any } : "skip"
  );

  const reviews = productType === "package" ? packageReviews : planReviews;

  if (reviews === undefined) {
    return (
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="animate-spin" size={20} />
          <span>Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
          <MessageSquare size={24} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-950">
            Customer Reviews
          </h2>
          <p className="text-gray-500 text-sm">
            {reviews.length} public review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
          <Star className="mx-auto text-gray-300 mb-3" size={36} />
          <h3 className="font-bold text-gray-900">No reviews yet</h3>
          <p className="text-gray-500 text-sm mt-1">
            Reviews will appear here after customers purchase and rate this item.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div
              key={review._id}
              className="border border-gray-100 rounded-2xl p-5 bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      review.reviewer?.imageUrl ||
                      "/assets/images/placeholder.png"
                    }
                    alt="Reviewer"
                    className="w-10 h-10 rounded-full border border-gray-200 object-cover"
                  />

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {review.reviewer?.name || "Itinera User"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={17}
                      className={
                        index < review.rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}