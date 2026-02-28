import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Toggle the favorite status of a trip
export const toggleFavorite = mutation({
  // We use Convex's internal ID to find the exact row
  args: { id: v.id("TripDetailTable"), isFavorite: v.boolean() },
  handler: async (ctx, args) => {
    // 1. Check if user is logged into Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Fetch the trip to make sure it exists
    const trip = await ctx.db.get(args.id);
    
    // 3. Security check: Ensure the logged-in user owns this trip
    if (!trip || trip.uid !== identity.subject) {
      throw new Error("Unauthorized to edit this trip");
    }

    // 4. Update the database
    await ctx.db.patch(args.id, { isFavorite: args.isFavorite });
  },
});

// Delete a trip completely
export const deleteTrip = mutation({
  args: { id: v.id("TripDetailTable") },
  handler: async (ctx, args) => {
    // 1. Check if user is logged into Clerk
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    // 2. Fetch the trip
    const trip = await ctx.db.get(args.id);
    
    // 3. Security check: Ensure the logged-in user owns this trip
    if (!trip || trip.uid !== identity.subject) {
      throw new Error("Unauthorized to delete this trip");
    }

    // 4. Delete from the database
    await ctx.db.delete(args.id);
  },
});