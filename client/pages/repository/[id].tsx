import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { RepositoryObjType } from "~utils/types";
import Spinner from "~components/Spinner";
import RepoInfoCard from "~components/repository/RepoInfoCard";
import PageRedirectForm from "~components/page_forms/PageRedirectForm";

export default function RepositoryPage() {
  const router = useRouter();

  const [repo, setRepo] = useState<RepositoryObjType>();
  const [isLoading, setIsLoading] = useState(true);

  const onRepoClose = () => {
    // Redirect to homepage
    router.push("/");
  };

  const onRepoRefresh = (
    exists: boolean,
    id: number,
    refreshData: RepositoryObjType | undefined
  ) => {
    if (!exists) {
      // Redirect to homepage as repository no longer exists in backend
      toast.error("Redirecting to homepage...");
      router.push("/");
    } else {
      toast.success("Successfully refreshed repository data.");
      setRepo(refreshData);
    }
  };

  useEffect(() => {
    let abortCtrl = new AbortController();

    if (router.query && router.query.id) {
      setIsLoading(true);

      fetch(`/api/repositories/${router.query.id}`, {
        signal: abortCtrl.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data) {
            setRepo(undefined);
            toast.error("Repository data not found.");
          } else if (data.repository) {
            setRepo(data.repository);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          // Handle non-AbortError(s)
          if (err.name !== "AbortError") {
            setRepo(undefined);
            toast.error("Something went wrong with fetching repository.");
            setIsLoading(false);
          }
        });
    }

    return () => {
      abortCtrl.abort();
    };
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (!repo) {
    return (
      <div className="flex h-full animate-load-in flex-col items-center justify-center">
        <h1 className="text-center text-4xl font-bold">
          This repository does not exist
        </h1>
        <p className="my-6 text-center">
          Sorry, but we couldn&apos;t find this repository in our database.
        </p>
        <PageRedirectForm />
      </div>
    );
  }

  return (
    <div className="h-full animate-load-in">
      <RepoInfoCard
        repository={repo}
        handleRefresh={onRepoRefresh}
        handleClose={onRepoClose}
      />
    </div>
  );
}
