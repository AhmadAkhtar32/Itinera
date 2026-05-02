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

const MarketplaceProductStatus = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("published"),
  v.literal("rejected"),
  v.literal("archived")
);

const Currency = v.union(v.literal("PKR"), v.literal("USD"));

const ProductType = v.union(
  v.literal("agency_package"),
  v.literal("collaborator_plan")
);

const PaymentStatus = v.union(
  v.literal("pending"),
  v.literal("paid"),
  v.literal("failed"),
  v.literal("refunded")
);

const OrderStatus = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("completed"),
  v.literal("cancelled")
);

const DummyPaymentMethod = v.union(
  v.literal("card"),
  v.literal("easypaisa"),
  v.literal("jazzcash"),
  v.literal("bank")
);

const PayoutStatus = v.union(
  v.literal("unpaid"),
  v.literal("paid")
);

const ReviewStatus = v.union(
  v.literal("published"),
  v.literal("hidden")
);

export default defineSchema({
  Usertable: defineTable({
    name: v.string(),
    imageUrl: v.string(),
    email: v.string(),

    subscription: v.optional(v.string()),
    credits: v.optional(v.number()),
    isPro: v.optional(v.boolean()),

    clerkId: v.optional(v.string()),
    role: v.optional(UserRole),

    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_role", ["role"]),

  TripDetailTable: defineTable({
    tripId: v.string(),
    tripDetail: v.any(),

    uid: v.string(),
    userEmail: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),

    ownerId: v.optional(v.id("Usertable")),

    source: v.optional(TripSource),
    visibility: v.optional(TripVisibility),

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

    commissionRate: v.number(),

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

  MarketplacePackages: defineTable({
    partnerId: v.id("PartnerProfiles"),

    title: v.string(),
    destination: v.string(),
    origin: v.optional(v.string()),
    durationDays: v.number(),

    price: v.number(),
    currency: Currency,

    groupSize: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),

    description: v.string(),

    itinerary: v.any(),
    inclusions: v.array(v.string()),
    exclusions: v.array(v.string()),
    terms: v.optional(v.string()),

    status: MarketplaceProductStatus,
    adminNote: v.optional(v.string()),
    reviewedBy: v.optional(v.id("Usertable")),
    reviewedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),

    ratingAvg: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    purchaseCount: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partner", ["partnerId"])
    .index("by_status", ["status"])
    .index("by_destination", ["destination"])
    .index("by_price", ["price"]),

  CollaboratorPlans: defineTable({
    partnerId: v.id("PartnerProfiles"),

    title: v.string(),
    destination: v.string(),
    durationDays: v.number(),

    price: v.number(),
    currency: Currency,

    coverImage: v.optional(v.string()),
    previewText: v.string(),

    fullPlan: v.any(),
    tags: v.array(v.string()),

    status: MarketplaceProductStatus,
    adminNote: v.optional(v.string()),
    reviewedBy: v.optional(v.id("Usertable")),
    reviewedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),

    ratingAvg: v.optional(v.number()),
    ratingCount: v.optional(v.number()),
    purchaseCount: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_partner", ["partnerId"])
    .index("by_status", ["status"])
    .index("by_destination", ["destination"])
    .index("by_price", ["price"]),

  Orders: defineTable({
    buyerId: v.id("Usertable"),
    partnerId: v.id("PartnerProfiles"),

    productType: ProductType,

    packageId: v.optional(v.id("MarketplacePackages")),
    planId: v.optional(v.id("CollaboratorPlans")),

    productTitle: v.string(),

    amount: v.number(),
    currency: Currency,

    platformCommission: v.number(),
    partnerEarning: v.number(),
    commissionRate: v.number(),

    paymentStatus: PaymentStatus,
    orderStatus: OrderStatus,

    dummyPaymentMethod: DummyPaymentMethod,
    dummyTransactionId: v.string(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_partner", ["partnerId"])
    .index("by_product_type", ["productType"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_order_status", ["orderStatus"]),

  CommissionLedger: defineTable({
    orderId: v.id("Orders"),
    partnerId: v.id("PartnerProfiles"),

    productType: ProductType,

    grossAmount: v.number(),
    platformCommission: v.number(),
    partnerEarning: v.number(),
    commissionRate: v.number(),

    currency: Currency,
    payoutStatus: PayoutStatus,

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_partner", ["partnerId"])
    .index("by_payout_status", ["payoutStatus"]),

  Reviews: defineTable({
    orderId: v.id("Orders"),
    reviewerId: v.id("Usertable"),
    partnerId: v.id("PartnerProfiles"),

    productType: ProductType,

    packageId: v.optional(v.id("MarketplacePackages")),
    planId: v.optional(v.id("CollaboratorPlans")),

    rating: v.number(),
    comment: v.string(),

    status: ReviewStatus,

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_order", ["orderId"])
    .index("by_reviewer", ["reviewerId"])
    .index("by_partner", ["partnerId"])
    .index("by_package", ["packageId"])
    .index("by_plan", ["planId"])
    .index("by_status", ["status"]),
});