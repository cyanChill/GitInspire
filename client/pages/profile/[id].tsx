import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import { UserObjType, TagObjType, RepositoryObjType } from "~utils/types";
import { isXDaysOld, cleanDate } from "~utils/helpers";
import useUserContext from "~hooks/useUserContext";
import Spinner from "~components/Spinner";
import PageRedirectForm from "~components/page_forms/PageRedirectForm";
import Button from "~components/form/Button";
import SEO from "~components/layout/SEO";

type ContributionType = {
  suggested_tags: TagObjType[];
  suggested_repos: RepositoryObjType[];
};

export default function UserProfilePage() {
  const router = useRouter();
  const { isAuthenticated } = useUserContext();

  const [user, setUser] = useState<UserObjType>();
  const [contributions, setContributions] = useState<ContributionType>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleReport = () => {
    // Redirect to the report route with some information in the URL params
    router.push(`/report?type=user&id=${user?.id}`);
  };

  const refreshInfo = async () => {
    if (!user) return;
    // User data has been refreshed recently
    if (!isXDaysOld(user.last_updated, 1)) return;

    setIsRefreshing(true);
    const res = await fetch(`/api/users/${user.id}/refresh`);
    if (!res.ok) {
      /* Error occurred */
      // Note: Status Code 410 indicates user can't be found with GitHub API
      if (res.status == 410) toast.error("User is no longer found on GitHub .");
      else toast.error("Something went wrong on our servers.");
    } else {
      /* Found user */
      const data = await res.json();
      setUser(data.user);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    let abortCtrl = new AbortController();

    if (router.query && router.query.id) {
      setIsLoading(true);

      fetch(`/api/users/${router.query.id}`, { signal: abortCtrl.signal })
        .then((res) => res.json())
        .then((data) => {
          if (!data) {
            setUser(undefined);
            setContributions(undefined);
            toast.error("User not found.");
          } else if (data.user) {
            setUser(data.user);
            setContributions(data.contributions);
          }
          setIsLoading(false);
        })
        .catch((err) => {
          // Handle non-AbortError(s)
          if (err.name !== "AbortError") {
            setUser(undefined);
            setContributions(undefined);
            toast.error("Something went wrong with fetching user.");
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
      <>
        <SEO pageName="Profile" />
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      </>
    );
  } else if (!user) {
    return (
      <>
        <SEO pageName="Profile" />
        <div className="flex h-full animate-load-in flex-col items-center justify-center">
          <h1 className="text-center text-4xl font-bold">
            This user does not exist
          </h1>
          <p className="my-6 text-center">
            Sorry, but we couldn&apos;t find this user in our database.
          </p>
          <PageRedirectForm />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageName={`${user.username} Profile`} />
      <div className="animate-load-in bg-white p-2 shadow-md dark:bg-slate-800 dark:shadow-slate-700">
        <div className="flex min-w-0 items-end gap-2 border-b-2 pb-2">
          <Image
            src={user?.avatar_url ?? "/assets/default_avatar.png"}
            alt={`${user?.username} profile picture`}
            width={64}
            height={64}
            className="max-w-fit rounded-md bg-slate-800 dark:bg-white"
          />
          <a
            href={`https://github.com/${user.username}`}
            target="_blank"
            rel="noreferrer"
            className="truncate text-2xl font-semibold hover:underline"
          >
            {user.username}
          </a>
        </div>

        <p className="my-2 font-semibold underline">
          ({contributions?.suggested_tags.length ?? 0}) Contributed Tags:
        </p>
        <div className="flex min-w-0 flex-wrap gap-1">
          {contributions?.suggested_tags.map((tg) => (
            <span
              key={tg.name}
              className="truncate rounded-xl bg-neutral-200 px-2 py-0.5 dark:bg-slate-700"
            >
              {tg.display_name}
            </span>
          ))}
        </div>

        <p className="my-2 font-semibold underline">
          ({contributions?.suggested_repos.length ?? 0}) Contributed
          Repositories:
        </p>
        <div className="flex min-w-0 flex-col">
          {contributions?.suggested_repos.map((repo) => (
            <Link
              key={repo.id}
              href={`/repository/${repo.id}`}
              className={`my-1 truncate rounded-md border-[1px] border-slate-300 p-1.5 hover:cursor-pointer hover:bg-slate-300 hover:underline dark:border-slate-600 dark:hover:bg-slate-600`}
            >
              {repo.author}/{repo.repo_name}
            </Link>
          ))}
        </div>

        {/* Action */}
        <hr className="my-2" />
        <p className="my-1 px-2 text-right text-sm italic text-slate-500">
          Last Updated: {cleanDate(user.last_updated)}
        </p>
        <div className="flex flex-wrap justify-end gap-3 px-2 text-sm">
          {isAuthenticated && (
            <button
              className="text-slate-500 hover:underline dark:text-gray-50"
              onClick={handleReport}
            >
              Report a Problem
            </button>
          )}
          {/* Allow refresh button for non-authenticated users */}
          <Button
            className="my-0 w-max"
            clr={{
              bkg: "bg-indigo-400 enabled:hover:bg-indigo-500 disabled:opacity-25",
              txt: "text-white",
            }}
            onClick={refreshInfo}
            disabled={!isXDaysOld(user.last_updated, 1) || isRefreshing}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </>
  );
}
