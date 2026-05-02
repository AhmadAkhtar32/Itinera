"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  ShieldCheck,
  XCircle,
  Archive,
  Send,
} from "lucide-react";

type StatusFilter =
  | "all"
  | "draft"
  | "pending_review"
  | "published"
  | "rejected"
  | "archived";

export default function AdminPackagesPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeStatus, setActiveStatus] =
    useState<StatusFilter>("pending_review");

  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const packages = useQuery(
    api.marketplace.adminGetPackages,
    isAdmin
      ? {
          status: activeStatus === "all" ? undefined : activeStatus,
        }
      : "skip"
  );

  const publishPackage = useMutation(api.marketplace.adminPublishPackage);
  const rejectPackage = useMutation(api.marketplace.adminRejectPackage);

  const isLoading =
    !isLoaded ||
    currentUser === undefined ||
    (isAdmin && packages === undefined);

  const handlePublish = async (item: any) => {
    const adminNote =
      window.prompt(
        "Optional approval note:",
        "Package approved and published on Itinera marketplace."
      ) || undefined;

    try {
      setProcessingId(item._id);

      await publishPackage({
        packageId: item._id as any,
        adminNote,
      });

      alert("Package published successfully.");
    } catch (error: any) {
      console.error("Publish package failed:", error);
      alert(error?.message || "Failed to publish package.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (item: any) => {
    const adminNote = window.prompt(
      "Write rejection reason:",
      "Package rejected. Please improve the package details and submit again."
    );

    if (adminNote === null) return;

    try {
      setProcessingId(item._id);

      await rejectPackage({
        packageId: item._id as any,
        adminNote,
      });

      alert("Package rejected.");
    } catch (error: any) {
      console.error("Reject package failed:", error);
      alert(error?.message || "Failed to reject package.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading packages...</p>
      </div>
    );
  }

  if (!isSignedIn || !currentUser || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <Ban size={64} className="text-red-500 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            This area is restricted to system administrators only.
          </p>
          <Link href="/">
            <Button className="mt-6">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusOptions: StatusFilter[] = [
    "all",
    "draft",
    "pending_review",
    "published",
    "rejected",
    "archived",
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Admin Control Panel
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-950">
              Agency Package Review
            </h1>

            <p className="text-gray-600 mt-2">
              Review, publish, or reject travel packages submitted by agencies.
            </p>
          </div>

          <Link href="/admin/plans">
            <Button variant="outline">Review Collaborator Plans</Button>
          </Link>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2 mb-8">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeStatus === status
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        {packages?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <Package className="mx-auto text-gray-400 mb-4" size={60} />
            <h2 className="text-2xl font-bold text-gray-900">
              No packages found
            </h2>
            <p className="text-gray-500 mt-2">
              There are no {activeStatus.replace("_", " ")} packages right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {packages?.map((item: any) => (
              <AdminPackageCard
                key={item._id}
                item={item}
                processing={processingId === item._id}
                onPublish={() => handlePublish(item)}
                onReject={() => handleReject(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminPackageCard({
  item,
  processing,
  onPublish,
  onReject,
}: {
  item: any;
  processing: boolean;
  onPublish: () => void;
  onReject: () => void;
}) {
  const itineraryItems = Array.isArray(item.itinerary) ? item.itinerary : [];
  const inclusions = Array.isArray(item.inclusions) ? item.inclusions : [];
  const exclusions = Array.isArray(item.exclusions) ? item.exclusions : [];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
            {item.coverImage ? (
              <img
                src={item.coverImage}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 size={30} />
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
              {item.origin ? `${item.origin} → ` : ""}
              {item.destination} • {item.durationDays} days
            </p>

            <p className="text-lg font-bold text-gray-900 mt-2">
              {item.currency} {item.price?.toLocaleString()}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Created: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {item.status === "pending_review" && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={onReject}
              disabled={processing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <XCircle className="mr-2" size={16} />
              )}
              Reject
            </Button>

            <Button
              onClick={onPublish}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CheckCircle2 className="mr-2" size={16} />
              )}
              Publish
            </Button>
          </div>
        )}
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
              Description
            </p>
            <p className="text-gray-700 mt-2 leading-relaxed">
              {item.description}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">
              Itinerary
            </p>
            <ul className="space-y-2">
              {itineraryItems.map((line: string, index: number) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          {item.adminNote && (
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                Admin Note
              </p>
              <p className="text-blue-800 mt-2">{item.adminNote}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <InfoRow label="Group Size" value={item.groupSize || "Not added"} />
          <InfoRow label="Purchases" value={String(item.purchaseCount ?? 0)} />
          <InfoRow
            label="Rating"
            value={`${item.ratingAvg ?? 0} / 5 (${item.ratingCount ?? 0})`}
          />

          <ListBox title="Inclusions" items={inclusions} />
          <ListBox title="Exclusions" items={exclusions} />

          {item.terms && (
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                Terms
              </p>
              <p className="text-sm text-gray-700 mt-2">{item.terms}</p>
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

function ListBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {title}
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No items added.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">
              • {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}