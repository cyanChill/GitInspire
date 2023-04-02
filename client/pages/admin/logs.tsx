import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import { LogObjType } from "~utils/types";
import { replaceURLParam } from "~utils/helpers";
import Pagnation from "~components/form/Pagnation";
import Spinner from "~components/Spinner";

type LogResults = {
  [x: number]: LogObjType[];
};

export default function AdminLogsPage() {
  const router = useRouter();
  const { redirectIfNotAdmin } = useUserContext();

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
        console.log(currPageNum, numPages, logs);
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
  }, [router.query]);

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return (
    <div className="h-full animate-load-in">
      <h1 className="mb-4 text-center text-4xl font-semibold underline">
        Logs Page
      </h1>

      {isLoading ? (
        <Spinner />
      ) : (
        results[currPg].map((log) => <p key={log.id}>{log.action}</p>)
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
