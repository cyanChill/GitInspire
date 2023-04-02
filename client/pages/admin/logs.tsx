import { useEffect } from "react";
import useUserContext from "~hooks/useUserContext";

export default function AdminLogsPage() {
  const { redirectIfNotAdmin } = useUserContext();

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return <div className="animate-load-in">Logs Page</div>;
}
