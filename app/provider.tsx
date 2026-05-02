"use client";

import React, { useContext, useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "@/context/UserDetailContext";
import {
  TripContextType,
  TripDetailContext,
} from "@/context/TripDetailContext";
import { TripInfo } from "./create-new-trip/_components/ChatBox";

function Provider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const createUser = useMutation(api.user.CreateNewUser);

  const [userDetail, setUserDetail] = useState<any>();
  const [tripDetailInfo, setTripDetailInfo] = useState<TripInfo | null>(null);

  const { user, isSignedIn, isLoaded } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoaded || isLoading) return;
    if (!isSignedIn || !isAuthenticated || !user) return;

    createNewUser();
  }, [isLoaded, isLoading, isSignedIn, isAuthenticated, user]);

  const createNewUser = async () => {
    if (!user) return;

    try {
      const result = await createUser({
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
        name: user.fullName ?? "",
      });

      setUserDetail(result);
    } catch (error) {
      console.error("Failed to create or sync user:", error);
    }
  };

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      <TripDetailContext.Provider
        value={{ tripDetailInfo, setTripDetailInfo }}
      >
        {children}
      </TripDetailContext.Provider>
    </UserDetailContext.Provider>
  );
}

export default Provider;

export const useUserDetail = () => {
  return useContext(UserDetailContext);
};

export const userTripDetail = (): TripContextType | undefined => {
  return useContext(TripDetailContext);
};