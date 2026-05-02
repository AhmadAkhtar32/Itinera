import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./authHelpers";

// Fetch Analytics, Trending Destinations, and User List
export const getDashboardData = query({
  args: {
    // Kept optional so your old frontend call does not break.
    // Backend does NOT trust this anymore.
    email: v.optional(v.string()),
  },
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const allUsers = await ctx.db.query("Usertable").order("desc").collect();
    const allTrips = await ctx.db.query("TripDetailTable").collect();

    const destinationCounts: Record<string, number> = {};

    allTrips.forEach((trip) => {
      let destName: string | null = null;

      try {
        const detail =
          typeof trip.tripDetail === "string"
            ? JSON.parse(trip.tripDetail)
            : trip.tripDetail;

        destName =
          detail?.destination ||
          detail?.location?.label ||
          detail?.location ||
          detail?.title ||
          null;
      } catch (error) {
        console.error("Failed to parse trip detail", error);
      }

      if (destName && typeof destName === "string") {
        destinationCounts[destName] = (destinationCounts[destName] || 0) + 1;
      }
    });

    const topDestinations = Object.entries(destinationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const enrichedUsers = allUsers.map((user) => {
      const userTrips = allTrips.filter((trip) => {
        const tripOwnerMatches = trip.ownerId && trip.ownerId === user._id;
        const legacyUidMatches = trip.uid === user._id;
        const emailMatches = trip.userEmail === user.email;

        return tripOwnerMatches || legacyUidMatches || emailMatches;
      });

      return {
        ...user,
        tripCount: userTrips.length,
        tier: user.isPro ? "Pro" : "Basic",
        role: user.role ?? "user",
      };
    });

    const totalUsers = allUsers.length;
    const totalTrips = allTrips.length;
    const proUsers = allUsers.filter((user) => user.isPro).length;
    const adminUsers = allUsers.filter((user) => user.role === "admin").length;

    return {
      stats: {
        totalUsers,
        totalTrips,
        proUsers,
        adminUsers,
        avgTripsPerUser:
          totalUsers > 0 ? Number((totalTrips / totalUsers).toFixed(1)) : 0,
      },
      topDestinations,
      users: enrichedUsers,
    };
  },
});

// Delete a user account
export const deleteUserAccount = mutation({
  args: {
    // Kept optional so your old frontend call does not break.
    // Backend does NOT trust this anymore.
    adminEmail: v.optional(v.string()),
    targetUserId: v.id("Usertable"),
  },
  handler: async (ctx, args) => {
    const adminUser = await requireAdmin(ctx);

    if (adminUser._id === args.targetUserId) {
      throw new Error("You cannot delete your own admin account.");
    }

    await ctx.db.delete(args.targetUserId);

    return {
      success: true,
    };
  },
});