import { useContext } from "react";
import { isBefore, subMonths } from "date-fns";

import { UserContext } from "~context/userContext";

const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw Error("useUserContext must be used inside UserContextProvider.");
  }

  const isBanned = !context.user
    ? false
    : context.user.account_status === "banned";
  const isAdmin = !context.user
    ? false
    : ["admin", "owner"].includes(context.user.account_status);
  const isOwner = !context.user
    ? false
    : context.user.account_status === "owner";

  const isAccAge = (months: number) => {
    if (!context.user || months < 0) return false;
    return isBefore(
      new Date(context.user.github_created_at),
      subMonths(Date.now(), months)
    );
  };

  return {
    ...context,
    isBanned,
    isAdmin,
    isOwner,
    isAccAge,
  };
};

export default useUserContext;
