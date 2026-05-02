"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  PenLine,
  Clock,
  Loader2,
  PlusCircle,
  Send,
  Archive,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Tags,
} from "lucide-react";

export default function PartnerPlansPage() {
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const plans = useQuery(
    api.marketplace.getMyPlans,
    currentUser?.role === "collaborator" ? {} : "skip"
  );

  const submitPlanForReview = useMutation(api.marketplace.submitPlanForReview);
  const archivePlan = useMutation(api.marketplace.archivePlan);

  const isLoading =
    !isLoaded ||
    (isSignedIn && currentUser === undefined) ||
    (currentUser?.role === "collaborator" && plans === undefined);

  const handleSubmitForReview = async (planId: string) => {
    if (!window.confirm("Submit this paid plan for admin review?")) return;

    try {
      await submitPlanForReview({
        planId: planId as any,
      });

      alert("Plan submitted for review.");
    } catch (error: any) {
      console.error("Submit plan failed:", error);
      alert(error?.message || "Failed to submit plan.");
    }
  };

  const handleArchive = async (planId: string) => {
    if (!window.confirm("Archive this plan?")) return;

    try {
      await archivePlan({
        planId: planId as any,
      });

      alert("Plan archived.");
    } catch (error: any) {
      console.error("Archive plan failed:", error);
      alert(error?.message || "Failed to archive plan.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading paid plans...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <PenLine className="mx-auto text-orange-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to manage your paid travel plans.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "collaborator") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <AlertCircle className="mx-auto text-orange-500 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Collaborator Access Required
          </h1>
          <p className="text-gray-600 mt-3">
            Only approved travel collaborators can create and manage paid plans.
          </p>

          <Link href="/partner">
            <Button className="mt-6">Go to Partner Program</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/partner/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Partner Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <PenLine size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Collaborator Portal
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              My Paid Travel Plans
            </h1>

            <p className="text-gray-600 mt-2">
              Create and manage paid itineraries, travel guides, and destination
              plans for the marketplace.
            </p>
          </div>

          <Link href="/partner/plans/new">
            <Button>
              <PlusCircle className="mr-2" size={16} />
              Add Paid Plan
            </Button>
          </Link>
        </div>

        {plans?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <FileText className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No paid plans yet
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Create your first paid travel guide. You can save it as draft or
              submit it for admin review.
            </p>

            <Link href="/partner/plans/new">
              <Button className="mt-6">
                <PlusCircle className="mr-2" size={16} />
                Create First Plan
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {plans?.map((item: any) => (
              <PlanCard
                key={item._id}
                item={item}
                onSubmit={() => handleSubmitForReview(item._id)}
                onArchive={() => handleArchive(item._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlanCard({
  item,
  onSubmit,
  onArchive,
}: {
  item: any;
  onSubmit: () => void;
  onArchive: () => void;
}) {
  const planLines = Array.isArray(item.fullPlan) ? item.fullPlan : [];
  const tags = Array.isArray(item.tags) ? item.tags : [];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 overflow-hidden">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <PenLine size={30} />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-950">
                {item.title}
              </h2>
              <StatusBadge status={item.status} />
            </div>

            <p className="text-gray-500 mt-1">
              {item.destination} • {item.durationDays} days
            </p>

            <p className="text-lg font-bold text-gray-900 mt-2">
              {item.currency} {item.price?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {(item.status === "draft" || item.status === "rejected") && (
            <>
              <Link href={`/partner/plans/${item._id}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>

              <Button onClick={onSubmit}>
                <Send className="mr-2" size={16} />
                Submit
              </Button>
            </>
          )}

          {item.status !== "archived" && (
            <Button
              onClick={onArchive}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Archive className="mr-2" size={16} />
              Archive
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Preview
          </p>
          <p className="text-gray-700 mt-2 leading-relaxed">
            {item.previewText}
          </p>

          {planLines.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
                Full Plan Preview
              </p>
              <ul className="space-y-2">
                {planLines.slice(0, 5).map((line: string, index: number) => (
                  <li
                    key={index}
                    className="flex gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl p-3"
                  >
                    <Clock
                      size={16}
                      className="text-orange-600 shrink-0 mt-0.5"
                    />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {item.adminNote && (
            <div className="mt-5 border border-red-100 bg-red-50 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-red-600">
                Admin Note
              </p>
              <p className="text-red-700 mt-2">{item.adminNote}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <InfoRow label="Purchases" value={String(item.purchaseCount ?? 0)} />
          <InfoRow
            label="Rating"
            value={`${item.ratingAvg ?? 0} / 5 (${item.ratingCount ?? 0})`}
          />
          <InfoRow
            label="Created"
            value={new Date(item.createdAt).toLocaleDateString()}
          />

          {tags.length > 0 && (
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Tags size={15} className="text-orange-600" />
                <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                  Tags
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase">
        <CheckCircle2 size={13} />
        Published
      </span>
    );
  }

  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold uppercase">
        <Clock size={13} />
        Pending Review
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase">
        <XCircle size={13} />
        Rejected
      </span>
    );
  }

  if (status === "archived") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold uppercase">
        <Archive size={13} />
        Archived
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold uppercase">
      Draft
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <p className="font-medium text-gray-900 mt-1 break-all">{value}</p>
    </div>
  );
}