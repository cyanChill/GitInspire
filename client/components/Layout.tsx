import { useRouter } from "next/router";

import { ReactChildren } from "~utils/types";
import useThemeContext from "~hooks/useThemeContext";

export function Layout({ children }: ReactChildren) {
  const { toggleTheme } = useThemeContext();

  const router = useRouter();

  // Hide navigation menu on login page
  if (router.pathname.startsWith("/auth/login")) {
    return (
      <div className="container flex max-w-2xl h-screen p-4">{children}</div>
    );
  }

  return (
    <div className="container max-w-full min-h-screen flex flex-row">
      <nav className="sticky w-60 h-screen self-start bg-white dark:bg-slate-800 shadow-xl">
        <ul>
          <li onClick={() => router.push("/")}>Home</li>
          <li onClick={() => router.push("/auth/login")}>Login</li>
          <li onClick={() => router.push("/auth/logout")}>Logout</li>
          <li onClick={toggleTheme}>Toggle Theme</li>
        </ul>
      </nav>
      <div className="container max-w-5xl p-4">{children}</div>
    </div>
  );
}
