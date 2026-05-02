"use client";

import React from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Building2,
  PenLine,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Wallet,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

export default function PartnerProgramPage() {
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

  const renderPartnerStatus = () => {
    if (!isSignedIn) {
      return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-xl text-gray-900">
            Join Itinera as a Partner
          </h3>
          <p className="text-gray-600 mt-2">
            Sign in first, then submit your partner application.
          </p>
          <Link href="/sign-in">
            <Button className="mt-5">Sign In to Apply</Button>
          </Link>
        </div>
      );
    }

    if (myProfile) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={28} />
            <div>
              <h3 className="font-bold text-xl text-green-900">
                Partner Access Active
              </h3>
              <p className="text-green-700 text-sm">
                You are registered as{" "}
                <span className="font-bold capitalize">
                  {myProfile.partnerType}
                </span>
                .
              </p>
            </div>
          </div>

          <Link href="/partner/dashboard">
            <Button className="mt-5 bg-green-600 hover:bg-green-700">
              Open Partner Dashboard
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      );
    }

    if (myApplication?.status === "pending") {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Clock className="text-yellow-600" size={28} />
            <div>
              <h3 className="font-bold text-xl text-yellow-900">
                Application Under Review
              </h3>
              <p className="text-yellow-700 text-sm">
                Your {myApplication.partnerType} application is waiting for admin
                approval.
              </p>
            </div>
          </div>

          <Link href="/partner/application-status">
            <Button variant="outline" className="mt-5 border-yellow-300">
              View Application Status
            </Button>
          </Link>
        </div>
      );
    }

    if (myApplication?.status === "rejected") {
      return (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <XCircle className="text-red-600" size={28} />
            <div>
              <h3 className="font-bold text-xl text-red-900">
                Application Rejected
              </h3>
              <p className="text-red-700 text-sm">
                You can review the admin note and submit again.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-5">
            <Link href="/partner/application-status">
              <Button variant="outline" className="border-red-300">
                View Status
              </Button>
            </Link>

            <Link href="/partner/apply">
              <Button>Apply Again</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-xl text-gray-900">
          Become an Itinera Partner
        </h3>
        <p className="text-gray-600 mt-2">
          Agencies can sell travel packages. Collaborators can sell affordable
          travel plans and destination guides.
        </p>

        <Link href="/partner/apply">
          <Button className="mt-5">
            Apply Now
            <ArrowRight size={16} className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/60">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-full px-4 py-2 text-sm font-semibold mb-5">
              <ShieldCheck size={16} />
              Itinera Partner Program
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-950 leading-tight">
              Sell travel packages and plans through Itinera.
            </h1>

            <p className="text-gray-600 text-lg mt-5 leading-relaxed">
              Join Itinera as a travel agency or travel collaborator. Publish
              your packages, receive bookings, and grow your travel business
              while Itinera manages the marketplace experience.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <Wallet className="text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900">Earn Revenue</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Sell packages or paid travel plans.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <BarChart3 className="text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900">Track Sales</h3>
                <p className="text-sm text-gray-500 mt-1">
                  View bookings and earnings later.
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <ShieldCheck className="text-blue-600 mb-3" />
                <h3 className="font-bold text-gray-900">Admin Verified</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Partners are approved by admin.
                </p>
              </div>
            </div>
          </div>

          <div>{isLoading ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-100 rounded w-2/3"></div>
                <div className="h-4 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                <div className="h-10 bg-gray-100 rounded w-32"></div>
              </div>
            </div>
          ) : (
            renderPartnerStatus()
          )}</div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5">
              <Building2 size={28} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              For Travel Agencies
            </h2>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Agencies can create complete travel packages including transport,
              hotels, food, guide services, activities, and group tours.
            </p>

            <ul className="mt-5 space-y-3 text-gray-700">
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Publish local and international tour packages.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Receive dummy booking orders from users.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Itinera calculates commission automatically.
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-5">
              <PenLine size={28} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              For Travel Collaborators
            </h2>

            <p className="text-gray-600 mt-3 leading-relaxed">
              Bloggers and travel creators can sell affordable destination
              guides, custom itineraries, hidden-gem plans, and budget travel
              resources.
            </p>

            <ul className="mt-5 space-y-3 text-gray-700">
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Sell plans for prices like $5, $10, or PKR amounts.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Build credibility through public ratings.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="text-green-600 shrink-0" size={18} />
                Track your earnings in the partner portal.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}