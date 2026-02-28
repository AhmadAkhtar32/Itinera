import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// 🛠️ List all authorized admin emails here
const ADMIN_EMAILS = [
  "ahmadakhtar32@gmail.com", 
  "secondadmin@gmail.com" // Add your second admin email here
];

// Fetch Analytics and User List
export const getDashboardData = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    // SECURITY: Check if the provided email exists in our Admin Array
    if (!ADMIN_EMAILS.includes(args.email)) {
      throw new Error("Unauthorized Access: Admins Only");
    }

    const allUsers = await ctx.db.query("Usertable").order("desc").collect();
    const allTrips = await ctx.db.query("TripDetailTable").collect();

    const totalUsers = allUsers.length;
    const totalTrips = allTrips.length;
    
    return {
      stats: {
        totalUsers,
        totalTrips,
        avgTripsPerUser: totalUsers > 0 ? (totalTrips / totalUsers).toFixed(1) : 0
      },
      users: allUsers
    };
  },
});

// Delete a user account
export const deleteUserAccount = mutation({
  args: { adminEmail: v.string(), targetUserId: v.id("Usertable") },
  handler: async (ctx, args) => {
    // SECURITY: Check if the admin's email is in the authorized list
    if (!ADMIN_EMAILS.includes(args.adminEmail)) {
      throw new Error("Unauthorized Access: Admins Only");
    }

    await ctx.db.delete(args.targetUserId);
  }
});