import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, requirePartner, requireUser } from "./authHelpers";

const dummyPaymentMethodValidator = v.union(
  v.literal("card"),
  v.literal("easypaisa"),
  v.literal("jazzcash"),
  v.literal("bank")
);

async function getPartnerProfileForUser(ctx: any, userId: any) {
  const profile = await ctx.db
    .query("PartnerProfiles")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!profile) {
    throw new Error("Partner profile not found.");
  }

  return profile;
}

function calculateCommission(amount: number, commissionRate: number) {
  const platformCommission = Math.round((amount * commissionRate) / 100);
  const partnerEarning = amount - platformCommission;

  return {
    platformCommission,
    partnerEarning,
  };
}

export const createPackageOrder = mutation({
  args: {
    packageId: v.id("MarketplacePackages"),
    dummyPaymentMethod: dummyPaymentMethodValidator,
    dummyTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const buyer = await requireUser(ctx);

    if (args.dummyTransactionId.trim().length < 6) {
      throw new Error("Please enter a valid dummy transaction ID.");
    }

    const packageItem = await ctx.db.get(args.packageId);

    if (!packageItem) {
      throw new Error("Package not found.");
    }

    if (packageItem.status !== "published") {
      throw new Error("This package is not available for booking.");
    }

    const partner = await ctx.db.get(packageItem.partnerId);

    if (!partner || partner.status !== "active") {
      throw new Error("Partner is not active.");
    }

    if (partner.userId === buyer._id) {
      throw new Error("You cannot buy your own package.");
    }

    const now = Date.now();
    const commissionRate = partner.commissionRate;
    const amount = packageItem.price;

    const { platformCommission, partnerEarning } = calculateCommission(
      amount,
      commissionRate
    );

    const orderId = await ctx.db.insert("Orders", {
      buyerId: buyer._id,
      partnerId: partner._id,

      productType: "agency_package",
      packageId: packageItem._id,

      productTitle: packageItem.title,

      amount,
      currency: packageItem.currency,

      platformCommission,
      partnerEarning,
      commissionRate,

      paymentStatus: "paid",
      orderStatus: "confirmed",

      dummyPaymentMethod: args.dummyPaymentMethod,
      dummyTransactionId: args.dummyTransactionId.trim(),

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("CommissionLedger", {
      orderId,
      partnerId: partner._id,

      productType: "agency_package",

      grossAmount: amount,
      platformCommission,
      partnerEarning,
      commissionRate,

      currency: packageItem.currency,
      payoutStatus: "unpaid",

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(packageItem._id, {
      purchaseCount: (packageItem.purchaseCount ?? 0) + 1,
      updatedAt: now,
    });

    await ctx.db.patch(partner._id, {
      totalSales: (partner.totalSales ?? 0) + 1,
      totalRevenue: (partner.totalRevenue ?? 0) + amount,
      totalCommission: (partner.totalCommission ?? 0) + platformCommission,
      updatedAt: now,
    });

    return {
      success: true,
      orderId,
      message: "Package booked successfully.",
    };
  },
});

export const createPlanOrder = mutation({
  args: {
    planId: v.id("CollaboratorPlans"),
    dummyPaymentMethod: dummyPaymentMethodValidator,
    dummyTransactionId: v.string(),
  },
  handler: async (ctx, args) => {
    const buyer = await requireUser(ctx);

    if (args.dummyTransactionId.trim().length < 6) {
      throw new Error("Please enter a valid dummy transaction ID.");
    }

    const plan = await ctx.db.get(args.planId);

    if (!plan) {
      throw new Error("Plan not found.");
    }

    if (plan.status !== "published") {
      throw new Error("This plan is not available for purchase.");
    }

    const partner = await ctx.db.get(plan.partnerId);

    if (!partner || partner.status !== "active") {
      throw new Error("Partner is not active.");
    }

    if (partner.userId === buyer._id) {
      throw new Error("You cannot buy your own plan.");
    }

    const now = Date.now();
    const commissionRate = partner.commissionRate;
    const amount = plan.price;

    const { platformCommission, partnerEarning } = calculateCommission(
      amount,
      commissionRate
    );

    const orderId = await ctx.db.insert("Orders", {
      buyerId: buyer._id,
      partnerId: partner._id,

      productType: "collaborator_plan",
      planId: plan._id,

      productTitle: plan.title,

      amount,
      currency: plan.currency,

      platformCommission,
      partnerEarning,
      commissionRate,

      paymentStatus: "paid",
      orderStatus: "confirmed",

      dummyPaymentMethod: args.dummyPaymentMethod,
      dummyTransactionId: args.dummyTransactionId.trim(),

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("CommissionLedger", {
      orderId,
      partnerId: partner._id,

      productType: "collaborator_plan",

      grossAmount: amount,
      platformCommission,
      partnerEarning,
      commissionRate,

      currency: plan.currency,
      payoutStatus: "unpaid",

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(plan._id, {
      purchaseCount: (plan.purchaseCount ?? 0) + 1,
      updatedAt: now,
    });

    await ctx.db.patch(partner._id, {
      totalSales: (partner.totalSales ?? 0) + 1,
      totalRevenue: (partner.totalRevenue ?? 0) + amount,
      totalCommission: (partner.totalCommission ?? 0) + platformCommission,
      updatedAt: now,
    });

    return {
      success: true,
      orderId,
      message: "Plan purchased successfully.",
    };
  },
});

export const getMyOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const orders = await ctx.db
      .query("Orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      orders.map(async (order) => {
        const partner = await ctx.db.get(order.partnerId);

        let product = null;

        if (order.productType === "agency_package" && order.packageId) {
          product = await ctx.db.get(order.packageId);
        }

        if (order.productType === "collaborator_plan" && order.planId) {
          product = await ctx.db.get(order.planId);
        }

        return {
          ...order,
          partner,
          product,
        };
      })
    );
  },
});

export const getOrderById = query({
  args: {
    orderId: v.id("Orders"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const order = await ctx.db.get(args.orderId);

    if (!order) {
      return null;
    }

    const partner = await ctx.db.get(order.partnerId);

    const isBuyer = order.buyerId === user._id;
    const isPartnerOwner = partner?.userId === user._id;
    const isAdmin = user.role === "admin";

    if (!isBuyer && !isPartnerOwner && !isAdmin) {
      throw new Error("Forbidden. You cannot access this order.");
    }

    let product = null;

    if (order.productType === "agency_package" && order.packageId) {
      product = await ctx.db.get(order.packageId);
    }

    if (order.productType === "collaborator_plan" && order.planId) {
      product = await ctx.db.get(order.planId);
    }

    return {
      ...order,
      partner,
      product,
    };
  },
});

export const getPartnerOrders = query({
  args: {},
  handler: async (ctx) => {
    const user = await requirePartner(ctx);
    const profile = await getPartnerProfileForUser(ctx, user._id);

    const orders = await ctx.db
      .query("Orders")
      .withIndex("by_partner", (q) => q.eq("partnerId", profile._id))
      .order("desc")
      .collect();

    return await Promise.all(
      orders.map(async (order) => {
        const buyer = await ctx.db.get(order.buyerId);

        return {
          ...order,
          buyer,
        };
      })
    );
  },
});

export const getPartnerCommissionSummary = query({
  args: {},
  handler: async (ctx) => {
    const user = await requirePartner(ctx);
    const profile = await getPartnerProfileForUser(ctx, user._id);

    const ledger = await ctx.db
      .query("CommissionLedger")
      .withIndex("by_partner", (q) => q.eq("partnerId", profile._id))
      .order("desc")
      .collect();

    const unpaid = ledger.filter((entry) => entry.payoutStatus === "unpaid");
    const paid = ledger.filter((entry) => entry.payoutStatus === "paid");

    const totalGross = ledger.reduce(
      (sum, entry) => sum + entry.grossAmount,
      0
    );

    const totalCommission = ledger.reduce(
      (sum, entry) => sum + entry.platformCommission,
      0
    );

    const totalPartnerEarning = ledger.reduce(
      (sum, entry) => sum + entry.partnerEarning,
      0
    );

    const unpaidEarnings = unpaid.reduce(
      (sum, entry) => sum + entry.partnerEarning,
      0
    );

    const paidEarnings = paid.reduce(
      (sum, entry) => sum + entry.partnerEarning,
      0
    );

    return {
      profile,
      ledger,
      stats: {
        totalGross,
        totalCommission,
        totalPartnerEarning,
        unpaidEarnings,
        paidEarnings,
        totalTransactions: ledger.length,
      },
    };
  },
});

export const adminGetOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const orders = await ctx.db.query("Orders").order("desc").collect();

    return await Promise.all(
      orders.map(async (order) => {
        const buyer = await ctx.db.get(order.buyerId);
        const partner = await ctx.db.get(order.partnerId);

        return {
          ...order,
          buyer,
          partner,
        };
      })
    );
  },
});

export const adminGetCommissionLedger = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const ledger = await ctx.db
      .query("CommissionLedger")
      .order("desc")
      .collect();

    return await Promise.all(
      ledger.map(async (entry) => {
        const partner = await ctx.db.get(entry.partnerId);
        const order = await ctx.db.get(entry.orderId);

        return {
          ...entry,
          partner,
          order,
        };
      })
    );
  },
});

export const adminMarkPayoutPaid = mutation({
  args: {
    ledgerId: v.id("CommissionLedger"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const entry = await ctx.db.get(args.ledgerId);

    if (!entry) {
      throw new Error("Commission ledger entry not found.");
    }

    await ctx.db.patch(entry._id, {
      payoutStatus: "paid",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Payout marked as paid.",
    };
  },
});