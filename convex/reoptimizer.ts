import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./authHelpers";

export const getTripForReOptimization = query({
  args: {
    tripId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripId))
      .first();

    if (!trip) {
      return null;
    }

    const isOwner =
      trip.ownerId === user._id ||
      trip.uid === user._id ||
      trip.userEmail === user.email;

    if (!isOwner) {
      throw new Error("Forbidden. You can only re-optimize your own trips.");
    }

    return trip;
  },
});

export const saveReOptimizedTrip = mutation({
  args: {
    originalTripId: v.string(),
    newTripId: v.string(),
    tripDetail: v.any(),
    optimizationPrompt: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const originalTrip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.originalTripId))
      .first();

    if (!originalTrip) {
      throw new Error("Original trip not found.");
    }

    const isOwner =
      originalTrip.ownerId === user._id ||
      originalTrip.uid === user._id ||
      originalTrip.userEmail === user.email;

    if (!isOwner) {
      throw new Error("Forbidden. You can only re-optimize your own trips.");
    }

    const now = Date.now();

    const savedId = await ctx.db.insert("TripDetailTable", {
      tripId: args.newTripId,
      tripDetail: {
        ...args.tripDetail,
        reOptimization: {
          originalTripId: args.originalTripId,
          prompt: args.optimizationPrompt,
          optimizedAt: now,
        },
      },

      uid: user._id,
      userEmail: user.email,
      ownerId: user._id,

      isFavorite: false,
      source: "reoptimized",
      visibility: "private",

      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      savedId,
      tripId: args.newTripId,
      message: "Re-optimized trip saved successfully.",
    };
  },
});