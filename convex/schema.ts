import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // 1. Rename to UserTable (PascalCase is standard)
    Usertable: defineTable({
        name: v.string(),
        imageUrl: v.string(),
        email: v.string(),
        subscription: v.optional(v.string()),
    }),

    TripDetailTable: defineTable({
        tripId: v.string(),
        tripDetail: v.any(),

        // 2. CRITICAL FIX: Change this to v.string()
        // This allows you to store the Clerk User ID without errors.
        uid: v.string(),
    }),
});