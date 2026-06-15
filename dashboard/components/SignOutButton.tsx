"use client";

import { useFormStatus } from "react-dom";

import { signOut } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

function SignOutSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button variant="outline" type="submit" disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SignOutSubmitButton />
    </form>
  );
}
