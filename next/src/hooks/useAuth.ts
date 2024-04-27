import { useRouter } from "next/router";
import type { Session, User } from "next-auth";
import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

type Provider = "google" | "github" | "discord";

interface UseAuthOptions {
  protectedRoute?: boolean;
  isAllowed?: (user: User | null) => boolean;
}

interface Auth {
  signIn: (provider?: Provider, returnUrl?: string) => Promise<void>;
  signOut: (redirect?: boolean) => Promise<void>;
  status: "authenticated" | "unauthenticated" | "loading";
  session: Session | null;
}

export function useAuth({ protectedRoute, isAllowed }: UseAuthOptions = { protectedRoute: false, isAllowed: () => true }): Auth {
  const { data: session, status } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (protectedRoute && status === "unauthenticated") {
      handleSignIn().catch(console.error);
    }

    if (protectedRoute && status === "authenticated" && isAllowed && !isAllowed(session?.user)) {
      void push("/404").catch(console.error);
    }
  }, [protectedRoute, isAllowed, status, session, push]);

  const handleSignIn = async (provider?: Provider, returnUrl?: string) => {
    await signIn(provider, { returnUrl });
  };

  const handleSignOut = async (redirect: boolean = true) => {
    await signOut({
      callbackUrl: redirect ? "/" : undefined,
    }).catch(console.error);
  };

  return {
    signIn: handleSignIn,
    signOut: handleSignOut,
    status,
    session,
  };
}
