"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/server/better-auth/client";

interface AccountControlsProps {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function AccountControls({ variant, onNavigate }: AccountControlsProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return variant === "mobile" ? null : (
      <span className={buttonVariants({ size: "sm" })} aria-hidden="true">
        Sign In
      </span>
    );
  }

  return <AccountSessionControls variant={variant} onNavigate={onNavigate} />;
}

function AccountSessionControls({ variant, onNavigate }: AccountControlsProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return variant === "mobile" ? null : (
      <span className={buttonVariants({ size: "sm" })} aria-hidden="true">
        Sign In
      </span>
    );
  }

  const isAuthed = !!session?.user;

  if (isAuthed) {
    if (variant === "mobile") {
      return (
        <Link
          href="/account"
          onClick={onNavigate}
          className="py-2 text-lg font-medium"
        >
          My Account
        </Link>
      );
    }

    return (
      <Link href="/account" className="rounded-full bg-black p-2">
        <CircleUserRound color="#FFFFFF" />
      </Link>
    );
  }

  if (variant === "mobile") {
    return (
      <Link
        href="/auth/sign-in"
        onClick={onNavigate}
        className={buttonVariants({ variant: "default" })}
      >
        Sign In
      </Link>
    );
  }

  return (
    <Link href="/auth/sign-in" className={buttonVariants({ size: "sm" })}>
      Sign In
    </Link>
  );
}
