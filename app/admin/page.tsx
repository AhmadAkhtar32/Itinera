"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  Map,
  Activity,
  Trash2,
  Ban,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const { isLoaded, isSignedIn } = useUser();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";

  const dashboardData = useQuery(
    api.admin.getDashboardData,
    isAdmin ? {} : "skip"
  );

  const deleteUser = useMutation(api.admin.deleteUserAccount);

  if (!isLoaded || currentUser === undefined || (isAdmin && dashboardData === undefined)) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">
          Authenticating Admin Portal...
        </p>
      </div>
    );
  }

  if (!isSignedIn || !currentUser || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-red-100 text-center max-w-md">
          <Ban size={64} className="text-red-500 mb-4 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            This area is restricted to system administrators only.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${userName}? This will remove them from the database and reset their Itinera profile.`
    );

    if (!confirmDelete) return;

    try {
      await deleteUser({
        targetUserId: userId as any,
      });

      alert("User successfully removed from platform.");
    } catch (error) {
      console.error("Admin Action Failed:", error);
      alert("Failed to delete user. Check console for details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="container mx-auto px-5 py-10 max-w-6xl">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ShieldCheck size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">
                Admin Control Panel
              </span>
            </div>
            <h1 className="font-bold text-4xl text-gray-900">
              Platform Analytics
            </h1>
          </div>

          <div className="text-right hidden md:block">
            <p className="text-sm text-gray-500">Logged in as</p>
            <p className="font-medium text-gray-900">{currentUser.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <Link
    href="/admin/applications"
    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
  >
    <h3 className="font-bold text-gray-900">Partner Applications</h3>
    <p className="text-sm text-gray-500 mt-1">
      Review agency and collaborator requests.
    </p>
  </Link>

  <Link
    href="/admin/partners"
    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
  >
    <h3 className="font-bold text-gray-900">Partners</h3>
    <p className="text-sm text-gray-500 mt-1">
      Manage approved agencies and collaborators.
    </p>
  </Link>

  <Link
    href="/admin/analytics"
    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
  >
    <h3 className="font-bold text-gray-900">Advanced Analytics</h3>
    <p className="text-sm text-gray-500 mt-1">
      View revenue, bookings, and marketplace stats.
    </p>
  </Link>
</div>

        {/* Platform Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                + Live
              </span>
            </div>
            <p className="text-sm text-gray-500 font-medium">Total Users</p>
            <h2 className="text-3xl font-bold text-gray-900">
              {dashboardData?.stats.totalUsers}
            </h2>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                <Map size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Itineraries Generated
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {dashboardData?.stats.totalTrips}
            </h2>
          </div>

          <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                <Activity size={24} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Avg Trips per User
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              {dashboardData?.stats.avgTripsPerUser}
            </h2>
          </div>
        </div>

        {/* Trending Destinations */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-blue-500" />
            <h2 className="font-bold text-2xl text-gray-900">
              Trending Destinations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardData?.topDestinations?.map((dest: any, index: number) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <p className="text-xs font-bold text-blue-500 uppercase">
                  # {index + 1}
                </p>
                <h3 className="font-bold text-gray-800 truncate">
                  {dest.name}
                </h3>
                <p className="text-xs text-gray-500">{dest.count} trips</p>

                <div className="w-full bg-gray-100 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${
                        (dest.count / (dashboardData.stats.totalTrips || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <h2 className="font-bold text-xl text-gray-900">
              User Management
            </h2>
            <span className="text-sm text-gray-500">
              Synced with Clerk & Convex
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    User Details
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email Address
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Role
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-center">
                    Trips
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Database ID
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {dashboardData?.users.map((dbUser: any) => (
                  <tr
                    key={dbUser._id}
                    className="border-b last:border-0 hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            dbUser.imageUrl ||
                            "/assets/images/placeholder.png"
                          }
                          alt="User"
                          className="w-10 h-10 rounded-full border border-gray-200"
                        />
                        <span className="font-semibold text-gray-900">
                          {dbUser.name}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-600 font-medium">
                      {dbUser.email}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          dbUser.role === "admin"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {dbUser.role ?? "user"}
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          dbUser.tier === "Pro"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "bg-gray-100 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {dbUser.tier}
                      </span>
                    </td>

                    <td className="p-4 text-center font-bold text-gray-900 text-lg">
                      {dbUser.tripCount}
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-mono rounded uppercase">
                        {dbUser._id}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleDeleteUser(dbUser._id, dbUser.name)
                          }
                          disabled={dbUser._id === currentUser._id}
                          className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-500 px-3 py-1.5 rounded-lg border border-red-100 transition-all text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-red-500"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {dashboardData?.users?.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}