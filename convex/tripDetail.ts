import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser, isAdminEmail } from "./authHelpers";

export const CreateTripDetail = mutation({
  args: {
    tripId: v.string(),

    // Kept for old frontend compatibility.
    // Backend does NOT trust these anymore.
    uid: v.optional(v.string()),
    userEmail: v.optional(v.string()),

    tripDetail: v.any(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const isAdmin = user.role === "admin" || isAdminEmail(user.email);
    const isPro = user.isPro === true;
    const credits = user.credits ?? 0;
    const now = Date.now();

    if (!isAdmin && !isPro && credits <= 0) {
      throw new Error("INSUFFICIENT_CREDITS");
    }

    if (!isAdmin && !isPro) {
      await ctx.db.patch(user._id, {
        credits: credits - 1,
        updatedAt: now,
      });
    }

    const result = await ctx.db.insert("TripDetailTable", {
      tripDetail: args.tripDetail,
      tripId: args.tripId,

      // Keep old fields working
      uid: user._id,
      userEmail: user.email,

      // New secure fields
      ownerId: user._id,
      source: "ai_generated",
      visibility: "private",
      isFavorite: false,
      createdAt: now,
      updatedAt: now,
    });

    return result;
  },
});

export const GetUserTrips = query({
  args: {
    // Kept optional so old frontend calls do not break.
    uid: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const ownedTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .order("desc")
      .collect();

    // Backward compatibility: old trips may not have ownerId yet.
    const legacyUidTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_uid", (q) => q.eq("uid", user._id))
      .order("desc")
      .collect();

    // Backward compatibility: some old trips were saved by email.
    const legacyEmailTrips = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_user_email", (q) => q.eq("userEmail", user.email))
      .order("desc")
      .collect();

    const byId = new Map();

    [...ownedTrips, ...legacyUidTrips, ...legacyEmailTrips].forEach((trip) => {
      byId.set(trip._id, trip);
    });

    return Array.from(byId.values()).sort(
      (a, b) => b._creationTime - a._creationTime
    );
  },
});

export const GetTripById = query({
  args: {
    // Kept optional so old frontend calls do not break.
    uid: v.optional(v.string()),
    tripid: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripid))
      .first();

    if (!trip) {
      return null;
    }

    const isOwnerByNewField = trip.ownerId && trip.ownerId === user._id;
    const isOwnerByLegacyUid = trip.uid === user._id;
    const isOwnerByEmail = trip.userEmail === user.email;

    if (!isOwnerByNewField && !isOwnerByLegacyUid && !isOwnerByEmail) {
      throw new Error("Forbidden. You do not own this trip.");
    }

    return trip;
  },
});

export const GetPublicTripById = query({
  args: {
    tripid: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db
      .query("TripDetailTable")
      .withIndex("by_trip_id", (q) => q.eq("tripId", args.tripid))
      .first();

    if (!trip) {
      return null;
    }

    if (trip.visibility === "public") {
      return trip;
    }

    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return null;
    }

    const email = identity.email?.toLowerCase();

    const user = await ctx.db
      .query("Usertable")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    const isOwnerByNewField = user && trip.ownerId && trip.ownerId === user._id;
    const isOwnerByLegacyUid = user && trip.uid === user._id;
    const isOwnerByEmail = email && trip.userEmail === email;

    if (isOwnerByNewField || isOwnerByLegacyUid || isOwnerByEmail) {
      return trip;
    }

    return null;
  },
});