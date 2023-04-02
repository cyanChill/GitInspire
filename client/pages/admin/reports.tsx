import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { TbClipboardCheck } from "react-icons/tb";

import { REPORT_REASON_OPTIONS } from "~data";
import useUserContext from "~hooks/useUserContext";
import { getCookie } from "~utils/cookies";
import { ReportObjType } from "~utils/types";
import { cleanDate2 } from "~utils/helpers";
import Spinner from "~components/Spinner";

type ReportsDictType = {
  [x: string]: ReportObjType[];
};

const TYPES_WITH_CONTENT_ID = ["repository", "tag", "user"];

export default function AdminReportsPage() {
  const router = useRouter();
  const { redirectIfNotAdmin } = useUserContext();

  const [selectedType, setSelectedType] = useState("");
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

  const handleReportAction = async (action: string) => {
    console.log(`[Report Action] ${action}`);
  };

  useEffect(() => {
    setIsLoading(true);

    fetch("/api/report", {
      method: "GET",
      headers: { "X-CSRF-TOKEN": getCookie("csrf_access_token") || "" },
    })
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
        setSelectedType(dictKeys[0]);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  if (isLoading) {
    return (
      <div className="flex animate-load-in justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="grid h-full animate-load-in grid-cols-[15em_1fr] grid-rows-[min-content_1fr]">
      <h1 className="col-span-2 row-span-1 mb-4 text-center text-4xl font-semibold underline">
        Reports Page
      </h1>

      <aside className="z-10 col-[1/3] row-[2/3] border-red-500 md:col-span-1 md:row-span-1 md:border-r-2 md:bg-slate-700">
        <ul className="sticky top-0 bg-slate-700 p-2 md:bg-transparent">
          {reportTypes.map((type) => (
            <p
              key={type}
              onClick={() => setSelectedType(type)}
              className={`m-3 text-lg font-semibold ${
                selectedType === type
                  ? "underline"
                  : "hover:cursor-pointer hover:underline"
              }`}
            >
              {type[0].toUpperCase() + type.substring(1)}
            </p>
          ))}
        </ul>
      </aside>

      <main className="col-[1/3] row-[2/3] h-full divide-y divide-slate-100 border-slate-100 px-2 md:col-span-1 md:row-span-1 md:border-t">
        {Array.isArray(reportsDict[selectedType]) &&
          reportsDict[selectedType].map((rpt) => (
            <article key={rpt.id} className="flex flex-col px-2 py-4 sm:py-6">
              <h2 className="mt-2 text-lg font-semibold">
                <span className="rounded-md bg-gray-600 py-0.5 px-1 text-white">
                  {getReportReason(rpt.reason)}
                </span>{" "}
                {TYPES_WITH_CONTENT_ID.includes(selectedType) &&
                  (() => {
                    let redirectLink = "";
                    if (selectedType === "repository")
                      redirectLink = `/repository/${rpt.content_id}`;
                    if (selectedType === "user")
                      redirectLink = `/profile/${rpt.content_id}`;

                    return (
                      <span
                        onClick={() => router.push(redirectLink)}
                        className="hover:cursor-pointer hover:underline"
                      >
                        ({rpt.content_id})
                      </span>
                    );
                  })()}
              </h2>

              <time
                dateTime={`${rpt.created_at}`}
                className="order-first font-mono text-sm leading-7 text-slate-300"
              >
                {cleanDate2(rpt.created_at)}
              </time>

              <p className="mt-1 text-base leading-7 text-slate-100">
                <span className="font-semibold underline">More Info:</span>{" "}
                {rpt.info}
              </p>

              <div className="mt-3 flex items-center gap-4">
                <button
                  className="flex items-center text-sm font-bold leading-6 text-green-500 hover:text-green-700 active:text-green-900"
                  onClick={() => handleReportAction("resolve")}
                >
                  <TbClipboardCheck />
                  <span className="ml-3">Resolve</span>
                </button>

                <span>/</span>

                <button
                  className="flex items-center text-sm font-bold leading-6 text-rose-500 hover:text-rose-700 active:text-rose-900"
                  onClick={() => handleReportAction("dismiss")}
                >
                  Dismiss
                </button>
              </div>
            </article>
          ))}
      </main>
    </div>
  );
}
