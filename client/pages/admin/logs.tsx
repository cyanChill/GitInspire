import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import { LogObjType, ChildrenNClass } from "~utils/types";
import { replaceURLParam, cleanDate2 } from "~utils/helpers";
import Pagnation from "~components/form/Pagnation";
import Spinner from "~components/Spinner";

type LogResults = {
  [x: number]: LogObjType[];
};

export default function AdminLogsPage() {
  const router = useRouter();
  const { isAdmin, redirectIfNotAdmin } = useUserContext();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<LogResults>({});
  const [currPg, setCurrPg] = useState(0);
  const [maxPgs, setMaxPgs] = useState(0);

  const pullFiltersFromURL = () => {
    const { page, limit } = router.query;
    return {
      page: page && !isNaN(+page) && +page >= 0 ? +page : 1,
      limit: limit && !isNaN(+limit) && +limit > 0 ? +limit : 15,
    };
  };

  const updateURLPage = (newPage: number) => {
    router.push(replaceURLParam(router.asPath, "page", `${newPage}`));
  };

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch results from database based on selected filters
    const { page, limit } = pullFiltersFromURL();

    const abortCtrl = new AbortController();
    setIsLoading(true);
    fetch(`/api/logs?page=${page}&limit=${limit}`, { signal: abortCtrl.signal })
      .then((res) => {
        if (!res.ok) {
          // There's no errors that'll stem from the inputs provided in the query string
          toast.error("Something went wrong with finding logs in our databse.");
        } else {
          return res.json();
        }
      })
      .then(({ currPage: currPageNum, numPages, logs }) => {
        setResults((prev) => ({ ...prev, [currPageNum]: logs }));
        // If undefined, set values to 0
        setCurrPg(currPageNum ?? 0);
        setMaxPgs(numPages ?? 0);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log("[FETCH ERROR]", err);
        if (err.name !== "AbortError") {
          // Handle non-AbortError(s)
          toast.error("Something went wrong with fetching results.");
          setIsLoading(false);
        }
      });

    return () => {
      // Stop any current fetching when we're changing filters (or manipulating
      // query parameters in URL)
      abortCtrl.abort();
    };
  }, [router.query, isAdmin]);

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  if (!isAdmin) {
    return (
      <div className="flexanimate-load-in justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="h-full animate-load-in">
      <h1 className="mb-4 text-center text-4xl font-semibold underline">
        Logs Page
      </h1>

      {isLoading ? (
        <Spinner />
      ) : (
        <main className="my-4 overflow-x-auto text-left shadow-lg">
          <table className="w-full table-auto overflow-scroll">
            <thead>
              <tr className="rounded-lg border-b-[1px] border-slate-300 bg-slate-200 dark:border-slate-500 dark:bg-slate-800">
                <TH className="rounded-tl-md">Created At</TH>
                <TH>Action</TH>
                <TH>Type</TH>
                <TH>Content Reference</TH>
                <TH className="rounded-tr-md">Handled By</TH>
              </tr>
            </thead>

            <tbody>
              {results[currPg].map((log) => {
                let content_val: string | JSX.Element = log.content_id;
                if (["repository", "user"].includes(log.type)) {
                  const link =
                    log.type === "user"
                      ? `/profile/${log.content_id}`
                      : `/repository/${log.content_id}`;
                  content_val = (
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      {log.content_id}
                    </a>
                  );
                }

                return (
                  <tr
                    key={log.id}
                    className="group bg-white not-last:border-b-[1px] not-last:border-slate-300 dark:bg-slate-700 not-last:dark:border-slate-500"
                  >
                    <TD className="group-last:rounded-bl-md">
                      {cleanDate2(log.created_at)}
                    </TD>
                    <TD>{log.action}</TD>
                    <TD>{log.type}</TD>
                    <TD>{content_val}</TD>
                    <TD className="group-last:rounded-br-md">
                      <a
                        href={`/profile/${log.enacted_by.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {log.enacted_by.username}
                      </a>
                    </TD>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </main>
      )}

      {/* Pagnation */}
      <Pagnation
        currPg={currPg}
        maxPg={maxPgs}
        siblingCount={2}
        onPgChange={updateURLPage}
      />
    </div>
  );
}

const TH = ({ className, children }: ChildrenNClass) => {
  return (
    <th className={`whitespace-nowrap p-2 py-1.5 font-semibold ${className}`}>
      {children}
    </th>
  );
};

const TD = ({ className, children }: ChildrenNClass) => {
  return (
    <td className={`whitespace-nowrap p-2 py-1.5 ${className}`}>{children}</td>
  );
};
