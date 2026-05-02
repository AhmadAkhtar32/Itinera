import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  getCurrentUser,
  requireAdmin,
  requirePartner,
  requireUser,
} from "./authHelpers";

function createSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function getDefaultCommissionRate(partnerType: "agency" | "collaborator") {
  if (partnerType === "agency") return 10;
  return 20;
}

export const applyForPartner = mutation({
  args: {
    partnerType: v.union(v.literal("agency"), v.literal("collaborator")),
    displayName: v.string(),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    country: v.optional(v.string()),
    description: v.string(),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.array(v.string())),
    documentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (user.role === "admin") {
      throw new Error("Admins do not need to apply as partners.");
    }

    if (user.role === "agency" || user.role === "collaborator") {
      throw new Error("You already have partner access.");
    }

    const existingProfile = await ctx.db
      .query("PartnerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingProfile) {
      throw new Error("You already have a partner profile.");
    }

    const existingApplication = await ctx.db
      .query("PartnerApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantUserId", user._id))
      .first();

    if (
      existingApplication &&
      existingApplication.status !== "rejected"
    ) {
      throw new Error("You already have a partner application in progress.");
    }

    const now = Date.now();

    const applicationId = await ctx.db.insert("PartnerApplications", {
      applicantUserId: user._id,
      partnerType: args.partnerType,
      displayName: args.displayName.trim(),
      email: user.email,
      phone: args.phone?.trim(),
      city: args.city?.trim(),
      country: args.country?.trim(),
      description: args.description.trim(),
      website: args.website?.trim(),
      socialLinks: args.socialLinks ?? [],
      documentUrl: args.documentUrl?.trim(),
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      applicationId,
      message: "Your partner application has been submitted.",
    };
  },
});

export const getMyApplication = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) return null;

    const application = await ctx.db
      .query("PartnerApplications")
      .withIndex("by_applicant", (q) => q.eq("applicantUserId", user._id))
      .order("desc")
      .first();

    return application;
  },
});

export const getMyPartnerProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) return null;

    const profile = await ctx.db
      .query("PartnerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return profile;
  },
});

export const getPartnerDashboardSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requirePartner(ctx);

    const profile = await ctx.db
      .query("PartnerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      return null;
    }

    return {
      profile,
      stats: {
        totalSales: profile.totalSales,
        totalRevenue: profile.totalRevenue,
        totalCommission: profile.totalCommission,
        partnerEarnings: profile.totalRevenue - profile.totalCommission,
        ratingAvg: profile.ratingAvg ?? 0,
        ratingCount: profile.ratingCount ?? 0,
      },
    };
  },
});

export const adminGetApplications = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("approved"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.status) {
      return await ctx.db
        .query("PartnerApplications")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("PartnerApplications")
      .order("desc")
      .collect();
  },
});

export const adminGetPartners = query({
  args: {
    partnerType: v.optional(
      v.union(v.literal("agency"), v.literal("collaborator"))
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.partnerType) {
      return await ctx.db
        .query("PartnerProfiles")
        .withIndex("by_partner_type", (q) =>
          q.eq("partnerType", args.partnerType!)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db.query("PartnerProfiles").order("desc").collect();
  },
});

export const adminApproveApplication = mutation({
  args: {
    applicationId: v.id("PartnerApplications"),
    commissionRate: v.optional(v.number()),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      throw new Error("Application not found.");
    }

    if (application.status === "approved") {
      throw new Error("Application is already approved.");
    }

    const applicant = await ctx.db.get(application.applicantUserId);

    if (!applicant) {
      throw new Error("Applicant user no longer exists.");
    }

    const existingProfile = await ctx.db
      .query("PartnerProfiles")
      .withIndex("by_user", (q) => q.eq("userId", applicant._id))
      .first();

    if (existingProfile) {
      throw new Error("This user already has a partner profile.");
    }

    const now = Date.now();
    const baseSlug = createSlug(application.displayName);
    const slug = `${baseSlug || "partner"}-${String(application._id).slice(-6)}`;

    const commissionRate =
      args.commissionRate ??
      getDefaultCommissionRate(application.partnerType);

    const profileId = await ctx.db.insert("PartnerProfiles", {
      userId: applicant._id,
      applicationId: application._id,
      partnerType: application.partnerType,
      displayName: application.displayName,
      slug,
      bio: application.description,
      city: application.city,
      country: application.country,
      status: "active",
      commissionRate,
      totalSales: 0,
      totalRevenue: 0,
      totalCommission: 0,
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(application._id, {
      status: "approved",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(applicant._id, {
      role: application.partnerType,
      updatedAt: now,
    });

    return {
      success: true,
      profileId,
      message: "Partner application approved.",
    };
  },
});

export const adminRejectApplication = mutation({
  args: {
    applicationId: v.id("PartnerApplications"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);

    const application = await ctx.db.get(args.applicationId);

    if (!application) {
      throw new Error("Application not found.");
    }

    if (application.status === "approved") {
      throw new Error("Approved applications cannot be rejected.");
    }

    const now = Date.now();

    await ctx.db.patch(application._id, {
      status: "rejected",
      adminNote: args.adminNote,
      reviewedBy: admin._id,
      reviewedAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      message: "Partner application rejected.",
    };
  },
});

export const adminSuspendPartner = mutation({
  args: {
    partnerId: v.id("PartnerProfiles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const partner = await ctx.db.get(args.partnerId);

    if (!partner) {
      throw new Error("Partner profile not found.");
    }

    await ctx.db.patch(partner._id, {
      status: "suspended",
      updatedAt: Date.now(),
    });

    const user = await ctx.db.get(partner.userId);

    if (user && user.role !== "admin") {
      await ctx.db.patch(user._id, {
        role: "user",
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: args.reason
        ? `Partner suspended: ${args.reason}`
        : "Partner suspended.",
    };
  },
});

export const adminActivatePartner = mutation({
  args: {
    partnerId: v.id("PartnerProfiles"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const partner = await ctx.db.get(args.partnerId);

    if (!partner) {
      throw new Error("Partner profile not found.");
    }

    await ctx.db.patch(partner._id, {
      status: "active",
      updatedAt: Date.now(),
    });

    const user = await ctx.db.get(partner.userId);

    if (user && user.role !== "admin") {
      await ctx.db.patch(user._id, {
        role: partner.partnerType,
        updatedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: "Partner activated.",
    };
  },
});