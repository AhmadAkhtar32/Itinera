import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateTripDetail = mutation({
    args: {
        tripId: v.string(),
        uid: v.string(),      // Clerk User ID is a string
        tripDetail: v.any(),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.insert("TripDetailTable", {
            tripDetail: args.tripDetail,
            tripId: args.tripId,
            uid: args.uid,
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
            .filter((q) => q.and(q.eq(q.field("uid"), args.uid),
                q.eq(q.field('tripId'), args?.tripid)
            ))
            .collect();

        return result[0];
    },
});
// Add this below your existing queries
// In convex/tripDetail.ts
export const GetPublicTripById = query({
    args: { tripid: v.string() },
    handler: async (ctx, args) => {
        const result = await ctx.db
            .query("TripDetailTable")
            // Make sure this says '_id' and not 'tripId'!
            .filter((q) => q.eq(q.field('_id'), args.tripid)) 
            .collect();

        return result.length > 0 ? result[0] : null;
    },
});