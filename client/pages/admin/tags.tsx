import { useEffect } from "react";

import useUserContext from "~hooks/useUserContext";
import Spinner from "~components/Spinner";

export default function AdminTagsPage() {
  const { isAdmin, redirectIfNotAdmin } = useUserContext();

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  if (!isAdmin) {
    return (
      <div className="flexanimate-load-in justify-center">
        <Spinner />
      </div>
    );
  }

  return <div className="animate-load-in">Tags Page</div>;
}
