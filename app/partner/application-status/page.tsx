"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Building2,
  PenLine,
  FileText,
} from "lucide-react";

export default function PartnerApplicationStatusPage() {
  const { isLoaded, isSignedIn } = useUser();

  const myApplication = useQuery(
    api.partners.getMyApplication,
    isSignedIn ? {} : "skip"
  );

  const myProfile = useQuery(
    api.partners.getMyPartnerProfile,
    isSignedIn ? {} : "skip"
  );

  const isLoading =
    !isLoaded ||
    (isSignedIn && (myApplication === undefined || myProfile === undefined));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 font-medium">
            Loading application status...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <FileText className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to view your partner application status.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (myProfile) {
    return (
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to Partner Program
          </Link>

          <div className="bg-white border border-green-100 rounded-3xl shadow-sm p-8">
            <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-5">
              <CheckCircle2 size={34} />
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Partner Application Approved
            </h1>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Congratulations. Your partner profile is active. You can now access
              the partner dashboard and start managing your marketplace content.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Partner Type
                </p>
                <p className="font-bold text-gray-900 capitalize mt-1">
                  {myProfile.partnerType}
                </p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Commission Rate
                </p>
                <p className="font-bold text-gray-900 mt-1">
                  {myProfile.commissionRate}%
                </p>
              </div>

              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50 sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Public Name
                </p>
                <p className="font-bold text-gray-900 mt-1">
                  {myProfile.displayName}
                </p>
              </div>
            </div>

            <Link href="/partner/dashboard">
              <Button className="mt-7 bg-green-600 hover:bg-green-700">
                Open Partner Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!myApplication) {
    return (
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/partner"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={16} />
            Back to Partner Program
          </Link>

          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={56} />
            <h1 className="text-3xl font-bold text-gray-900">
              No Application Found
            </h1>
            <p className="text-gray-600 mt-3">
              You have not submitted a partner application yet.
            </p>

            <Link href="/partner/apply">
              <Button className="mt-6">Apply Now</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAgency = myApplication.partnerType === "agency";

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/partner"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Partner Program
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  myApplication.status === "pending"
                    ? "bg-yellow-50 text-yellow-600"
                    : myApplication.status === "approved"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                }`}
              >
                {myApplication.status === "pending" && <Clock size={34} />}
                {myApplication.status === "approved" && (
                  <CheckCircle2 size={34} />
                )}
                {myApplication.status === "rejected" && <XCircle size={34} />}
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-gray-500">
                  Application Status
                </p>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {myApplication.status}
                </h1>
              </div>
            </div>

            {myApplication.status === "pending" && (
              <p className="text-gray-600 mt-5 leading-relaxed">
                Your application has been submitted successfully and is waiting
                for admin approval. You will get partner access after approval.
              </p>
            )}

            {myApplication.status === "rejected" && (
              <p className="text-gray-600 mt-5 leading-relaxed">
                Your application was rejected by admin. Review the admin note
                below, improve your information, and apply again.
              </p>
            )}
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isAgency
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-orange-50 text-orange-600"
                }`}
              >
                {isAgency ? <Building2 /> : <PenLine />}
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Partner Type
                </p>
                <p className="font-bold text-gray-900 capitalize">
                  {myApplication.partnerType}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoBox label="Display Name" value={myApplication.displayName} />
              <InfoBox label="Email" value={myApplication.email} />
              <InfoBox label="Phone" value={myApplication.phone || "Not added"} />
              <InfoBox label="City" value={myApplication.city || "Not added"} />
              <InfoBox
                label="Country"
                value={myApplication.country || "Not added"}
              />
              <InfoBox
                label="Website"
                value={myApplication.website || "Not added"}
              />
            </div>

            {myApplication.documentUrl && (
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Document / Portfolio URL
                </p>
                <a
                  href={myApplication.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blue-600 mt-1 inline-block break-all"
                >
                  {myApplication.documentUrl}
                </a>
              </div>
            )}

            {myApplication.socialLinks &&
  myApplication.socialLinks.length > 0 && (
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-xs text-gray-500 uppercase font-bold">
                  Social Links
                </p>
                <div className="flex flex-col gap-1 mt-2">
                  {myApplication.socialLinks.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-600 break-all"
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
              <p className="text-xs text-gray-500 uppercase font-bold">
                Description
              </p>
              <p className="text-gray-700 mt-2 leading-relaxed">
                {myApplication.description}
              </p>
            </div>

            {myApplication.adminNote && (
              <div className="border border-red-100 rounded-2xl p-4 bg-red-50">
                <p className="text-xs text-red-600 uppercase font-bold">
                  Admin Note
                </p>
                <p className="text-red-700 mt-2 leading-relaxed">
                  {myApplication.adminNote}
                </p>
              </div>
            )}

            {myApplication.status === "rejected" && (
              <Link href="/partner/apply">
                <Button>Apply Again</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className="font-medium text-gray-900 mt-1 break-all">{value}</p>
    </div>
  );
}