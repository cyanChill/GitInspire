import { useContext, useCallback } from "react";
import { useRouter } from "next/router";
import { isBefore, subMonths } from "date-fns";

import { UserContext } from "~context/userContext";

const useUserContext = () => {
  const router = useRouter();
  const context = useContext(UserContext);

  if (!context) {
    throw Error("useUserContext must be used inside UserContextProvider.");
  }

  // Basic Account Identification Booleans
  const isBanned = !context.user
    ? false
    : context.user.account_status === "banned";
  const isAdmin = !context.user
    ? false
    : ["admin", "owner"].includes(context.user.account_status);
  const isOwner = !context.user
    ? false
    : context.user.account_status === "owner";

  // Function to see if current user is X months old
  const isAccAge = (months: number) => {
    if (!context.user || months < 0) return false;
    return isBefore(
      new Date(context.user.github_created_at),
      subMonths(Date.now(), months)
    );
  };

  const { isAuthenticated, isLoading } = context;

  // Function to redirect user to "/auth/login" if they're not logged in
  // and save the redirect url
  const redirectIfNotAuth = useCallback(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(
        "[Redirecting to Login Page] Redirecting From:",
        router.asPath
      );
      sessionStorage.setItem("redirectPath", router.asPath);
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated]); /* eslint-disable-line */

  // Function to redirect user to previous path if avaliable after authenticating
  const redirectIfAuth = useCallback(() => {
    if (isAuthenticated) {
      const redirectPath = sessionStorage.getItem("redirectPath");
      console.log("[redirectIfAuth] redirect path:", redirectPath);
      sessionStorage.removeItem("redirectPath");
      router.replace(redirectPath || "/");
    }
  }, [isAuthenticated]); /* eslint-disable-line */

  // Redirect user to home page if they're not an admin
  const redirectIfNotAdmin = useCallback(() => {
    if (!isLoading && !isAdmin) router.replace("/");
  }, [isLoading, isAdmin]); /* eslint-disable-line */

  return {
    ...context,
    isBanned,
    isAdmin,
    isOwner,
    isAccAge,
    redirectIfNotAuth,
    redirectIfAuth,
    redirectIfNotAdmin,
  };
};

export default useUserContext;
