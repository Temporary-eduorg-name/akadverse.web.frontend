"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

type VerifyStatus = "loading" | "success" | "error";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(
          `/api/marketplace/payment/verify?reference=${encodeURIComponent(reference)}`
        );
        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Payment verification failed.");
          return;
        }

        setStatus("success");
        setMessage("Payment verified. Your order has been created.");
      } catch (error) {
        setStatus("error");
        setMessage("Payment verification failed.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">
          {status === "loading"
            ? "Processing Payment"
            : status === "success"
            ? "Payment Successful"
            : "Payment Failed"}
        </h1>

        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>

        {status === "loading" && (
          <div className="mb-6">
            <LoadingSpinner size="md" />
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push("/studashboard/main-menu/marketplace")}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors"
          >
            Continue Shopping
          </button>

          {status === "error" && (
            <button
              onClick={() => router.push("/studashboard/main-menu/marketplace/checkout")}
              className="w-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white px-6 py-2 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
            >
              Return to Checkout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
