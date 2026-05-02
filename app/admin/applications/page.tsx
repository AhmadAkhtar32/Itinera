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
  PenLine,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminApplicationsPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeStatus, setActiveStatus] = useState<StatusFilter>("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const applications = useQuery(
    api.partners.adminGetApplications,
    isAdmin
      ? {
          status: activeStatus === "all" ? undefined : activeStatus,
        }
      : "skip"
  );

  const approveApplication = useMutation(
    api.partners.adminApproveApplication
  );

  const rejectApplication = useMutation(
    api.partners.adminRejectApplication
  );

  const isLoading =
    !isLoaded ||
    currentUser === undefined ||
    (isAdmin && applications === undefined);

  const handleApprove = async (application: any) => {
    const defaultRate = application.partnerType === "agency" ? 10 : 20;

    const rateInput = window.prompt(
      `Enter commission rate for this ${application.partnerType}.`,
      String(defaultRate)
    );

    if (rateInput === null) return;

    const commissionRate = Number(rateInput);

    if (
      Number.isNaN(commissionRate) ||
      commissionRate < 0 ||
      commissionRate > 100
    ) {
      alert("Please enter a valid commission rate between 0 and 100.");
      return;
    }

    const adminNote =
      window.prompt(
        "Optional admin note for approval:",
        "Approved by Itinera admin."
      ) || undefined;

    try {
      setProcessingId(application._id);

      await approveApplication({
        applicationId: application._id as any,
        commissionRate,
        adminNote,
      });

      alert("Application approved successfully.");
    } catch (error: any) {
      console.error("Approval failed:", error);
      alert(error?.message || "Failed to approve application.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (application: any) => {
    const adminNote = window.prompt(
      "Write rejection reason for this applicant:",
      "Application rejected. Please provide more complete details and apply again."
    );

    if (adminNote === null) return;

    try {
      setProcessingId(application._id);

      await rejectApplication({
        applicationId: application._id as any,
        adminNote,
      });

      alert("Application rejected.");
    } catch (error: any) {
      console.error("Rejection failed:", error);
      alert(error?.message || "Failed to reject application.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">
          Loading admin applications...
        </p>
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
    "pending",
    "approved",
    "rejected",
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
              Partner Applications
            </h1>
            <p className="text-gray-600 mt-2">
              Review, approve, or reject travel agency and collaborator
              applications.
            </p>
          </div>

          <Link href="/admin/partners">
            <Button variant="outline">View Partners</Button>
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
              {status}
            </button>
          ))}
        </div>

        {applications?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <Clock className="mx-auto text-gray-400 mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900">
              No applications found
            </h2>
            <p className="text-gray-500 mt-2">
              There are no {activeStatus} partner applications right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {applications?.map((application: any) => (
              <ApplicationCard
                key={application._id}
                application={application}
                processing={processingId === application._id}
                onApprove={() => handleApprove(application)}
                onReject={() => handleReject(application)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ApplicationCard({
  application,
  processing,
  onApprove,
  onReject,
}: {
  application: any;
  processing: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isAgency = application.partnerType === "agency";

  return (
    <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
        <div className="flex gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              isAgency
                ? "bg-indigo-50 text-indigo-600"
                : "bg-orange-50 text-orange-600"
            }`}
          >
            {isAgency ? <Building2 size={28} /> : <PenLine size={28} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-950">
                {application.displayName}
              </h2>

              <StatusBadge status={application.status} />
            </div>

            <p className="text-gray-500 mt-1">
              {application.email} •{" "}
              <span className="capitalize">{application.partnerType}</span>
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Submitted:{" "}
              {new Date(application.createdAt).toLocaleDateString()}{" "}
              {new Date(application.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {application.status === "pending" && (
          <div className="flex gap-3">
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
              onClick={onApprove}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <CheckCircle2 className="mr-2" size={16} />
              )}
              Approve
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
              {application.description}
            </p>
          </div>

          {application.adminNote && (
            <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4">
              <p className="text-xs uppercase tracking-wider font-bold text-blue-600">
                Admin Note
              </p>
              <p className="text-blue-800 mt-2">{application.adminNote}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <InfoRow label="Phone" value={application.phone || "Not added"} />
          <InfoRow label="City" value={application.city || "Not added"} />
          <InfoRow
            label="Country"
            value={application.country || "Not added"}
          />

          {application.website && (
            <LinkRow label="Website" value={application.website} />
          )}

          {application.documentUrl && (
            <LinkRow label="Document" value={application.documentUrl} />
          )}

          {application.socialLinks?.length > 0 && (
            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
                Social Links
              </p>
              <div className="flex flex-col gap-1 mt-2">
                {application.socialLinks.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 text-sm break-all hover:underline"
                  >
                    {link}
                  </a>
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
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase">
        <CheckCircle2 size={13} />
        Approved
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

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold uppercase">
      <Clock size={13} />
      Pending
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

function LinkRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
        {label}
      </p>
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-blue-600 mt-1 inline-block break-all hover:underline"
      >
        {value}
      </a>
    </div>
  );
}