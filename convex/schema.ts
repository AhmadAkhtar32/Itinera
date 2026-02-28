import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    Usertable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        subscription: v.optional(v.string()),
        credits: v.optional(v.number()),
    isPro: v.optional(v.boolean()),
    }),

    TripDetailTable: defineTable({
        tripId: v.string(),
        tripDetail: v.any(),
        uid: v.string(),
        isFavorite: v.optional(v.boolean()), // Added for favorites
    }),
});