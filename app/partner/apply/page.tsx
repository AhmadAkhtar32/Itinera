"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, SignInButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  PenLine,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react";

type PartnerType = "agency" | "collaborator";

export default function PartnerApplyPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  const myApplication = useQuery(
    api.partners.getMyApplication,
    isSignedIn ? {} : "skip"
  );

  const myProfile = useQuery(
    api.partners.getMyPartnerProfile,
    isSignedIn ? {} : "skip"
  );

  const applyForPartner = useMutation(api.partners.applyForPartner);

  const [partnerType, setPartnerType] = useState<PartnerType>("agency");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Pakistan");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const isCheckingStatus =
    !isLoaded ||
    (isSignedIn && (myApplication === undefined || myProfile === undefined));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      alert("Please enter your agency/collaborator name.");
      return;
    }

    if (!description.trim() || description.trim().length < 30) {
      alert("Please write at least 30 characters in description.");
      return;
    }

    try {
      setLoading(true);

      await applyForPartner({
        partnerType,
        displayName: displayName.trim(),
        phone: phone.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        website: website.trim() || undefined,
        socialLinks: socialLinks
          .split(",")
          .map((link) => link.trim())
          .filter(Boolean),
        documentUrl: documentUrl.trim() || undefined,
        description: description.trim(),
      });

      alert("Your partner application has been submitted successfully.");
      router.push("/partner/application-status");
    } catch (error: any) {
      console.error("Partner application failed:", error);
      alert(error?.message || "Failed to submit application.");
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-gray-500 font-medium">
            Loading partner application...
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            You need to sign in before applying for the Itinera Partner Program.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In to Apply</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (myProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-green-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            You are already a partner
          </h1>
          <p className="text-gray-600 mt-3">
            Your partner profile is active as{" "}
            <span className="font-bold capitalize">{myProfile.partnerType}</span>.
          </p>

          <Link href="/partner/dashboard">
            <Button className="mt-6 bg-green-600 hover:bg-green-700">
              Open Partner Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (myApplication?.status === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-yellow-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Clock className="mx-auto text-yellow-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Application already submitted
          </h1>
          <p className="text-gray-600 mt-3">
            Your application is currently under admin review.
          </p>

          <Link href="/partner/application-status">
            <Button className="mt-6" variant="outline">
              View Status
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/partner"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Partner Program
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h1 className="text-3xl font-bold text-gray-950">
              Partner Application
            </h1>
            <p className="text-gray-600 mt-2">
              Apply as a travel agency or travel collaborator. Admin will review
              your request before giving you access to the partner portal.
            </p>

            <p className="text-sm text-gray-500 mt-3">
              Applying as:{" "}
              <span className="font-semibold text-gray-900">
                {user?.primaryEmailAddress?.emailAddress}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Partner Type */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Select Partner Type
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPartnerType("agency")}
                  className={`text-left border rounded-2xl p-5 transition-all ${
                    partnerType === "agency"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <Building2
                    className={
                      partnerType === "agency"
                        ? "text-blue-600"
                        : "text-gray-500"
                    }
                    size={30}
                  />
                  <h3 className="font-bold text-lg mt-3 text-gray-900">
                    Travel Agency
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sell full travel packages including hotels, transport,
                    food, guides, and activities.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerType("collaborator")}
                  className={`text-left border rounded-2xl p-5 transition-all ${
                    partnerType === "collaborator"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <PenLine
                    className={
                      partnerType === "collaborator"
                        ? "text-orange-600"
                        : "text-gray-500"
                    }
                    size={30}
                  />
                  <h3 className="font-bold text-lg mt-3 text-gray-900">
                    Travel Collaborator
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Sell affordable itineraries, destination guides, and travel
                    plans.
                  </p>
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {partnerType === "agency"
                    ? "Agency Name"
                    : "Creator / Brand Name"}
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={
                    partnerType === "agency"
                      ? "Example: Northern Tours Pakistan"
                      : "Example: Budget Travel With Ali"
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  City
                </label>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lahore"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Country
                </label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Pakistan"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Website
                </label>
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Document / Portfolio URL
                </label>
                <input
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="Google Drive, portfolio, license, etc."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Social Links
              </label>
              <input
                value={socialLinks}
                onChange={(e) => setSocialLinks(e.target.value)}
                placeholder="Instagram URL, Facebook URL, YouTube URL"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple links with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  partnerType === "agency"
                    ? "Tell us about your agency, tour experience, destinations you cover, and services you offer."
                    : "Tell us about your travel content, experience, destinations you know, and the type of plans you want to sell."
                }
                className="min-h-[160px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 30 characters.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900">Commission Policy</h3>
              <p className="text-sm text-gray-600 mt-2">
                After approval, Itinera will take a platform commission from
                each dummy booking or purchase. Default commission is{" "}
                <span className="font-bold">10%</span> for agencies and{" "}
                <span className="font-bold">20%</span> for collaborators. Admin
                can adjust this during approval.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/partner">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}