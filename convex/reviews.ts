import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requireUser } from "./authHelpers";

async function recalculatePackageRating(ctx: any, packageId: any) {
  const reviews = await ctx.db
    .query("Reviews")
    .withIndex("by_package", (q: any) => q.eq("packageId", packageId))
    .collect();

  const publishedReviews = reviews.filter(
    (review: any) => review.status === "published"
  );

  const ratingCount = publishedReviews.length;
  const ratingAvg =
    ratingCount > 0
      ? Number(
          (
            publishedReviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / ratingCount
          ).toFixed(1)
        )
      : 0;

  await ctx.db.patch(packageId, {
    ratingAvg,
    ratingCount,
    updatedAt: Date.now(),
  });
}

async function recalculatePlanRating(ctx: any, planId: any) {
  const reviews = await ctx.db
    .query("Reviews")
    .withIndex("by_plan", (q: any) => q.eq("planId", planId))
    .collect();

  const publishedReviews = reviews.filter(
    (review: any) => review.status === "published"
  );

  const ratingCount = publishedReviews.length;
  const ratingAvg =
    ratingCount > 0
      ? Number(
          (
            publishedReviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / ratingCount
          ).toFixed(1)
        )
      : 0;

  await ctx.db.patch(planId, {
    ratingAvg,
    ratingCount,
    updatedAt: Date.now(),
  });
}

async function recalculatePartnerRating(ctx: any, partnerId: any) {
  const reviews = await ctx.db
    .query("Reviews")
    .withIndex("by_partner", (q: any) => q.eq("partnerId", partnerId))
    .collect();

  const publishedReviews = reviews.filter(
    (review: any) => review.status === "published"
  );

  const ratingCount = publishedReviews.length;
  const ratingAvg =
    ratingCount > 0
      ? Number(
          (
            publishedReviews.reduce(
              (sum: number, review: any) => sum + review.rating,
              0
            ) / ratingCount
          ).toFixed(1)
        )
      : 0;

  await ctx.db.patch(partnerId, {
    ratingAvg,
    ratingCount,
    updatedAt: Date.now(),
  });
}

export const createReview = mutation({
  args: {
    orderId: v.id("Orders"),
    rating: v.number(),
    comment: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5.");
    }

    if (!args.comment.trim() || args.comment.trim().length < 10) {
      throw new Error("Review comment must be at least 10 characters.");
    }

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.buyerId !== user._id) {
      throw new Error("Forbidden. You can only review your own purchases.");
    }

    if (order.paymentStatus !== "paid") {
      throw new Error("You can only review paid orders.");
    }

    const existingReview = await ctx.db
      .query("Reviews")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .first();

    if (existingReview) {
      throw new Error("You already reviewed this order.");
    }

    const now = Date.now();

    const reviewId = await ctx.db.insert("Reviews", {
      orderId: order._id,
      reviewerId: user._id,
      partnerId: order.partnerId,

      productType: order.productType,
      packageId: order.packageId,
      planId: order.planId,

      rating: args.rating,
      comment: args.comment.trim(),

      status: "published",

      createdAt: now,
      updatedAt: now,
    });

    if (order.packageId) {
      await recalculatePackageRating(ctx, order.packageId);
    }

    if (order.planId) {
      await recalculatePlanRating(ctx, order.planId);
    }

    await recalculatePartnerRating(ctx, order.partnerId);

    return {
      success: true,
      reviewId,
      message: "Review submitted successfully.",
    };
  },
});

export const getMyReviewForOrder = query({
  args: {
    orderId: v.id("Orders"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    if (order.buyerId !== user._id) {
      throw new Error("Forbidden. You cannot access this review.");
    }

    const review = await ctx.db
      .query("Reviews")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    return review;
  },
});

export const getReviewsForPackage = query({
  args: {
    packageId: v.id("MarketplacePackages"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("Reviews")
      .withIndex("by_package", (q) => q.eq("packageId", args.packageId))
      .order("desc")
      .collect();

    const publishedReviews = reviews.filter(
      (review) => review.status === "published"
    );

    return await Promise.all(
      publishedReviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);

        return {
          ...review,
          reviewer: reviewer
            ? {
                name: reviewer.name,
                imageUrl: reviewer.imageUrl,
              }
            : null,
        };
      })
    );
  },
});

export const getReviewsForPlan = query({
  args: {
    planId: v.id("CollaboratorPlans"),
  },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("Reviews")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .order("desc")
      .collect();

    const publishedReviews = reviews.filter(
      (review) => review.status === "published"
    );

    return await Promise.all(
      publishedReviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);

        return {
          ...review,
          reviewer: reviewer
            ? {
                name: reviewer.name,
                imageUrl: reviewer.imageUrl,
              }
            : null,
        };
      })
    );
  },
});

export const adminGetReviews = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const reviews = await ctx.db.query("Reviews").order("desc").collect();

    return await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const partner = await ctx.db.get(review.partnerId);
        const order = await ctx.db.get(review.orderId);

        let product = null;

        if (review.packageId) {
          product = await ctx.db.get(review.packageId);
        }

        if (review.planId) {
          product = await ctx.db.get(review.planId);
        }

        return {
          ...review,
          reviewer,
          partner,
          order,
          product,
        };
      })
    );
  },
});

export const adminHideReview = mutation({
  args: {
    reviewId: v.id("Reviews"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    await ctx.db.patch(review._id, {
      status: "hidden",
      updatedAt: Date.now(),
    });

    if (review.packageId) {
      await recalculatePackageRating(ctx, review.packageId);
    }

    if (review.planId) {
      await recalculatePlanRating(ctx, review.planId);
    }

    await recalculatePartnerRating(ctx, review.partnerId);

    return {
      success: true,
      message: "Review hidden.",
    };
  },
});

export const adminPublishReview = mutation({
  args: {
    reviewId: v.id("Reviews"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const review = await ctx.db.get(args.reviewId);

    if (!review) {
      throw new Error("Review not found.");
    }

    await ctx.db.patch(review._id, {
      status: "published",
      updatedAt: Date.now(),
    });

    if (review.packageId) {
      await recalculatePackageRating(ctx, review.packageId);
    }

    if (review.planId) {
      await recalculatePlanRating(ctx, review.planId);
    }

    await recalculatePartnerRating(ctx, review.partnerId);

    return {
      success: true,
      message: "Review published.",
    };
  },
});