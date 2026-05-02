import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  requireAdmin,
  requireAgency,
  requireCollaborator,
  requirePartner,
} from "./authHelpers";

const currencyValidator = v.union(v.literal("PKR"), v.literal("USD"));

const productStatusValidator = v.union(
  v.literal("draft"),
  v.literal("pending_review"),
  v.literal("published"),
  v.literal("rejected"),
  v.literal("archived")
);

async function getActivePartnerProfile(ctx: any, userId: any) {
  const profile = await ctx.db
    .query("PartnerProfiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) {
    throw new Error("Partner profile not found.");
  }

  if (profile.status !== "active") {
    throw new Error("Your partner profile is not active.");
  }

  return profile;
}

function splitLines(input: string) {
  return input
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseGallery(input?: string) {
  if (!input) return [];

  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/*                            AGENCY PACKAGE APIs                             */
/* -------------------------------------------------------------------------- */

export const createPackage = mutation({
  args: {
    title: v.string(),
    destination: v.string(),
    origin: v.optional(v.string()),
    durationDays: v.number(),
    price: v.number(),
    currency: currencyValidator,
    groupSize: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    galleryText: v.optional(v.string()),
    description: v.string(),
    itineraryText: v.string(),
    inclusionsText: v.string(),
    exclusionsText: v.string(),
    terms: v.optional(v.string()),
    submitForReview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireAgency(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    if (profile.partnerType !== "agency") {
      throw new Error("Only agency partners can create travel packages.");
    }

    if (args.durationDays <= 0) {
      throw new Error("Duration must be greater than 0.");
    }

    if (args.price <= 0) {
      throw new Error("Price must be greater than 0.");
    }

    const now = Date.now();

    const packageId = await ctx.db.insert("MarketplacePackages", {
      partnerId: profile._id,

      title: args.title.trim(),
      destination: args.destination.trim(),
      origin: args.origin?.trim(),
      durationDays: args.durationDays,

      price: args.price,
      currency: args.currency,

      groupSize: args.groupSize?.trim(),
      coverImage: args.coverImage?.trim(),
      gallery: parseGallery(args.galleryText),

      description: args.description.trim(),

      itinerary: splitLines(args.itineraryText),
      inclusions: splitLines(args.inclusionsText),
      exclusions: splitLines(args.exclusionsText),
      terms: args.terms?.trim(),

      status: args.submitForReview ? "pending_review" : "draft",

      ratingAvg: 0,
      ratingCount: 0,
      purchaseCount: 0,

      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      packageId,
      message: args.submitForReview
        ? "Package created and submitted for review."
        : "Package saved as draft.",
    };
  },
});

export const updatePackage = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
    title: v.string(),
    destination: v.string(),
    origin: v.optional(v.string()),
    durationDays: v.number(),
    price: v.number(),
    currency: currencyValidator,
    groupSize: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    galleryText: v.optional(v.string()),
    description: v.string(),
    itineraryText: v.string(),
    inclusionsText: v.string(),
    exclusionsText: v.string(),
    terms: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAgency(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const existingPackage = await ctx.db.get(args.packageId);

    if (!existingPackage) {
      throw new Error("Package not found.");
    }

    if (existingPackage.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this package.");
    }

    if (existingPackage.status === "published") {
      throw new Error("Published packages cannot be edited directly.");
    }

    await ctx.db.patch(existingPackage._id, {
      title: args.title.trim(),
      destination: args.destination.trim(),
      origin: args.origin?.trim(),
      durationDays: args.durationDays,
      price: args.price,
      currency: args.currency,
      groupSize: args.groupSize?.trim(),
      coverImage: args.coverImage?.trim(),
      gallery: parseGallery(args.galleryText),
      description: args.description.trim(),
      itinerary: splitLines(args.itineraryText),
      inclusions: splitLines(args.inclusionsText),
      exclusions: splitLines(args.exclusionsText),
      terms: args.terms?.trim(),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Package updated successfully.",
    };
  },
});

export const getMyPackages = query({
  args: {},
  handler: async (ctx) => {
    const user = await requirePartner(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    if (profile.partnerType !== "agency") {
      return [];
    }

    return await ctx.db
      .query("MarketplacePackages")
      .withIndex("by_partner", (q) => q.eq("partnerId", profile._id))
      .order("desc")
      .collect();
  },
});

export const getMyPackageById = query({
  args: {
    packageId: v.id("MarketplacePackages"),
  },
  handler: async (ctx, args) => {
    const user = await requirePartner(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      return null;
    }

    if (packageItem.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this package.");
    }

    return packageItem;
  },
});

export const submitPackageForReview = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
  },
  handler: async (ctx, args) => {
    const user = await requireAgency(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      throw new Error("Package not found.");
    }

    if (packageItem.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this package.");
    }

    if (packageItem.status === "published") {
      throw new Error("Package is already published.");
    }

    await ctx.db.patch(packageItem._id, {
      status: "pending_review",
      adminNote: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Package submitted for admin review.",
    };
  },
});

export const archivePackage = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
  },
  handler: async (ctx, args) => {
    const user = await requireAgency(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      throw new Error("Package not found.");
    }

    if (packageItem.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this package.");
    }

    await ctx.db.patch(packageItem._id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Package archived.",
    };
  },
});

/* -------------------------------------------------------------------------- */
/*                         COLLABORATOR PAID PLAN APIs                        */
/* -------------------------------------------------------------------------- */

