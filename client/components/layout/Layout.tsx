import { useRouter } from "next/router";

import { ReactChildren } from "~utils/types";
import Navigation from "./Navigation";

export default function Layout({ children }: ReactChildren) {
  const router = useRouter();

  // Hide navigation menu on login page
  if (router.pathname.startsWith("/auth/login")) {
    return (
      <div className="container flex h-screen max-w-2xl p-4">{children}</div>
    );
  }

  return (
    <div className="min-h-screen max-w-full sm:relative sm:grid sm:grid-cols-[min-content_1fr]">
      <Navigation />
      <div className="container min-h-screen max-w-7xl overflow-x-clip p-4 pb-20 sm:px-6">
        {children}
      </div>
    </div>
  );
}
