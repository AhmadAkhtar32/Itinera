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
  Loader2,
  PenLine,
  ShieldCheck,
  Power,
  PowerOff,
  Star,
  Wallet,
  TrendingUp,
} from "lucide-react";

type PartnerTypeFilter = "all" | "agency" | "collaborator";

export default function AdminPartnersPage() {
  const { isLoaded, isSignedIn } = useUser();

  const [activeType, setActiveType] = useState<PartnerTypeFilter>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const partners = useQuery(
    api.partners.adminGetPartners,
    isAdmin
      ? {
          partnerType: activeType === "all" ? undefined : activeType,
        }
      : "skip"
  );

  const suspendPartner = useMutation(api.partners.adminSuspendPartner);
  const activatePartner = useMutation(api.partners.adminActivatePartner);

  const isLoading =
    !isLoaded ||
    currentUser === undefined ||
    (isAdmin && partners === undefined);

  const handleSuspend = async (partner: any) => {
    const reason =
      window.prompt(
        `Why do you want to suspend ${partner.displayName}?`,
        "Suspended by Itinera admin."
      ) || undefined;

    if (!window.confirm(`Suspend ${partner.displayName}?`)) return;

    try {
      setProcessingId(partner._id);

      await suspendPartner({
        partnerId: partner._id as any,
        reason,
      });

      alert("Partner suspended successfully.");
    } catch (error: any) {
      console.error("Suspend failed:", error);
      alert(error?.message || "Failed to suspend partner.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivate = async (partner: any) => {
    if (!window.confirm(`Activate ${partner.displayName}?`)) return;

    try {
      setProcessingId(partner._id);

      await activatePartner({
        partnerId: partner._id as any,
      });

      alert("Partner activated successfully.");
    } catch (error: any) {
      console.error("Activation failed:", error);
      alert(error?.message || "Failed to activate partner.");
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading partners...</p>
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

  const typeOptions: PartnerTypeFilter[] = ["all", "agency", "collaborator"];

  const activePartners = partners?.filter((p: any) => p.status === "active") ?? [];
  const suspendedPartners =
    partners?.filter((p: any) => p.status === "suspended") ?? [];

  const totalRevenue =
    partners?.reduce((sum: number, p: any) => sum + (p.totalRevenue ?? 0), 0) ??
    0;

  const totalCommission =
    partners?.reduce(
      (sum: number, p: any) => sum + (p.totalCommission ?? 0),
      0
    ) ?? 0;

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
              Partner Management
            </h1>

            <p className="text-gray-600 mt-2">
              Manage approved agencies and collaborators.
            </p>
          </div>

          <Link href="/admin/applications">
            <Button variant="outline">View Applications</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Total Partners"
            value={partners?.length ?? 0}
            icon={<ShieldCheck size={22} />}
          />

          <StatCard
            title="Active Partners"
            value={activePartners.length}
            icon={<CheckCircle2 size={22} />}
          />

          <StatCard
            title="Suspended"
            value={suspendedPartners.length}
            icon={<PowerOff size={22} />}
          />

          <StatCard
            title="Platform Commission"
            value={`PKR ${totalCommission.toLocaleString()}`}
            icon={<Wallet size={22} />}
          />
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm flex flex-wrap gap-2 mb-8">
          {typeOptions.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-5 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeType === type
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {partners?.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
            <ShieldCheck className="mx-auto text-gray-400 mb-4" size={56} />
            <h2 className="text-2xl font-bold text-gray-900">
              No partners found
            </h2>
            <p className="text-gray-500 mt-2">
              Approved partners will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {partners?.map((partner: any) => (
              <PartnerCard
                key={partner._id}
                partner={partner}
                processing={processingId === partner._id}
                onSuspend={() => handleSuspend(partner)}
                onActivate={() => handleActivate(partner)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h2 className="text-2xl font-bold text-gray-900 mt-1">{value}</h2>
    </div>
  );
}

function PartnerCard({
  partner,
  processing,
  onSuspend,
  onActivate,
}: {
  partner: any;
  processing: boolean;
  onSuspend: () => void;
  onActivate: () => void;
}) {
  const isAgency = partner.partnerType === "agency";

  const partnerEarnings =
    (partner.totalRevenue ?? 0) - (partner.totalCommission ?? 0);

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
                {partner.displayName}
              </h2>

              <StatusBadge status={partner.status} />

              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold uppercase">
                {partner.partnerType}
              </span>
            </div>

            <p className="text-gray-500 mt-1">
              {partner.city || "No city"}, {partner.country || "No country"}
            </p>

            <p className="text-sm text-gray-400 mt-1">
              Joined: {new Date(partner.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          {partner.status === "active" ? (
            <Button
              onClick={onSuspend}
              disabled={processing}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <PowerOff className="mr-2" size={16} />
              )}
              Suspend
            </Button>
          ) : (
            <Button
              onClick={onActivate}
              disabled={processing}
              className="bg-green-600 hover:bg-green-700"
            >
              {processing ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : (
                <Power className="mr-2" size={16} />
              )}
              Activate
            </Button>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <p className="text-xs uppercase tracking-wider font-bold text-gray-400">
            Bio
          </p>
          <p className="text-gray-700 mt-2 leading-relaxed">{partner.bio}</p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MiniStat
              label="Commission Rate"
              value={`${partner.commissionRate}%`}
              icon={<TrendingUp size={16} />}
            />
            <MiniStat
              label="Sales"
              value={partner.totalSales ?? 0}
              icon={<Wallet size={16} />}
            />
            <MiniStat
              label="Rating"
              value={`${partner.ratingAvg ?? 0} / 5`}
              icon={<Star size={16} />}
            />
          </div>
        </div>

        <div className="space-y-3">
          <InfoRow
            label="Total Revenue"
            value={`PKR ${(partner.totalRevenue ?? 0).toLocaleString()}`}
          />

          <InfoRow
            label="Itinera Commission"
            value={`PKR ${(partner.totalCommission ?? 0).toLocaleString()}`}
          />

          <InfoRow
            label="Partner Earnings"
            value={`PKR ${partnerEarnings.toLocaleString()}`}
          />

          <InfoRow label="Slug" value={partner.slug} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase">
        <CheckCircle2 size={13} />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold uppercase">
      <PowerOff size={13} />
      Suspended
    </span>
  );
}

function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <div className="flex items-center gap-2 text-blue-600 mb-2">{icon}</div>
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className="font-bold text-gray-900 mt-1">{value}</p>
    </div>
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