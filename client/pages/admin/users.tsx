import { useEffect } from "react";
import useUserContext from "~hooks/useUserContext";

export default function AdminUsersPage() {
  const { redirectIfNotAdmin } = useUserContext();

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return <div className="animate-load-in">Users Page</div>;
}
