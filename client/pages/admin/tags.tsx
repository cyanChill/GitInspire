import { useEffect } from "react";
import useUserContext from "~hooks/useUserContext";

export default function AdminTagsPage() {
  const { redirectIfNotAdmin } = useUserContext();

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return <div className="animate-load-in">Tags Page</div>;
}
