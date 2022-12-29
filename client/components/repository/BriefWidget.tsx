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
      } group hover:cursor-pointer flex flex-col sm:flex-row p-2.5 my-1 rounded-xl bg-slate-100 dark:bg-slate-700 shadow-md shadow-slate-300 dark:shadow-slate-900`}
      rel="noreferrer"
    >
      <div className="sm:min-w-0 flex-1 mb-1">
        <p
          className={`${
            fixedDim ? "truncate" : ""
          } font-semibold group-hover:underline`}
        >
          {data.full_name}
        </p>
        <p
          className={`${
            fixedDim ? "line-clamp-3 sm:line-clamp-2" : ""
          } min-w-0 mt-1 text-sm`}
        >
          {data.description || ""}
        </p>
      </div>

      <div className="shrink-0 w-fit h-min flex items-center gap-2 p-1 text-xs font-semibold rounded-md bg-slate-200 dark:bg-slate-600 shadow shadow-md sm:shadow-lg shadow-slate-300 dark:shadow-slate-800">
        <span className="inline-flex items-center gap-1">
          <AiFillStar />
          {data.stargazers_count}
        </span>
        {data.language && (
          <div className="p-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
            {data.language}
          </div>
        )}
      </div>
    </a>
  );
}
