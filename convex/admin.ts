import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🛠️ Authorized admin emails
const ADMIN_EMAILS = [
  "ahmadrao3226@gmail.com",     // First admin email
  "ahsanabdullah2876@gmail.com" // Second admin email
];

// Fetch Analytics, Trending Destinations, and User List
export const getDashboardData = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // SECURITY: Check if the provided email exists in our Admin Array
    if (!ADMIN_EMAILS.includes(args.email)) {
      throw new Error("Unauthorized Access: Admins Only");
    }

    const allUsers = await ctx.db.query("Usertable").order("desc").collect();
    const allTrips = await ctx.db.query("TripDetailTable").collect();

    // 🛠️ AI Analytics: Aggregate Destination Counts
    const destinationCounts: Record<string, number> = {};
    allTrips.forEach((trip) => {
      const dest = trip.tripDetail?.destination;
      if (dest) {
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      }
    });

    // Sort and get top 5 trending destinations
    const topDestinations = Object.entries(destinationCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const totalUsers = allUsers.length;
    const totalTrips = allTrips.length;
    
    return {
      stats: {
        totalUsers,
        totalTrips,
        avgTripsPerUser: totalUsers > 0 ? (totalTrips / totalUsers).toFixed(1) : 0
      },
      topDestinations,
      users: allUsers
    };
  },
});

// Delete a user account (Account Action)
export const deleteUserAccount = mutation({
  args: { adminEmail: v.string(), targetUserId: v.id("Usertable") },
  handler: async (ctx, args) => {
    // SECURITY: Check if the admin's email is authorized
    if (!ADMIN_EMAILS.includes(args.adminEmail)) {
      throw new Error("Unauthorized Access: Admins Only");
    }

    await ctx.db.delete(args.targetUserId);
  }
});