export const createPlan = mutation({
  args: {
    title: v.string(),
    destination: v.string(),
    durationDays: v.number(),
    price: v.number(),
    currency: currencyValidator,
    coverImage: v.optional(v.string()),
    previewText: v.string(),
    fullPlanText: v.string(),
    tagsText: v.string(),
    submitForReview: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await requireCollaborator(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    if (profile.partnerType !== "collaborator") {
      throw new Error("Only collaborators can create paid plans.");
    }

    if (args.durationDays <= 0) {
      throw new Error("Duration must be greater than 0.");
    }

    if (args.price <= 0) {
      throw new Error("Price must be greater than 0.");
    }

    const now = Date.now();

    const planId = await ctx.db.insert("CollaboratorPlans", {
      partnerId: profile._id,

      title: args.title.trim(),
      destination: args.destination.trim(),
      durationDays: args.durationDays,

      price: args.price,
      currency: args.currency,

      coverImage: args.coverImage?.trim(),
      previewText: args.previewText.trim(),

      fullPlan: splitLines(args.fullPlanText),
      tags: args.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),

      status: args.submitForReview ? "pending_review" : "draft",

      ratingAvg: 0,
      ratingCount: 0,
      purchaseCount: 0,

      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      planId,
      message: args.submitForReview
        ? "Plan created and submitted for review."
        : "Plan saved as draft.",
    };
  },
});

export const updatePlan = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
    title: v.string(),
    destination: v.string(),
    durationDays: v.number(),
    price: v.number(),
    currency: currencyValidator,
    coverImage: v.optional(v.string()),
    previewText: v.string(),
    fullPlanText: v.string(),
    tagsText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCollaborator(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    if (plan.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this plan.");
    }

    if (plan.status === "published") {
      throw new Error("Published plans cannot be edited directly.");
    }

    await ctx.db.patch(plan._id, {
      title: args.title.trim(),
      destination: args.destination.trim(),
      durationDays: args.durationDays,
      price: args.price,
      currency: args.currency,
      coverImage: args.coverImage?.trim(),
      previewText: args.previewText.trim(),
      fullPlan: splitLines(args.fullPlanText),
      tags: args.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Plan updated successfully.",
    };
  },
});

export const getMyPlans = query({
  args: {},
  handler: async (ctx) => {
    const user = await requirePartner(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    if (profile.partnerType !== "collaborator") {
      return [];
    }

    return await ctx.db
      .query("CollaboratorPlans")
      .withIndex("by_partner", (q) => q.eq("partnerId", profile._id))
      .order("desc")
      .collect();
  },
});

export const getMyPlanById = query({
  args: {
    planId: v.id("CollaboratorPlans"),
  },
  handler: async (ctx, args) => {
    const user = await requirePartner(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      return null;
    }

    if (plan.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this plan.");
    }

    return plan;
  },
});

export const submitPlanForReview = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
  },
  handler: async (ctx, args) => {
    const user = await requireCollaborator(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    if (plan.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this plan.");
    }

    if (plan.status === "published") {
      throw new Error("Plan is already published.");
    }

    await ctx.db.patch(plan._id, {
      status: "pending_review",
      adminNote: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Plan submitted for admin review.",
    };
  },
});

export const archivePlan = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
  },
  handler: async (ctx, args) => {
    const user = await requireCollaborator(ctx);
    const profile = await getActivePartnerProfile(ctx, user._id);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    if (plan.partnerId !== profile._id) {
      throw new Error("Forbidden. You do not own this plan.");
    }

    await ctx.db.patch(plan._id, {
      status: "archived",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Plan archived.",
    };
  },
});

/* -------------------------------------------------------------------------- */
/*                              ADMIN REVIEW APIs                             */
/* -------------------------------------------------------------------------- */

export const adminGetPackages = query({
  args: {
    status: v.optional(productStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.status) {
      return await ctx.db
        .query("MarketplacePackages")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("MarketplacePackages").order("desc").collect();
  },
});

export const adminGetPlans = query({
  args: {
    status: v.optional(productStatusValidator),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.status) {
      return await ctx.db
        .query("CollaboratorPlans")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("CollaboratorPlans").order("desc").collect();
  },
});

export const adminPublishPackage = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      throw new Error("Package not found.");
    }

    const now = Date.now();

    await ctx.db.patch(packageItem._id, {
      status: "published",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      publishedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Package published.",
    };
  },
});

export const adminRejectPackage = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      throw new Error("Package not found.");
    }

    const now = Date.now();

    await ctx.db.patch(packageItem._id, {
      status: "rejected",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Package rejected.",
    };
  },
});

export const adminPublishPlan = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    const now = Date.now();

    await ctx.db.patch(plan._id, {
      status: "published",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      publishedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Plan published.",
    };
  },
});

export const adminRejectPlan = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    const now = Date.now();

    await ctx.db.patch(plan._id, {
      status: "rejected",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Plan rejected.",
    };
  },
});

/* -------------------------------------------------------------------------- */
/*                              PUBLIC MARKETPLACE                            */
/* -------------------------------------------------------------------------- */

export const getPublishedPackages = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("MarketplacePackages")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

export const getPublishedPlans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("CollaboratorPlans")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

export const getPackageById = query({
  args: {
    packageId: v.id("MarketplacePackages"),
  },
  handler: async (ctx, args) => {
    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) return null;

    if (packageItem.status !== "published") {
      return null;
    }

    const partner = await ctx.db.get(packageItem.partnerId);

    return {
      ...packageItem,
      partner,
    };
  },
});

export const getPlanById = query({
  args: {
    planId: v.id("CollaboratorPlans"),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);

    if (!plan) return null;

    if (plan.status !== "published") {
      return null;
    }

    const partner = await ctx.db.get(plan.partnerId);

    return {
      ...plan,
      partner,
    };
  },
});