import { useRouter } from "next/router";

import { ReactChildren } from "~utils/types";
import Navigation from "./Navigation";

export default function Layout({ children }: ReactChildren) {
  const router = useRouter();

  // Hide navigation menu on login page
  if (router.pathname.startsWith("/auth/login")) {
    return (
      <div className="container flex max-w-2xl h-screen p-4">{children}</div>
    );
  }

  return (
    <div className="md:relative md:grid md:grid-cols-[min-content_1fr] max-w-full min-h-screen">
      <Navigation />
      <div className="container max-w-5xl p-4 overflow-x-hidden">{children}</div>
    </div>
  );
}
