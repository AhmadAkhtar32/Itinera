"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Lock,
  PenLine,
  Receipt,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

type PaymentMethod = "card" | "easypaisa" | "jazzcash" | "bank";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const { isLoaded, isSignedIn } = useUser();

  const type = params.type as string;
  const id = params.id as string;

  const isPackage = type === "package";
  const isPlan = type === "plan";

  const packageData = useQuery(
    api.marketplace.getPackageById,
    isPackage && id ? { packageId: id as any } : "skip"
  );

  const planData = useQuery(
    api.marketplace.getPlanById,
    isPlan && id ? { planId: id as any } : "skip"
  );

  const createPackageOrder = useMutation(api.orders.createPackageOrder);
  const createPlanOrder = useMutation(api.orders.createPlanOrder);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("easypaisa");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);

  const product = useMemo(() => {
    if (isPackage) return packageData;
    if (isPlan) return planData;
    return null;
  }, [isPackage, isPlan, packageData, planData]);

  const isProductLoading =
    (isPackage && packageData === undefined) ||
    (isPlan && planData === undefined);

  const handleCheckout = async () => {
    if (!isSignedIn) {
      alert("Please sign in before checkout.");
      return;
    }

    if (!transactionId.trim() || transactionId.trim().length < 6) {
      alert("Please enter a valid transaction ID. Minimum 6 characters.");
      return;
    }

    try {
      setLoading(true);

      let result;

      if (isPackage) {
        result = await createPackageOrder({
          packageId: id as any,
          PaymentMethod: paymentMethod,
          TransactionId: transactionId,
        });
      } else if (isPlan) {
        result = await createPlanOrder({
          planId: id as any,
          PaymentMethod: paymentMethod,
          TransactionId: transactionId,
        });
      } else {
        throw new Error("Invalid checkout type.");
      }

      alert(result?.message || "Order completed successfully.");
      router.push("/my-bookings");
    } catch (error: any) {
      console.error("Checkout failed:", error);
      alert(error?.message || "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!isPackage && !isPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Receipt className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Invalid Checkout
          </h1>
          <p className="text-gray-600 mt-3">
            This checkout link is not valid.
          </p>

          <Link href="/marketplace">
            <Button className="mt-6">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isLoaded || isProductLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-gray-500 font-medium">Loading checkout...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Receipt className="mx-auto text-gray-400 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Product Not Available
          </h1>
          <p className="text-gray-600 mt-3">
            This item does not exist or is no longer published.
          </p>

          <Link href="/marketplace">
            <Button className="mt-6">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 max-w-md text-center">
          <Lock className="mx-auto text-blue-600 mb-4" size={56} />
          <h1 className="text-3xl font-bold text-gray-900">
            Sign in required
          </h1>
          <p className="text-gray-600 mt-3">
            Please sign in before completing checkout.
          </p>

          <SignInButton mode="modal">
            <Button className="mt-6">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const productTitle = product.title;
  const productPrice = product.price;
  const productCurrency = product.currency;
  const productDestination = product.destination;
  const productDuration = product.durationDays;
  const partnerName = product.partner?.displayName || "Itinera Partner";

  const platformCommissionEstimate =
    product.partner?.commissionRate !== undefined
      ? Math.round((productPrice * product.partner.commissionRate) / 100)
      : 0;

  const partnerEarningEstimate =
    product.partner?.commissionRate !== undefined
      ? productPrice - platformCommissionEstimate
      : 0;

  return (
    <div className="min-h-screen bg-gray-50/60 pb-16">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link
          href={isPackage ? `/marketplace/packages/${id}` : `/marketplace/plans/${id}`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Details
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <CreditCard size={20} />
                <span className="text-sm font-bold uppercase tracking-wider">
                   Checkout
                </span>
              </div>

              <h1 className="text-3xl font-bold text-gray-950">
                Complete Your {isPackage ? "Booking" : "Purchase"}
              </h1>

              <p className="text-gray-600 mt-2">
                This is a  payment flow for FYP. No real money is
                charged.
              </p>
            </div>

            <div className="p-8 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Select  Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PaymentMethodCard
                    label="EasyPaisa"
                    value="easypaisa"
                    selected={paymentMethod === "easypaisa"}
                    onClick={() => setPaymentMethod("easypaisa")}
                  />

                  <PaymentMethodCard
                    label="JazzCash"
                    value="jazzcash"
                    selected={paymentMethod === "jazzcash"}
                    onClick={() => setPaymentMethod("jazzcash")}
                  />

                  <PaymentMethodCard
                    label="Bank Transfer"
                    value="bank"
                    selected={paymentMethod === "bank"}
                    onClick={() => setPaymentMethod("bank")}
                  />

                  <PaymentMethodCard
                    label="Card"
                    value="card"
                    selected={paymentMethod === "card"}
                    onClick={() => setPaymentMethod("card")}
                  />
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                   Transaction ID
                </h2>

                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Example: TXN123456789"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Enter any fake transaction ID with at least 6 characters.
                </p>
              </section>

              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-blue-600 shrink-0" size={22} />
                  <div>
                    <h3 className="font-bold text-blue-900">
                      FYP Payment Notice
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      After clicking confirm, Itinera will create an order,
                      calculate platform commission, calculate partner earnings,
                      and update marketplace analytics.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={18} />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2" size={18} />
                    Confirm  Payment
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isPackage
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-orange-50 text-orange-600"
                  }`}
                >
                  {isPackage ? <Building2 /> : <PenLine />}
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">
                    Order Summary
                  </p>
                  <h2 className="font-bold text-gray-900">
                    {isPackage ? "Agency Package" : "Paid Travel Plan"}
                  </h2>
                </div>
              </div>

              <div className="border-b border-gray-100 pb-5 mb-5">
                <h3 className="font-bold text-xl text-gray-950">
                  {productTitle}
                </h3>
                <p className="text-gray-500 mt-2">
                  {productDestination} • {productDuration} days
                </p>
              </div>

              <div className="space-y-4 mb-5">
                <InfoRow label="Partner" value={partnerName} />
                <InfoRow
                  label="Payment Method"
                  value={paymentMethod.toUpperCase()}
                />
                <InfoRow
                  label="Amount"
                  value={`${productCurrency} ${productPrice.toLocaleString()}`}
                />
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 mb-5">
                <p className="text-xs uppercase font-bold text-gray-500 mb-3">
                   Commission Calculation
                </p>

                <InfoRow
                  label="Commission Rate"
                  value={`${product.partner?.commissionRate ?? 0}%`}
                />
                <InfoRow
                  label="Itinera Share"
                  value={`${productCurrency} ${platformCommissionEstimate.toLocaleString()}`}
                />
                <InfoRow
                  label="Partner Earning"
                  value={`${productCurrency} ${partnerEarningEstimate.toLocaleString()}`}
                />
              </div>

              <p className="text-xs text-gray-400 text-center">
                The commission ledger will be created automatically after 
                payment confirmation.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PaymentMethodCard({
  label,
  selected,
  onClick,
}: {
  label: string;
  value: PaymentMethod;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left border rounded-2xl p-5 transition-all ${
        selected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-900">{label}</p>
          <p className="text-sm text-gray-500 mt-1"> payment method</p>
        </div>

        {selected && <CheckCircle2 className="text-blue-600" size={22} />}
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-900 text-right">{value}</p>
    </div>
  );
}