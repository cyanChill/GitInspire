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

import { ReactChildren, UserDataObj } from "../utils/types";
import { getCookie } from "../utils/cookies";

interface UserContextInterface {
  status: { errMsg: string; isLoading: boolean };
  loggedIn: boolean;
  userData: UserDataObj | null;
  authenticateFromCode: () => {};
  refreshSession: () => {};
  logout: () => {};
}

export const UserContext = createContext<UserContextInterface | undefined>(
  undefined
);

export default function UserContextProvider({ children }: ReactChildren) {
  const router = useRouter();

  const [status, setStatus] = useState({ errMsg: "", isLoading: false });
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  // "Logs" in user from temporary code provided by Github
  //  - NOTE: mainly to be used in the "/login" route
  const authenticateFromCode = async () => {
    const url = window.location.href;

    // If we have a "code" parameter in our URL set by Github
    if (url.includes("?code")) {
      const newUrl = url.split("?code=");
      window.history.pushState({}, "", newUrl[0]);

      const requestData = { code: newUrl[1] };
      setStatus((prev) => ({ ...prev, isLoading: true }));

      const res = await fetch("/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      if (!res.ok) {
        setStatus({ errMsg: "Failed to login.", isLoading: false });
        return;
      }

      // Successfully logged in
      const data = await res.json();
      setUserData(data);
      setLoggedIn(true);
      setStatus({ errMsg: "", isLoading: false });
      // Redirect once we successfully logged in
      router.push("/");
    }
  };

  // Attempts to refresh session with access token
  const refreshSession = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));

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
      setStatus({ errMsg: "", isLoading: false });
      setLoggedIn(false);
      setUserData(null);
      return;
    }

    // Successfully refreshed session
    console.log("[UserContext] Successfully refreshed session.");
    const data = await res.json();
    setStatus({ errMsg: "", isLoading: false });
    setLoggedIn(true);
    setUserData(data.userData);
  };

  // Logouts current user and remove any HttpOnly cookies
  const logout = async () => {
    setStatus((prev) => ({ ...prev, isLoading: true }));

    const res = await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    console.log("[UserContext] Successfully logged out.")
    setStatus({ errMsg: "", isLoading: false });
    setLoggedIn(false);
    setUserData(null);
    router.push("/");
  };

  useEffect(() => {
    // On initialization, refresh userdata from cookie if it exists
    refreshSession();
  }, []);

  return (
    <UserContext.Provider
      value={{
        status,
        loggedIn,
        userData,
        authenticateFromCode,
        refreshSession,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
