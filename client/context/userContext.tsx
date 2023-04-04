/* 
  This provides:
    1. A way for authenticating the user (from getting a code from Github)
        - NOTE: to be used in the "/login" route.
    2. A way to refresh the cookies for authentication.
    3. A way to logout and delete the cookies used for authentication.

  This will automatically call the refresh function when the app is loaded
  to continue with the user's previous session.
*/
import { createContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

import { ReactChildren, UserObjType } from "~utils/types";
import { getCookie } from "~utils/cookies";

interface UserContextInterface {
  errors: { errMsg: string; authErr: boolean };
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

  const [errors, setErrors] = useState({ errMsg: "", authErr: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserObjType | null>(null);

  // "Logs" in user from temporary code provided by Github
  //  - NOTE: mainly to be used in the "/login" route
  const authenticateFromCode = async () => {
    const url = window.location.href;

    // If we have a "code" parameter in our URL set by Github
    if (url.includes("?code")) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, "", newUrl[0]);

      const requestData = { code: newUrl[1] };
      setIsLoading(true);

      const res = await fetch("/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrors({ errMsg: "Login failed.", authErr: true });
        setIsLoading(false);
        return;
      }

      // Successfully logged in
      setUser(data.userData);
      setIsAuthenticated(true);
      setErrors({ errMsg: "", authErr: false });
      setIsLoading(false);
      // Note: Handle redirect where we place this function
    }
  };

  // Attempts to refresh session with access token
  const refreshSession = async () => {
    setIsLoading(true);

    const res = await fetch("/api/auth/token/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCookie("csrf_refresh_token") || "",
      },
    });

    if (!res.ok) {
      // Failed to refresh session - Revoke access to current user
      console.log("[UserContext] Failed to refresh session.");
      const prevAuthState = isAuthenticated;
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);

      if (prevAuthState) router.push("/");
      return;
    }

    // Successfully refreshed session
    console.log("[UserContext] Successfully refreshed session.");
    const data = await res.json();
    setErrors({ errMsg: "", authErr: false });
    setIsLoading(false);
    setIsAuthenticated(true);
    setUser(data.userData);
  };

  // Logouts current user and remove any HttpOnly cookies
  const logout = async () => {
    setIsLoading(true);

    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[UserContext] Successfully logged out.");
    setErrors({ errMsg: "", authErr: false });
    setIsLoading(false);
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  useEffect(() => {
    // On initialization, refresh userdata from cookie if it exists
    refreshSession();
  }, [isAuthenticated]);

  return (
    <UserContext.Provider
      value={{
        errors,
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
