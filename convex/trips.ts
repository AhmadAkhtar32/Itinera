import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./authHelpers";

export const getUserTrips = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const ownedTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    // Backward compatibility for old trips saved before ownerId existed
    const legacyEmailTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_user_email", (q) => q.eq("userEmail", user.email))
      .order("desc")
      .collect();

    const legacyUidTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_uid", (q) => q.eq("uid", user._id))
      .order("desc")
      .collect();

    const byId = new Map();

    [...ownedTrips, ...legacyEmailTrips, ...legacyUidTrips].forEach((trip) => {
      byId.set(trip._id, trip);
    });

    return Array.from(byId.values()).sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});

export const getTripById = query({
  args: {
    tripId: v.string(),
    userEmail: v.optional(v.string()),
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

    const isOwnerByNewField = trip.ownerId && trip.ownerId === user._id;
    const isOwnerByEmail = trip.userEmail === user.email;
    const isOwnerByUid = trip.uid === user._id;

    if (!isOwnerByNewField && !isOwnerByEmail && !isOwnerByUid) {
      throw new Error("Forbidden. You do not own this trip.");
    }

    return trip;
  },
});

export const toggleFavorite = mutation({
  args: {
    tripId: v.string(),
    userEmail: v.optional(v.string()),
    isFavorite: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripId))
      .first();

    if (!trip) {
      throw new Error("Trip not found");
    }

    const isOwnerByNewField = trip.ownerId && trip.ownerId === user._id;
    const isOwnerByEmail = trip.userEmail === user.email;
    const isOwnerByUid = trip.uid === user._id;

    if (!isOwnerByNewField && !isOwnerByEmail && !isOwnerByUid) {
      throw new Error("Forbidden. You do not own this trip.");
    }

    await ctx.db.patch(trip._id, {
      isFavorite: args.isFavorite,
      updatedAt: Date.now(),
    });

    return {
      success: true,
    };
  },
});

export const deleteTrip = mutation({
  args: {
    tripId: v.string(),
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripId))
      .first();

    if (!trip) {
      throw new Error("Trip not found");
    }

    const isOwnerByNewField = trip.ownerId && trip.ownerId === user._id;
    const isOwnerByEmail = trip.userEmail === user.email;
    const isOwnerByUid = trip.uid === user._id;

    if (!isOwnerByNewField && !isOwnerByEmail && !isOwnerByUid) {
      throw new Error("Forbidden. You do not own this trip.");
    }

    await ctx.db.delete(trip._id);

    return {
      success: true,
    };
  },
});