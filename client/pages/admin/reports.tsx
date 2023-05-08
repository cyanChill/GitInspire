import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { TbClipboardCheck } from "react-icons/tb";
import { BiExpandVertical, BiX } from "react-icons/bi";

import { REPORT_REASON_OPTIONS } from "~data";
import useUserContext from "~hooks/useUserContext";
import { authFetch } from "~utils/cookies";
import { ReportObjType } from "~utils/types";
import { cleanDate2 } from "~utils/helpers";
import Spinner from "~components/Loading";
import SEO from "~components/layout/SEO";

type ReportsDictType = {
  [x: string]: ReportObjType[];
};

const TYPES_WITH_CONTENT_ID = ["repository", "tag", "user"];

export default function AdminReportsPage() {
  const { isAdmin, redirectIfNotAdmin } = useUserContext();

  const [selectedType, setSelectedType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportsDict, setReportsDict] = useState<ReportsDictType>({});
  const [isLoading, setIsLoading] = useState(true);

  const reportTypes = useMemo(() => {
    return Object.keys(reportsDict).sort();
  }, [reportsDict]);

  const getReportReason = (val: string) => {
    const reasonOpt = REPORT_REASON_OPTIONS.find((rpt) => rpt.value === val);
    if (!reasonOpt) return "Other";
    else return reasonOpt.label;
  };

  const handleTypeSelection = (type: string) => {
    const diffSelection = type !== selectedType;
    setSelectedType(type);
    setMenuOpen(false);
    if (diffSelection) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReportAction = async (rptId: number, action: string) => {
    const res = await authFetch(`/api/report/${rptId}?action=${action}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Something unexpected has occurred.");
      return;
    }

    const data = await res.json();
    setReportsDict((prev) => {
      // Since we may recieve "None" if the report has been already handled
      let newReportDict: ReportsDictType = {};
      Object.keys(prev).forEach((key) => {
        newReportDict[key] = prev[key].filter((rpt) => rpt.id != rptId);
      });

      return newReportDict;
    });
    toast.success(data.message);
  };

  useEffect(() => {
    if (!isAdmin) return;

    setIsLoading(true);
    authFetch("/api/report")
      .then((res) => {
        if (!res.ok) {
          // There's no errors that'll stem from the inputs provided in the query string
          toast.error("Something went wrong with fetching reports.");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        // Seperate reports by their type
        let dict: ReportsDictType = {};

        data.reports.forEach((rpt: ReportObjType) => {
          if (!dict[rpt.type]) dict[rpt.type] = [rpt];
          else dict[rpt.type].push(rpt);
        });

        const dictKeys = Object.keys(dict).sort();
        setReportsDict(dict);
        setSelectedType(dictKeys.length > 0 ? dictKeys[0] : "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, [isAdmin]);

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  if (isLoading) {
    return (
      <>
        <SEO pageName="Reports" />
        <div className="flex animate-load-in justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  if (!isAdmin) {
    return (
      <>
        <SEO pageName="Reports" />
        <div className="flexanimate-load-in justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  if (Object.keys(reportsDict).length === 0) {
    return (
      <>
        <SEO pageName="Reports" />
        <div className="grid h-full animate-load-in grid-cols-1 grid-rows-[min-content_1fr]">
          <h1 className="mb-4 text-center text-4xl font-semibold underline">
            Reports Page
          </h1>

          <p className="py-2 text-center font-mono text-slate-500 dark:text-slate-300">
            All reports have been handled!
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageName="Reports" />
      <div
        className="grid h-full animate-load-in grid-cols-1 grid-rows-[min-content_1fr]"
        data-overflow="clip"
      >
        <h1 className="mb-4 text-center text-4xl font-semibold underline">
          Reports Page
        </h1>

        <main className="h-full divide-y divide-slate-400 border-slate-400 dark:divide-slate-100 dark:border-slate-100">
          {/* Navigation between different types of reports */}
          <aside className="sticky top-2 mb-2 rounded-md bg-zinc-50 p-2 shadow dark:bg-slate-700">
            {/* Closed State */}
            <div
              className={`flex hocus:cursor-pointer ${
                menuOpen ? "hidden" : "block"
              }`}
              onClick={() => setMenuOpen(true)}
            >
              <p className="flex-1">
                {selectedType[0].toUpperCase() + selectedType.substring(1)}
              </p>
              <BiExpandVertical className="text-xl" />
            </div>
            {/* Open State */}
            <div className={`flex ${menuOpen ? "block" : "hidden"}`}>
              <ul className="flex-1">
                {reportTypes.map((type) => (
                  <li
                    key={type}
                    onClick={() => handleTypeSelection(type)}
                    className="mb-2 last:mb-0 hocus:cursor-pointer"
                  >
                    {type[0].toUpperCase() + type.substring(1)}
                  </li>
                ))}
              </ul>
              <BiX
                className="text-xl hocus:cursor-pointer"
                onClick={() => setMenuOpen(false)}
              />
            </div>
          </aside>

          {/* No Reports */}
          {Array.isArray(reportsDict[selectedType]) &&
            reportsDict[selectedType].length === 0 && (
              <p className="py-2 text-center font-mono text-slate-500 dark:text-slate-300">
                All &quot;{selectedType}&quot;-type reports have been handled!
              </p>
            )}

          {/* List of reports */}
          {Array.isArray(reportsDict[selectedType]) &&
            reportsDict[selectedType].map((rpt) => (
              <article key={rpt.id} className="flex flex-col p-2 sm:py-3">
                <h2 className="mt-2 text-base font-semibold">
                  <span className="rounded-md bg-gray-300 px-1 py-0.5 dark:bg-gray-600">
                    {getReportReason(rpt.reason)}
                  </span>{" "}
                  {TYPES_WITH_CONTENT_ID.includes(selectedType) &&
                    (() => {
                      let redirectLink = "";
                      if (selectedType === "repository")
                        redirectLink = `/admin/repositories?repository=${rpt.content_id}`;
                      if (selectedType === "user")
                        redirectLink = `/admin/users?user=${rpt.content_id}`;
                      if (selectedType === "tag")
                        redirectLink = `/admin/tags?tag=${rpt.content_id}`;

                      return (
                        <a
                          href={redirectLink}
                          target="_blank"
                          rel="noreferrer"
                          className="hocus:cursor-pointer hocus:underline"
                        >
                          ({rpt.content_id})
                        </a>
                      );
                    })()}
                </h2>

                <time
                  dateTime={`${rpt.created_at}`}
                  className="order-first font-mono text-xs leading-7 text-slate-500 dark:text-slate-300"
                >
                  {cleanDate2(rpt.created_at)}
                </time>

                {rpt.reason === "maintain_link" && (
                  <p className="mt-1 truncate text-sm dark:text-slate-100">
                    <span className="font-semibold underline">
                      Maintain Link:
                    </span>{" "}
                    <a
                      href={rpt.maintain_link}
                      target="_blank"
                      rel="noreferrer"
                      className="hocus:underline"
                    >
                      {rpt.maintain_link}
                    </a>
                  </p>
                )}

                <p className="mt-1 text-sm leading-6 dark:text-slate-100">
                  <span className="font-semibold underline">Description:</span>{" "}
                  {rpt.info}
                </p>

                <p className="truncate text-right text-xs italic text-slate-400">
                  Submitted by {rpt.reported_by.username}{" "}
                  <a
                    href={`/admin/users?user=${rpt.reported_by.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hocus:cursor hocus:underline"
                  >
                    ({rpt.reported_by.id})
                  </a>
                </p>
                {/* Report Actions */}
                <div className="mt-1 flex items-center gap-4">
                  <button
                    className="flex items-center text-sm font-bold leading-6 text-green-500 hocus:text-green-700 active:text-green-900"
                    onClick={() => handleReportAction(rpt.id, "resolve")}
                  >
                    <TbClipboardCheck />
                    <span className="ml-3">Resolve</span>
                  </button>
                  <span>/</span>
                  <button
                    className="flex items-center text-sm font-bold leading-6 text-rose-500 hocus:text-rose-700 active:text-rose-900"
                    onClick={() => handleReportAction(rpt.id, "dismiss")}
                  >
                    Dismiss
                  </button>
                </div>
              </article>
            ))}
        </main>
      </div>
    </>
  );
}
