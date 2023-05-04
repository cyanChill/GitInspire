import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { RxCross2, RxStarFilled } from "react-icons/rx";
import { FaGithub } from "react-icons/fa";
import { CiSquareInfo, CiRedo, CiRoute } from "react-icons/ci";

import useUserContext from "~hooks/useUserContext";
import { RepositoryObjType } from "~utils/types";
import { cleanDate, isXDaysOld, shrinkNum } from "~utils/helpers";
import { FooterGroup } from "~components/layout/Footer";

/*
  The idea of "handleRefresh" is to:
    1. Pass whether the repository still publically visible on GitHub
    2. If it's visible, pass the updated (or same) repository data.
*/
type RepoInfoCardProps = {
  handleRefresh: (
    exists: boolean,
    id: number,
    refreshData?: RepositoryObjType
  ) => void;
  handleClose: () => void;
  repository: RepositoryObjType;
};

const ACC_CLRS = [
  "border-blood-red",
  "border-red-p-400",
  "border-red-p-600",
  "border-orange-p-600",
  "border-orange-p-700",
  "border-yellow-p-600",
  "border-teal-p-100",
  "border-teal-p-700",
];

export default function RepoInfoCard({
  handleRefresh,
  handleClose,
  repository,
}: RepoInfoCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useUserContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clrIdx, setClrIdx] = useState(0);

  const handleReport = () => {
    // Redirect to the report route with some information in the URL params
    router.push(`/report?type=repository&id=${repository.id}`);
  };

  const suggestLink = () => {
    // Redirect to the report route with some information in the URL params
    // to suggest a maintain link for an abandoned repository without one
    router.push(
      `/report?type=repository&id=${repository.id}&reason=maintain_link`
    );
  };

  const refreshInfo = async () => {
    // Repository data has been refreshed recently
    if (!isXDaysOld(repository.last_updated, 1)) return;

    setIsRefreshing(true);
    const res = await fetch(`/api/repositories/${repository.id}/refresh`);
    if (!res.ok) {
      /* Error occurred */
      // Note: Status Code 410 indicates repo can't be found with GitHub API
      // and thus repository suggestion has been deleted from database
      if (res.status == 410) {
        toast.error(
          "Repository is no longer found on GitHub and has been deleted from our database."
        );
        handleRefresh(false, repository.id);
      } else {
        toast.error("Something went wrong on our servers.");
      }
    } else {
      /* Found repository */
      const data = await res.json();
      handleRefresh(true, repository.id, data.repository);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    setClrIdx(Math.floor(Math.random() * ACC_CLRS.length));
  }, [repository]);

  return (
    <article className="flex h-full w-full animate-load-in flex-col overflow-y-auto bg-white font-sourceCodePro shadow-md dark:bg-slate-800">
      <header className="grid grid-cols-[1fr_4rem] pb-3 pl-6 pr-3">
        <div className="min-w-0 pt-6">
          {/* Repository Name */}
          <a
            className="flex min-w-0 flex-col hover:underline"
            href={repository.repo_link}
            target="_blank"
            rel="noreferrer"
            data-testid="RepoInfoCard-card-title"
          >
            <span className="truncate text-xs text-slate-600 dark:text-gray-400">
              {repository.author}/
            </span>
            <span className="flex min-w-0 items-center truncate text-xl">
              <span className="truncate">{repository.repo_name}</span>{" "}
              <FaGithub className="ml-2 shrink-0" />
            </span>
          </a>
          {/* Star Count */}
          <p
            className="mt-2 flex w-min items-center justify-center gap-1 rounded-xl bg-yellow-300 px-2 text-sm text-black dark:bg-yellow-400"
            data-testid="RepoInfoCard-stars"
          >
            <RxStarFilled className="shrink-0" /> {shrinkNum(repository.stars)}
          </p>
        </div>
        {/* Close Button */}
        <div
          className={`align-start flex justify-center border-t-[1.5rem] ${ACC_CLRS[clrIdx]}`}
        >
          <button
            onClick={handleClose}
            className="mt-2 h-min text-3xl hover:text-red-500"
          >
            <RxCross2 />
          </button>
        </div>
      </header>

      <div
        className={`flex-1 border-l-[1.5rem] border-r-[0.75rem] ${ACC_CLRS[clrIdx]}`}
      >
        <div className="px-1">
          {/* Languages & Tags */}
          <section
            className="flex flex-wrap gap-1 py-2 text-xxs"
            data-testid="RepoInfoCard-widgets"
          >
            {repository.languages.map((lang) => (
              <span
                key={lang.name}
                className="rounded-md bg-orange-p-600 px-1 py-0.5 dark:bg-orange-p-700"
              >
                {lang.display_name}
              </span>
            ))}

            <span
              className={`rounded-xl px-2 py-0.5 ${
                repository.primary_tag.name === "abandoned"
                  ? "bg-red-p-400 text-white dark:bg-red-p-600"
                  : "bg-slate-300 dark:bg-slate-500"
              }`}
            >
              {repository.primary_tag.display_name}
            </span>

            {repository.tags.map((tg) => (
              <span
                key={tg.name}
                className="rounded-xl bg-neutral-200 px-2 py-0.5 dark:bg-slate-700"
              >
                {tg.display_name}
              </span>
            ))}
          </section>

          {/* Repo Description */}
          <section className="my-2 text-xs">
            <p data-testid="RepoInfoCard-description">
              {repository.description
                ? repository.description
                : "No Description"}
            </p>

            {repository.maintain_link && (
              <p className="mt-4" data-testid="RepoInfoCard-maintain_link">
                <span className="font-semibold underline">
                  New Maintainer Link:
                </span>
                <a
                  href={repository.maintain_link}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate italic hover:underline"
                >
                  {repository.maintain_link}
                </a>
              </p>
            )}
          </section>
        </div>
      </div>

      <footer className="grid grid-cols-[1fr_1fr_min-content] gap-1 py-3 pl-7 pr-4 min-[400px]:grid-cols-[7.5rem_min-content_1fr]">
        <FooterGroup testId="RepoInfoCard-suggested_by" label="Suggested By">
          <Link
            href={`/profile/${repository.suggested_by.id}`}
            className="hover:underline"
          >
            {repository.suggested_by.username}
          </Link>
        </FooterGroup>
        <FooterGroup testId="RepoInfoCard-last_updated" label="Last Updated">
          {cleanDate(repository.last_updated)}
        </FooterGroup>

        {/* Action Buttons */}
        <div className="ml-auto flex flex-row">
          {isAuthenticated && (
            <>
              <button
                title="Report a Problem"
                onClick={handleReport}
                className="hover:text-red-p-400"
              >
                <CiSquareInfo className="h-7 w-7" />
              </button>
              {repository.primary_tag.name === "abandoned" && (
                <button
                  title="Suggest Link"
                  onClick={suggestLink}
                  className="text-red-p-400 hover:text-blood-red"
                >
                  <CiRoute className="h-7 w-7" />
                </button>
              )}
            </>
          )}
          <button
            title="Refresh Data"
            disabled={!isXDaysOld(repository.last_updated, 1) || isRefreshing}
            onClick={refreshInfo}
            className="text-teal-p-600 transition-transform duration-700 enabled:hover:rotate-[360deg] enabled:hover:text-teal-p-700 disabled:text-teal-p-700 disabled:opacity-50"
          >
            <CiRedo className="h-7 w-7" />
          </button>
        </div>
      </footer>
    </article>
  );
}
