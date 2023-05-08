import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaCrown, FaGithub } from "react-icons/fa";
import { TbShieldCheckFilled } from "react-icons/tb";

import { UserObjType, TagObjType, RepositoryObjType } from "~utils/types";
import { isXDaysOld, cleanDate } from "~utils/helpers";
import useUserContext from "~hooks/useUserContext";
import PageRedirectForm from "~components/page_forms/PageRedirectForm";
import Button from "~components/form/Button";
import { LazyText } from "~components/Loading";
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
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
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

  if (!isLoading && !user) {
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

  const numCtbTags = contributions?.suggested_tags.length ?? 0;
  const numCtbRepos = contributions?.suggested_repos.length ?? 0;

  return (
    <>
      <SEO pageName={isLoading ? "Profile" : `${user?.username} Profile`} />

      <main className="animate-load-in">
        {/* Profile Picture + Name */}
        <header className="flex gap-4">
          {isLoading ? (
            <div className="lazy-bg dark:lazy-bg-dark h-16 w-16 shrink-0 animate-lazy-bg border border-[1px] border-slate-600 bg-stone-950 p-2 shadow-[5px_5px] shadow-orange-p-600 dark:border-slate-300 dark:bg-white min-[400px]:h-24 min-[400px]:w-24" />
          ) : (
            <Image
              src={user?.avatar_url ?? "/assets/default_avatar.png"}
              alt={`${user?.username} profile picture`}
              width={96}
              height={96}
              className="h-16 w-16 shrink-0 border border-[1px] border-slate-600 bg-stone-950 p-2 shadow-[5px_5px] shadow-orange-p-600 dark:border-slate-300 dark:bg-white min-[400px]:h-24 min-[400px]:w-24"
            />
          )}
          {isLoading ? (
            <LazyText dimensionStyle="self-end h-7 w-full min-[400px]:w-52 min-[400px]:h-9" />
          ) : (
            <a
              href={`https://github.com/${user?.username}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-2 self-end text-xl font-semibold hocus:underline min-[400px]:text-3xl"
            >
              <span className="truncate">{user?.username}</span>
              <FaGithub className="shrink-0" />
              {user?.account_status === "admin" && (
                <TbShieldCheckFilled className="shrink-0 text-purple-500" />
              )}
              {user?.account_status === "owner" && (
                <FaCrown className="shrink-0 text-orange-p-600" />
              )}
            </a>
          )}
        </header>

        {/* Contribution Information */}
        {isLoading ? (
          <>
            <LazyText dimensionStyle="w-full min-[400px]:w-96 h-5 mt-4" />
            <LazyText dimensionStyle="w-full h-9 mt-4" />
            <LazyText dimensionStyle="w-full h-9 mt-4" />
          </>
        ) : (
          <>
            <p className="mt-4 text-sm">
              They contributed{" "}
              <span className="font-semibold">{numCtbTags}</span> tags and{" "}
              <span className="font-semibold">{numCtbRepos}</span> repositories
              to <span className="font-semibold">GitInspire</span>.
            </p>

            <ProfileAccordion amount={numCtbTags} variant="Tags">
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
            </ProfileAccordion>

            <ProfileAccordion amount={numCtbRepos} variant="Repositories">
              <div className="flex min-w-0 flex-col gap-1">
                {contributions?.suggested_repos.map((repo) => (
                  <Link
                    key={repo.id}
                    href={`/repository/${repo.id}`}
                    className={`my-1 truncate rounded-md border-[1px] border-slate-300 p-1.5 hocus:cursor-pointer hocus:bg-slate-200 hocus:underline dark:border-slate-600 dark:hocus:bg-slate-600`}
                  >
                    {repo.author}/{repo.repo_name}
                  </Link>
                ))}
              </div>
            </ProfileAccordion>
          </>
        )}

        {/* Action */}
        {!isLoading && user && (
          <>
            <hr className="my-2" />
            <p className="my-1 px-2 text-right text-sm italic text-slate-500">
              Last Updated: {cleanDate(user.last_updated)}
            </p>
            <div className="flex flex-wrap justify-end gap-3 px-2 text-sm">
              {isAuthenticated && (
                <button
                  className="text-slate-500 hocus:underline dark:text-gray-50"
                  onClick={handleReport}
                >
                  Report a Problem
                </button>
              )}
              {/* Allow refresh button for non-authenticated users */}
              <Button
                className="my-0 w-max"
                clr={{
                  bkg: "bg-teal-p-600 enabled:hocus:bg-teal-p-700 disabled:opacity-25",
                  txt: "text-white",
                }}
                onClick={refreshInfo}
                disabled={!isXDaysOld(user.last_updated, 1) || isRefreshing}
              >
                Refresh Data
              </Button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

type ProfileAccordionType = {
  amount: number;
  variant: "Tags" | "Repositories";
  children: React.ReactNode;
};

function ProfileAccordion({ amount, variant, children }: ProfileAccordionType) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-4 rounded-md bg-white dark:bg-slate-800">
      <button
        className="block w-full p-2 text-sm text-start"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="rounded-md bg-neutral-100 p-1 font-semibold dark:bg-slate-900">
          {amount}
        </span>{" "}
        {variant}
      </button>
      <div
        className={`grid text-xs transition-[grid-template-rows] duration-300 ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden px-2">
          <div className={`my-2 ${isOpen ? "visible" : "invisible"}`}>{children}</div>
        </div>
      </div>
    </div>
  );
}
