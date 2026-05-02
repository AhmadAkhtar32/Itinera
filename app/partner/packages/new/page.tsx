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
  Loader2,
  Save,
  Send,
  AlertCircle,
  ImageIcon,
  ListChecks,
} from "lucide-react";

type Currency = "PKR" | "USD";

export default function NewPackagePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const createPackage = useMutation(api.marketplace.createPackage);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [durationDays, setDurationDays] = useState("3");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("PKR");
  const [groupSize, setGroupSize] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [galleryText, setGalleryText] = useState("");
  const [description, setDescription] = useState("");
  const [itineraryText, setItineraryText] = useState("");
  const [inclusionsText, setInclusionsText] = useState("");
  const [exclusionsText, setExclusionsText] = useState("");
  const [terms, setTerms] = useState("");

  const [loadingAction, setLoadingAction] = useState<"draft" | "review" | null>(
    null
  );

  const isLoading = !isLoaded || (isSignedIn && currentUser === undefined);

  const validateForm = () => {
    if (!title.trim()) {
      alert("Please enter package title.");
      return false;
    }

    if (!destination.trim()) {
      alert("Please enter destination.");
      return false;
    }

    if (!durationDays || Number(durationDays) <= 0) {
      alert("Duration must be greater than 0.");
      return false;
    }

    if (!price || Number(price) <= 0) {
      alert("Price must be greater than 0.");
      return false;
    }

    if (!description.trim() || description.trim().length < 30) {
      alert("Description must be at least 30 characters.");
      return false;
    }

    if (!itineraryText.trim()) {
      alert("Please add package itinerary.");
      return false;
    }

    if (!inclusionsText.trim()) {
      alert("Please add package inclusions.");
      return false;
    }

    if (!exclusionsText.trim()) {
      alert("Please add package exclusions.");
      return false;
    }

    return true;
  };

  const handleCreatePackage = async (submitForReview: boolean) => {
    if (!validateForm()) return;

    try {
      setLoadingAction(submitForReview ? "review" : "draft");

      await createPackage({
        title,
        destination,
        origin: origin.trim() || undefined,
        durationDays: Number(durationDays),
        price: Number(price),
        currency,
        groupSize: groupSize.trim() || undefined,
        coverImage: coverImage.trim() || undefined,
        galleryText: galleryText.trim() || undefined,
        description,
        itineraryText,
        inclusionsText,
        exclusionsText,
        terms: terms.trim() || undefined,
        submitForReview,
      });

      alert(
        submitForReview
          ? "Package created and submitted for admin review."
          : "Package saved as draft."
      );

      router.push("/partner/packages");
    } catch (error: any) {
      console.error("Create package failed:", error);
      alert(error?.message || "Failed to create package.");
    } finally {
      setLoadingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading package form...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Building2 className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in to create agency packages.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "agency") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <AlertCircle className="mx-auto text-orange-500 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Agency Access Required
          </h1>
          <p className="text-gray-600 mt-3">
            Only approved travel agencies can create marketplace packages.
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
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/partner/packages"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Packages
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <Building2 size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Agency Package Builder
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-950">
              Create Travel Package
            </h1>

            <p className="text-gray-600 mt-2">
              Add a complete tour package. You can save it as draft or submit it
              directly for admin review.
            </p>
          </div>

          <div className="p-8 space-y-10">
            {/* Basic Package Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputBlock
                  label="Package Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Example: 3-Day Murree Family Tour"
                />

                <InputBlock
                  label="Destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Example: Murree"
                />

                <InputBlock
                  label="Origin / Starting Point"
                  value={origin}
                  onChange={setOrigin}
                  placeholder="Example: Lahore"
                />

                <InputBlock
                  label="Duration Days"
                  value={durationDays}
                  onChange={setDurationDays}
                  placeholder="3"
                  type="number"
                />

                <InputBlock
                  label="Price"
                  value={price}
                  onChange={setPrice}
                  placeholder="35000"
                  type="number"
                />

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <InputBlock
                  label="Group Size"
                  value={groupSize}
                  onChange={setGroupSize}
                  placeholder="Example: 2–10 people"
                />
              </div>
            </section>

            {/* Images */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Images
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-5">
                <InputBlock
                  label="Cover Image URL"
                  value={coverImage}
                  onChange={setCoverImage}
                  placeholder="Paste image URL"
                />

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Gallery Image URLs
                  </label>
                  <input
                    value={galleryText}
                    onChange={(e) => setGalleryText(e.target.value)}
                    placeholder="Image URL 1, Image URL 2, Image URL 3"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple image URLs with commas.
                  </p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Package Description
              </h2>

              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what this package includes, who it is for, and why users should book it."
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 30 characters.
              </p>
            </section>

            {/* Itinerary */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ListChecks className="text-blue-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Day-wise Itinerary
                </h2>
              </div>

              <Textarea
                value={itineraryText}
                onChange={(e) => setItineraryText(e.target.value)}
                placeholder={`Day 1: Lahore to Murree, hotel check-in, Mall Road visit
Day 2: Patriata chair lift, Kashmir Point, local dinner
Day 3: Breakfast, shopping, return to Lahore`}
                className="min-h-[180px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add each day or activity on a new line.
              </p>
            </section>

            {/* Inclusions / Exclusions */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Inclusions and Exclusions
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Inclusions
                  </label>
                  <Textarea
                    value={inclusionsText}
                    onChange={(e) => setInclusionsText(e.target.value)}
                    placeholder={`Hotel accommodation
Transport
Breakfast
Tour guide`}
                    className="min-h-[160px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add each inclusion on a new line.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Exclusions
                  </label>
                  <Textarea
                    value={exclusionsText}
                    onChange={(e) => setExclusionsText(e.target.value)}
                    placeholder={`Personal shopping
Extra meals
Entry tickets not mentioned
Travel insurance`}
                    className="min-h-[160px] resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add each exclusion on a new line.
                  </p>
                </div>
              </div>
            </section>

            {/* Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Terms and Conditions
              </h2>

              <Textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                placeholder="Example: Booking is subject to availability. Cancellation allowed 48 hours before departure. Dummy payment is used for FYP demo."
                className="min-h-[130px] resize-none"
              />
            </section>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h3 className="font-bold text-blue-900">Review Flow</h3>
              <p className="text-sm text-blue-700 mt-2">
                Draft packages are private to you. Submitted packages go to
                admin review. Only published packages will appear in the public
                marketplace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => handleCreatePackage(false)}
              >
                {loadingAction === "draft" ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2" size={16} />
                    Save as Draft
                  </>
                )}
              </Button>

              <Button
                type="button"
                disabled={loadingAction !== null}
                onClick={() => handleCreatePackage(true)}
              >
                {loadingAction === "review" ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2" size={16} />
                    Submit for Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputBlock({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}