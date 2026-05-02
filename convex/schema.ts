import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const UserRole = v.union(
  v.literal("user"),
  v.literal("admin"),
  v.literal("agency"),
  v.literal("collaborator")
);

const TripSource = v.union(
  v.literal("ai_generated"),
  v.literal("reoptimized"),
  v.literal("purchased_package"),
  v.literal("purchased_plan")
);

const TripVisibility = v.union(
  v.literal("private"),
  v.literal("public")
);

const PartnerType = v.union(
  v.literal("agency"),
  v.literal("collaborator")
);

const PartnerApplicationStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

const PartnerProfileStatus = v.union(
  v.literal("active"),
  v.literal("suspended")
);

export default defineSchema({
  Usertable: defineTable({
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),

    // Existing subscription/credit fields
    subscription: v.optional(v.string()),
    credits: v.optional(v.number()),
    isPro: v.optional(v.boolean()),

    // Secure identity fields
    clerkId: v.optional(v.string()),
    role: v.optional(UserRole),

    // Useful for admin analytics later
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  TripDetailTable: defineTable({
    tripId: v.string(),
    tripDetail: v.any(),

    // Existing fields
    uid: v.string(),
    userEmail: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),

    // Secure ownership field
    ownerId: v.optional(v.id("Usertable")),

    // Future marketplace/visibility fields
    source: v.optional(TripSource),
    visibility: v.optional(TripVisibility),

    // Useful for sorting and analytics
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_trip_id", ["tripId"])
    .index("by_uid", ["uid"])
    .index("by_owner", ["ownerId"])
    .index("by_user_email", ["userEmail"])
    .index("by_visibility", ["visibility"]),

  PartnerApplications: defineTable({
    applicantUserId: v.id("Usertable"),
    partnerType: PartnerType,

    displayName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    description: v.string(),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.string())),
    documentUrl: v.optional(v.string()),

    status: PartnerApplicationStatus,
    adminNote: v.optional(v.string()),
    reviewedBy: v.optional(v.id("Usertable")),
    reviewedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_applicant", ["applicantUserId"])
    .index("by_status", ["status"])
    .index("by_partner_type", ["partnerType"])
    .index("by_email", ["email"]),

  PartnerProfiles: defineTable({
    userId: v.id("Usertable"),
    applicationId: v.optional(v.id("PartnerApplications")),

    partnerType: PartnerType,
    displayName: v.string(),
    slug: v.string(),
    bio: v.string(),
    logoUrl: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),

    status: PartnerProfileStatus,

    // Commission percentage taken by Itinera
    commissionRate: v.number(),

    // Marketplace analytics
    totalSales: v.number(),
    totalRevenue: v.number(),
    totalCommission: v.number(),
    ratingAvg: v.optional(v.number()),
    ratingCount: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_partner_type", ["partnerType"]),
});