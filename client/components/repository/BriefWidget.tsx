import { AiFillStar } from "react-icons/ai";

import { Generic_Obj } from "~utils/types";

interface RepoBriefProps {
  data: Generic_Obj;
  fixedDim?: boolean;
}

export default function BriefWidget({
  data,
  fixedDim = false,
}: RepoBriefProps) {
  return (
    <a
      target="_blank"
      href={data.html_url}
      className={`${
        fixedDim ? "h-[140px] sm:h-[92px]" : ""
      } group my-1 flex flex-col rounded-lg bg-slate-100 p-2.5 shadow-md shadow-slate-300 hover:cursor-pointer dark:bg-slate-700 dark:shadow-slate-900 sm:flex-row`}
      rel="noreferrer"
    >
      <div className="mb-1 flex-1 sm:min-w-0">
        <p
          className={`${
            fixedDim ? "truncate" : ""
          } text-sm font-semibold group-hover:underline`}
        >
          {data.full_name}
        </p>
        <p
          className={`${
            fixedDim ? "line-clamp-3 sm:line-clamp-2" : ""
          } mt-1 min-w-0 text-xs`}
        >
          {data.description || ""}
        </p>
      </div>

      <div className="flex h-min w-fit shrink-0 items-center gap-2 rounded-md bg-slate-200 p-1 text-xxs font-semibold shadow shadow-md shadow-slate-300 dark:bg-slate-600 dark:shadow-slate-800">
        <span className="inline-flex items-center gap-1">
          <AiFillStar />
          {data.stargazers_count}
        </span>
        {data.language && (
          <div className="rounded-md bg-slate-100 p-1.5 py-0.5 dark:bg-slate-700">
            {data.language}
          </div>
        )}
      </div>
    </a>
  );
}
