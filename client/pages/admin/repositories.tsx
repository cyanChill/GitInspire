import { useEffect } from "react";
import useUserContext from "~hooks/useUserContext";

export default function AdminRepositoriesPage() {
  const { redirectIfNotAdmin } = useUserContext();

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return <div className="animate-load-in">Repositories Page</div>;
}
