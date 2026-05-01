"use client";

import { useState } from "react";

type CheckoutButtonProps = {
  listingId: string;
  disabled?: boolean;
};

export function CheckoutButton({ listingId, disabled }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ listingId })
    });

    const payload = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !payload.url) {
      setError(payload.error ?? "Unable to start checkout.");
      setIsLoading(false);
      return;
    }

    window.location.href = payload.url;
  }

  return (
    <>
      <button
        className="btn primary"
        disabled={disabled || isLoading}
        type="button"
        onClick={startCheckout}
      >
        {isLoading ? "Opening Checkout..." : "Buy Now"}
      </button>
      {error ? <p className="status-message error">{error}</p> : null}
    </>
  );
}
