import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// 🛠️ Admins get infinite access automatically
const ADMIN_EMAILS = [
    "ahmadrao3226@gmail.com",     // First admin email
  "ahsanabdullah2876@gmail.com" // Second admin email 
];

export const CreateTripDetail = mutation({
    args: {
        tripId: v.string(),
        uid: v.string(),      // Clerk User ID is a string
        tripDetail: v.any(),
        userEmail: v.string() // 🛠️ We need the email to check their credits
    },
    handler: async (ctx, args) => {
        // 1. Find the user in the database
        const user = await ctx.db.query("Usertable")
            .filter(q => q.eq(q.field("email"), args.userEmail))
            .first();

        if (!user) throw new Error("User account not found");

        // 2. Gatekeeper Logic
        const isAdmin = ADMIN_EMAILS.includes(args.userEmail);
        const isPro = user.isPro === true;
        const credits = user.credits ?? 0;

        // Block them if they are out of credits and not an admin/pro
        if (!isAdmin && !isPro && credits <= 0) {
            throw new Error("INSUFFICIENT_CREDITS");
        }

        // 3. Deduct 1 credit if they are a regular basic user
        if (!isAdmin && !isPro) {
            await ctx.db.patch(user._id, { credits: credits - 1 });
        }

        // 4. Save the trip to the database
        const result = await ctx.db.insert("TripDetailTable", {
            tripDetail: args.tripDetail,
            tripId: args.tripId,
            uid: args.uid,
            userEmail: args.userEmail, // 🛠️ ADD THIS LINE to link the trip to the email!
        });

        return result;
    },
});

export const GetUserTrips = query({
    args: {
        uid: v.string(),  // MUST MATCH your inserted data type
    },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("TripDetailTable")
            .filter((q) => q.eq(q.field("uid"), args.uid))
            .order('desc')
            .collect();

        return result;
    },
});

export const GetTripById = query({
    args: {
        uid: v.string(),
        tripid: v.string()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("TripDetailTable")
            .filter((q) => q.and(
                q.eq(q.field("uid"), args.uid),
                q.eq(q.field('tripId'), args?.tripid)
            ))
            .collect();

        return result[0];
    },
});

export const GetPublicTripById = query({
    args: { tripid: v.string() },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("TripDetailTable")
            .filter((q) => q.eq(q.field('_id'), args.tripid)) 
            .collect();

        return result.length > 0 ? result[0] : null;
    },
});