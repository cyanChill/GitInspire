/* 
  This provides:
    1. A way for authenticating the user (from getting a code from GitHub)
        - NOTE: to be used in the "/login" route.
    2. A way to refresh the cookies for authentication.
    3. A way to logout and delete the cookies used for authentication.

  This will automatically call the refresh function when the app is loaded
  to continue with the user's previous session.
*/
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { ReactChildren, UserObjType } from "~utils/types";
import { getCookie, authFetch } from "~utils/cookies";

interface UserContextInterface {
  error: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserObjType | null;
  authenticateFromCode: () => Promise<void>;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextInterface | undefined>(
  undefined
);

export default function UserContextProvider({ children }: ReactChildren) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState<UserObjType | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // "Logs in" user from temporary code provided by Github
  //  - NOTE: mainly to be used in the "/login" route
  const authenticateFromCode = async () => {
    const url = window.location.href;
    // If we have a "code" parameter in our URL set by Github
    if (url.includes("?code")) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, "", newUrl[0]);

      setError("");
      setIsLoading(true);
      await fetch("/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: newUrl[1] }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((data) => {
          // Successfully logged in
          setUser(data.userData);
          setIsAuthenticated(true);
        })
        .catch((err) => setError("Login failed."))
        .finally(() => setIsLoading(false));
    }
  };

  // Attempts to refresh session with access token
  const refreshSession = async () => {
    const refreshToken = getCookie("csrf_refresh_token") || "";
    setIsLoading(false); // Work around to keep our redirect functions working
    if (!refreshToken) return;

    setIsLoading(true);
    await fetch("/api/auth/token/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": refreshToken,
      },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        // Successfully refreshed session
        setIsAuthenticated(true);
        setUser(data.userData);
      })
      .catch((err) => {
        // Failed to refresh session - Revoke access to current user
        const prevAuthState = isAuthenticated;
        setIsAuthenticated(false);
        setUser(null);
        if (prevAuthState) router.push("/auth/login");
      })
      .finally(() => setIsLoading(false));
  };

  // Logouts current user and remove any HttpOnly cookies
  const logout = async () => {
    setIsLoading(true);
    const res = await authFetch("/api/auth/logout", { method: "POST" });

    setIsAuthenticated(false);
    setUser(null);
    setIsLoading(false);
    router.push("/");
  };

  useEffect(() => {
    // On initialization, refresh user data from cookie if it exists
    refreshSession();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider
      value={{
        error,
        isLoading,
        isAuthenticated,
        user,
        authenticateFromCode,
        refreshSession,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
