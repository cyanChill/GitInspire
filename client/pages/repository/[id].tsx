import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { RepositoryObjType } from "~utils/types";
import Spinner from "~components/Spinner";
import RepoInfoCard from "~components/repository/RepoInfoCard";

export default function RepositoryPage() {
  const router = useRouter();

  const [repo, setRepo] = useState<RepositoryObjType>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let abortCtrl = new AbortController();

    if (router.query && router.query.id) {
      setIsLoading(true);

      fetch(`/api/repositories/${router.query.id}`, {
        signal: abortCtrl.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (!data) {
            setRepo(undefined);
            toast.error("Repository data not found.");
          } else if (data.repository) {
            setRepo(data.repository);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setRepo(undefined);
          toast.error("Something went wrong with fetching repository.");
          setIsLoading(false);
        });
    }

    return () => {
      abortCtrl.abort();
    };
  }, [router.query]);

  if (isLoading) {
    return <Spinner />;
  } else if (!repo) {
    return (
      <div>
        <h1>Repository doesn&apos;t exist.</h1>
      </div>
    );
  }

  return (
    <div className="h-full animate-load-in">
      <RepoInfoCard
        repository={repo}
        handleRefresh={() => {}}
        handleClose={() => {console.log("Closing Card")}}
      />
    </div>
  );
}
