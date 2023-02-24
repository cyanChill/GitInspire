import { useState, useEffect } from "react";
import Image from "next/image";
import { RxCross2, RxStarFilled, RxExternalLink } from "react-icons/rx";

import { RepositoryObjType } from "~utils/types";
import { cleanDate, isXDaysOld, shrinkNum } from "~utils/helpers";
import Button from "~components/form/Button";

type RepoInfoCardProps = {
  handleRefresh: (exists: boolean, refreshData?: RepositoryObjType) => void;
  handleClose: () => void;
  repository: RepositoryObjType;
};

export default function RepoInfoCard({
  handleRefresh,
  handleClose,
  repository,
}: RepoInfoCardProps) {
  const refreshInfo = () => {};

  useEffect(() => {
    console.log(repository);
  }, [repository]);

  return (
    <div className="flex h-full w-full animate-load-in flex-col bg-white shadow-md dark:bg-slate-800 dark:shadow-slate-700">
      {/* Card Header */}
      <div className="h-25 relative mb-10 flex min-w-0 items-end bg-gradient-to-t from-amber-400 to-amber-300 p-2 py-3 drop-shadow-md dark:from-cyan-700 dark:to-cyan-600 dark:drop-shadow-[0_4px_3px_rgba(125,125,125,0.25)]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="fixed top-2 left-2 text-lg hover:text-red-500"
        >
          <RxCross2 />
        </button>

        <Image
          src="/assets/github.svg"
          width={75}
          height={75}
          alt="Github Logo"
          className="translate-y-[40px] rounded-md bg-white p-1 drop-shadow-md dark:bg-neutral-200 dark:drop-shadow-[0_4px_3px_rgba(125,125,125,0.25)]"
        />

        <a
          href={repository.repo_link}
          target="_blank"
          rel="noreferrer"
          className="ml-2 flex min-w-0 items-center text-xl font-semibold hover:underline"
        >
          <span className="truncate">
            {repository.author}/{repository.repo_name}
          </span>{" "}
          <RxExternalLink className="ml-2 shrink-0" />
        </a>

        {/* Stars */}
        <p className="fixed bottom-[-1.5rem] left-[5.5rem] flex items-center justify-center gap-1 rounded-xl bg-yellow-200 px-2 text-sm text-black dark:bg-yellow-400">
          <RxStarFilled className="shrink-0" /> {shrinkNum(15286)}
        </p>
      </div>

      {/* Languages & Tags */}
      <div className="flex flex-wrap gap-1 p-2 text-sm">
        {repository.languages.map((lang) => (
          <span
            key={lang.name}
            className="rounded-md bg-orange-300 px-1 py-0.5 dark:bg-amber-700"
          >
            {lang.display_name}
          </span>
        ))}

        <span className="rounded-xl bg-slate-300 px-2 py-0.5 dark:bg-slate-500">
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
      </div>

      {/* Repo Description */}
      <div className="m-2 rounded-sm border-[1px] p-2 text-sm italic">
        <p>
          {repository.description ? repository.description : "No Description"}
        </p>

        {repository.maintain_link && (
          <a
            href={repository.maintain_link}
            target="_blank"
            rel="noreferrer"
            className="text-right"
          >
            New Maintainer Link
          </a>
        )}
      </div>

      {/* Accreditation + States */}
      <div className="mt-auto p-2 text-right text-sm italic">
        <p>
          <span className="font-bold">Suggested By:</span>{" "}
          <a
            href={`/profile/${repository.suggested_by.id}`}
            className="hover:underline"
          >
            {repository.suggested_by.username}
          </a>
        </p>

        <p className="text-right text-sm italic text-slate-500">
          Last Updated: {cleanDate(repository.last_updated)}
        </p>
      </div>

      {/* Action */}
      <hr className="mx-2" />
      <div className="flex justify-end px-2 py-1 text-sm">
        <button className="text-slate-500 hover:underline dark:text-gray-50">
          Report a Problem
        </button>
        <Button
          className="ml-3 w-max"
          clr={{
            bkg: "bg-indigo-400 enabled:hover:bg-indigo-500 disabled:opacity-25",
            txt: "text-white",
          }}
          onClick={refreshInfo}
          disabled={isXDaysOld(repository.last_updated, 1)}
        >
          Refresh Data
        </Button>
      </div>
    </div>
  );
}
