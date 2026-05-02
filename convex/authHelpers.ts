import { GenericQueryCtx, GenericMutationCtx } from "convex/server";
import { DataModel, Id } from "./_generated/dataModel";

const ADMIN_EMAILS = [
  "ahmadrao3226@gmail.com",
  "ahsanabdullah2876@gmail.com",
];

type Ctx = GenericQueryCtx<DataModel> | GenericMutationCtx<DataModel>;

export type UserRole = "user" | "admin" | "agency" | "collaborator";

export function getDefaultRole(email?: string | null): UserRole {
  if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
    return "admin";
  }

  return "user";
}

export async function getCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  const clerkId = identity.subject;
  const email = identity.email?.toLowerCase();

  let user = await ctx.db
    .query("Usertable")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user && email) {
    user = await ctx.db
      .query("Usertable")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
  }

  return user;
}

export async function requireUser(ctx: Ctx) {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Unauthorized. Please sign in first.");
  }

  return user;
}

export async function requireAdmin(ctx: Ctx) {
  const user = await requireUser(ctx);

  const isAdminRole = user.role === "admin";
  const isLegacyAdminEmail = ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!isAdminRole && !isLegacyAdminEmail) {
    throw new Error("Forbidden. Admin access required.");
  }

  return user;
}

export async function requirePartner(ctx: Ctx) {
  const user = await requireUser(ctx);

  if (
    user.role !== "agency" &&
    user.role !== "collaborator" &&
    user.role !== "admin"
  ) {
    throw new Error("Forbidden. Partner access required.");
  }

  return user;
}

export async function requireAgency(ctx: Ctx) {
  const user = await requireUser(ctx);

  if (user.role !== "agency" && user.role !== "admin") {
    throw new Error("Forbidden. Agency access required.");
  }

  return user;
}

export async function requireCollaborator(ctx: Ctx) {
  const user = await requireUser(ctx);

  if (user.role !== "collaborator" && user.role !== "admin") {
    throw new Error("Forbidden. Collaborator access required.");
  }

  return user;
}

export function assertTripOwner(
  tripOwnerId: Id<"Usertable"> | undefined,
  currentUserId: Id<"Usertable">
) {
  if (!tripOwnerId || tripOwnerId !== currentUserId) {
    throw new Error("Forbidden. You do not own this trip.");
  }
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}