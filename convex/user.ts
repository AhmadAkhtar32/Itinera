import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, getDefaultRole, requireUser } from "./authHelpers";

export const CreateNewUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized. Please sign in first.");
    }

    const clerkId = identity.subject;
    const email = identity.email?.toLowerCase() ?? args.email.toLowerCase();
    const name = identity.name ?? args.name;
    const imageUrl = identity.pictureUrl ?? args.imageUrl;
    const now = Date.now();

    const existingUserByClerkId = await ctx.db
      .query("Usertable")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .unique();

    if (existingUserByClerkId) {
      const updatedUser = {
        name,
        email,
        imageUrl,
        role: existingUserByClerkId.role ?? getDefaultRole(email),
        credits: existingUserByClerkId.credits ?? 3,
        isPro: existingUserByClerkId.isPro ?? false,
        clerkId,
        updatedAt: now,
      };

      await ctx.db.patch(existingUserByClerkId._id, updatedUser);

      return {
        ...existingUserByClerkId,
        ...updatedUser,
      };
    }

    const existingUserByEmail = await ctx.db
      .query("Usertable")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existingUserByEmail) {
      const updatedUser = {
        name,
        email,
        imageUrl,
        clerkId,
        role: existingUserByEmail.role ?? getDefaultRole(email),
        credits: existingUserByEmail.credits ?? 3,
        isPro: existingUserByEmail.isPro ?? false,
        updatedAt: now,
      };

      await ctx.db.patch(existingUserByEmail._id, updatedUser);

      return {
        ...existingUserByEmail,
        ...updatedUser,
      };
    }

    const userId = await ctx.db.insert("Usertable", {
      name,
      email,
      imageUrl,
      clerkId,
      role: getDefaultRole(email),
      credits: 3,
      isPro: false,
      createdAt: now,
      updatedAt: now,
    });

    const newUser = await ctx.db.get(userId);

    return newUser;
  },
});

export const GetCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user;
  },
});

export const GetUserByEmail = query({
  args: {
    email: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return user;
  },
});

export const GetUserCredits = query({
  args: {
    userEmail: v.optional(v.string()),
  },
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    return {
      credits: user.credits ?? 0,
      isPro: user.isPro ?? false,
      subscription: user.subscription ?? "free",
    };
  },
});

export const UpgradeUserToPro = mutation({
  args: {
    userEmail: v.optional(v.string()),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const credits =
      args.plan === "yearly" ? 1000 : args.plan === "monthly" ? 100 : 50;

    await ctx.db.patch(user._id, {
      isPro: true,
      subscription: args.plan,
      credits,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "User upgraded successfully",
      credits,
    };
  },
});

// Dummy EasyPaisa / JazzCash / Bank payment verification
export const verifyLocalPayment = mutation({
  args: {
    // Kept for old pricing frontend compatibility.
    // Backend does NOT trust this email anymore.
    email: v.optional(v.string()),
    tid: v.string(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    if (args.tid.trim().length < 10) {
      throw new Error(
        "Invalid Transaction ID. Please check your SMS and try again."
      );
    }

    await ctx.db.patch(user._id, {
      isPro: true,
      subscription: "manual-local-payment",
      credits: 9999,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Payment verified. Welcome to Itinera Pro!",
      method: args.method,
    };
  },
});