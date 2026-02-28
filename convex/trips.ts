import { mutation, query } from "./_generated/server"; // 🛠️ Added 'query' here
import { v } from "convex/values";

// Toggle the favorite status of a trip
export const toggleFavorite = mutation({
  args: { 
    id: v.id("TripDetailTable"), 
    isFavorite: v.boolean(), 
    userEmail: v.string() // 🛠️ We pass the email from the frontend
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id);
    if (!trip) throw new Error("Trip not found");

    // 1. Find the user in your Usertable using their email
    const user = await ctx.db.query("Usertable")
      .filter(q => q.eq(q.field("email"), args.userEmail))
      .first();

    // 2. The Bulletproof Check: Match trip.uid to the user's Convex _id
    if (!user || trip.uid !== user._id) {
      console.log("Auth Mismatch! Trip UID:", trip.uid, "User Convex ID:", user?._id);
      throw new Error("Unauthorized to edit this trip");
    }

    await ctx.db.patch(args.id, { isFavorite: args.isFavorite });
  },
});

// Delete a trip completely
export const deleteTrip = mutation({
  args: { 
    id: v.id("TripDetailTable"), 
    userEmail: v.string() 
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.id);
    if (!trip) throw new Error("Trip not found");

    // 1. Find the user in your Usertable using their email
    const user = await ctx.db.query("Usertable")
      .filter(q => q.eq(q.field("email"), args.userEmail))
      .first();

    // 2. The Bulletproof Check: Match trip.uid to the user's Convex _id
    if (!user || trip.uid !== user._id) {
      console.log("Auth Mismatch! Trip UID:", trip.uid, "User Convex ID:", user?._id);
      throw new Error("Unauthorized to delete this trip");
    }

    await ctx.db.delete(args.id);
  },
});

// 🛠️ NEW: Fetch all trips for the Dashboard
export const getUserTrips = query({
  args: { 
    userEmail: v.string() 
  },
  handler: async (ctx, args) => {
    // 1. Find the user in the Usertable
    const user = await ctx.db.query("Usertable")
      .filter(q => q.eq(q.field("email"), args.userEmail))
      .first();

    // If the user doesn't exist yet, return an empty array
    if (!user) return [];

    // 2. Fetch all trips where the 'uid' matches this user's Convex ID
    const trips = await ctx.db.query("TripDetailTable")
      .filter(q => q.eq(q.field("uid"), user._id))
      .order("desc")
      .collect();

    return trips;
  }
});