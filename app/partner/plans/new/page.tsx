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
  PenLine,
  Loader2,
  Save,
  Send,
  AlertCircle,
  ImageIcon,
  Tags,
  FileText,
} from "lucide-react";

type Currency = "PKR" | "USD";

export default function NewPlanPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const createPlan = useMutation(api.marketplace.createPlan);

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [durationDays, setDurationDays] = useState("3");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [coverImage, setCoverImage] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [fullPlanText, setFullPlanText] = useState("");
  const [tagsText, setTagsText] = useState("");

  const [loadingAction, setLoadingAction] = useState<"draft" | "review" | null>(
    null
  );

  const isLoading = !isLoaded || (isSignedIn && currentUser === undefined);

  const validateForm = () => {
    if (!title.trim()) {
      alert("Please enter plan title.");
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

    if (!previewText.trim() || previewText.trim().length < 30) {
      alert("Preview text must be at least 30 characters.");
      return false;
    }

    if (!fullPlanText.trim()) {
      alert("Please add full paid plan content.");
      return false;
    }

    if (!tagsText.trim()) {
      alert("Please add at least one tag.");
      return false;
    }

    return true;
  };

  const handleCreatePlan = async (submitForReview: boolean) => {
    if (!validateForm()) return;

    try {
      setLoadingAction(submitForReview ? "review" : "draft");

      await createPlan({
        title,
        destination,
        durationDays: Number(durationDays),
        price: Number(price),
        currency,
        coverImage: coverImage.trim() || undefined,
        previewText,
        fullPlanText,
        tagsText,
        submitForReview,
      });

      alert(
        submitForReview
          ? "Paid plan created and submitted for admin review."
          : "Paid plan saved as draft."
      );

      router.push("/partner/plans");
    } catch (error: any) {
      console.error("Create plan failed:", error);
      alert(error?.message || "Failed to create paid plan.");
    } finally {
      setLoadingAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading paid plan form...</p>
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
            Please sign in to create paid travel plans.
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
            Only approved travel collaborators can create paid travel plans.
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
          href="/partner/plans"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Paid Plans
        </Link>

        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 text-orange-600 mb-2">
              <PenLine size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Collaborator Plan Builder
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-950">
              Create Paid Travel Plan
            </h1>

            <p className="text-gray-600 mt-2">
              Create a paid itinerary, budget guide, hidden-gem plan, or travel
              resource. Save as draft or submit for admin review.
            </p>
          </div>

          <div className="p-8 space-y-10">
            {/* Basic Info */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputBlock
                  label="Plan Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Example: 5-Day Hunza Budget Backpacking Guide"
                />

                <InputBlock
                  label="Destination"
                  value={destination}
                  onChange={setDestination}
                  placeholder="Example: Hunza"
                />

                <InputBlock
                  label="Duration Days"
                  value={durationDays}
                  onChange={setDurationDays}
                  placeholder="5"
                  type="number"
                />

                <InputBlock
                  label="Price"
                  value={price}
                  onChange={setPrice}
                  placeholder="5"
                  type="number"
                />

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500 bg-white"
                  >
                    <option value="USD">USD</option>
                    <option value="PKR">PKR</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Image */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="text-orange-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Cover Image
                </h2>
              </div>

              <InputBlock
                label="Cover Image URL"
                value={coverImage}
                onChange={setCoverImage}
                placeholder="Paste image URL"
              />
            </section>

            {/* Preview */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="text-orange-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">
                  Public Preview
                </h2>
              </div>

              <Textarea
                value={previewText}
                onChange={(e) => setPreviewText(e.target.value)}
                placeholder="Write a short public preview. This is visible before purchase. Do not reveal the full paid plan here."
                className="min-h-[140px] resize-none"
              />

              <p className="text-xs text-gray-500 mt-1">
                Minimum 30 characters. This preview is public.
              </p>
            </section>

            {/* Full Paid Plan */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Full Paid Plan Content
              </h2>

              <Textarea
                value={fullPlanText}
                onChange={(e) => setFullPlanText(e.target.value)}
                placeholder={`Day 1: Arrival, budget hotel check-in, local food street
Day 2: Sunrise viewpoint, free hiking route, local transport tips
Day 3: Hidden village route, food budget, photo spots
Budget Tips: Use shared vans, book guesthouses early
Food Guide: Try local chapshuro and apricot cake`}
                className="min-h-[240px] resize-none"
              />

              <p className="text-xs text-gray-500 mt-1">
                Add each day, tip, or section on a new line. This content will
                be visible after purchase.
              </p>
            </section>

            {/* Tags */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Tags className="text-orange-600" size={20} />
                <h2 className="text-xl font-bold text-gray-900">Tags</h2>
              </div>

              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="budget, backpacking, hidden gems, food, adventure"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
              />

              <p className="text-xs text-gray-500 mt-1">
                Separate tags with commas.
              </p>
            </section>

            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5">
              <h3 className="font-bold text-orange-900">Review Flow</h3>
              <p className="text-sm text-orange-700 mt-2">
                Draft plans are private to you. Submitted plans go to admin
                review. Only published plans will appear in the public
                marketplace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => handleCreatePlan(false)}
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
                onClick={() => handleCreatePlan(true)}
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
        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
      />
    </div>
  );
}