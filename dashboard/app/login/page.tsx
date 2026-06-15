import { redirect } from "next/navigation";

import { LoginForm } from "@/components/LoginForm";
import { getUser } from "@/lib/auth";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const callbackError =
    params.error === "auth_callback_failed"
      ? "Authentication failed. Please try signing in again."
      : undefined;

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Frontend Job Radar
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Private dashboard
        </h1>
      </div>
      <LoginForm callbackError={callbackError} />
    </main>
  );
}
