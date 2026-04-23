import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/account/addresses")({
  head: () => ({ meta: [{ title: "Addresses — ShopHub" }] }),
  component: AddressesPage,
});

function AddressesPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Saved Addresses</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You can enter your shipping address at checkout. Saved address management coming soon.
      </p>
    </div>
  );
}
