import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { RxCross2 } from "react-icons/rx";

import { RepositoryObjType } from "~utils/types";
import { LazyText } from "~components/Loading";
import RepoInfoCard from "~components/repository/RepoInfoCard";
import PageRedirectForm from "~components/page_forms/PageRedirectForm";
import SEO from "~components/layout/SEO";

export default function RepositoryPage() {
  const router = useRouter();

  const [repo, setRepo] = useState<RepositoryObjType>();
  const [isLoading, setIsLoading] = useState(true);

  const onRepoClose = () => router.push("/"); // Redirect to homepage

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
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
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

  return (
    <>
      <SEO pageName="Repository" />

      {isLoading && (
        <article className="flex h-full w-full animate-load-in flex-col overflow-y-auto bg-white shadow-md dark:bg-gray-700">
          <header className="grid grid-cols-[1fr_4rem] pb-3 pl-6 pr-3">
            <div className="flex min-w-0 flex-col pt-6">
              <LazyText dimensionStyle="w-20 h-4 mt-2" />
              <LazyText dimensionStyle="w-56 h-7 mt-2" />
              <LazyText dimensionStyle="w-32 h-5 mt-2" />
            </div>
            <div className="align-start flex justify-center border-t-[1.5rem] dark:border-slate-800">
              <button disabled={true} className="mt-2 h-min opacity-50">
                <RxCross2 className="text-3xl" />
              </button>
            </div>
          </header>

          <div className="flex-1 border-l-[1.5rem] border-r-[0.75rem] dark:border-slate-800">
            <div className="px-1">
              <section className="flex flex-wrap gap-1 py-2">
                <LazyText dimensionStyle="w-10 h-4" />
                <LazyText dimensionStyle="w-12 h-4" />
                <LazyText dimensionStyle="w-8 h-4" />
                <LazyText dimensionStyle="w-10 h-4" />
              </section>

              <section className="my-2 text-xs">
                <LazyText dimensionStyle="w-full h-4 mt-2" />
                <LazyText dimensionStyle="w-full h-4 mt-2" />
                <LazyText dimensionStyle="w-20 h-4 mt-2" />
              </section>
            </div>
          </div>

          <footer className="grid grid-cols-[1fr_1fr_min-content] gap-1 py-3 pl-7 pr-4 min-[400px]:grid-cols-[7.5rem_min-content_1fr]">
            <div className="flex flex-col">
              <LazyText dimensionStyle="w-10 h-3.5" />
              <LazyText dimensionStyle="w-14 h-4 mt-1" />
            </div>
            <div className="flex flex-col">
              <LazyText dimensionStyle="w-10 h-3.5" />
              <LazyText dimensionStyle="w-14 h-4 mt-1" />
            </div>
            <div />
          </footer>
        </article>
      )}
      {!isLoading &&
        (!repo ? (
          <div className="flex h-full animate-load-in flex-col items-center justify-center">
            <h1 className="text-center text-3xl font-bold">
              This repository does not exist
            </h1>
            <p className="my-6 text-center">
              Sorry, but we couldn&apos;t find this repository in our database.
            </p>
            <PageRedirectForm />
          </div>
        ) : (
          <div className="h-full animate-load-in">
            <RepoInfoCard
              repository={repo}
              handleRefresh={onRepoRefresh}
              handleClose={onRepoClose}
            />
          </div>
        ))}
    </>
  );
}
