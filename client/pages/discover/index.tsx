import _ from "lodash";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { FaCompass } from "react-icons/fa";

import { RepositoryObjType } from "~utils/types";
import { fromURLQueryVal } from "~utils/helpers";
import useAppContext from "~hooks/useAppContext";
import PageHeader from "~components/layout/PageHeader";
import Button from "~components/form/Button";
import RepoInfoCard from "~components/repository/RepoInfoCard";

// Key is the page number of results for current search filter
interface RepoResults {
  [x: number]: RepositoryObjType[];
}

type SearchFilters = {
  languages?: string[];
  minStars?: number;
  maxStars?: number;
  primary_tag?: string;
  tags?: string[];
};

export default function DiscoverPage() {
  const { languages, tags } = useAppContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<RepoResults>({});
  const [currPg, setCurrPg] = useState(0);
  const [maxPgs, setMaxPgs] = useState(0);
  const [currFilters, setCurrFilters] = useState<SearchFilters>({});

  const updateFilters = () => {
    // Update URL query parameters which triggers useEffect to update
    // state [when we click the "update filter" button after making
    // changes]
  };

  const firstPage = () => setCurrPg(0);

  const lastPage = () => setCurrPg(maxPgs - 1);

  const prevPage = () => {
    setCurrPg((prev) => (prev !== 0 ? prev - 1 : prev));
  };
  const nextPage = () => {
    setCurrPg((prev) => (prev !== maxPgs - 1 ? prev + 1 : prev));
  };

  useEffect(() => {
    // Fetch results from database based on selected filters
    const { languages, minStars, maxStars, primary_tag, tags, page } =
      router.query;

    /* Get filters based on URL query parameters */
    let newPg: number = page && !isNaN(+page) && +page >= 0 ? +page : 0;
    let newFilters: SearchFilters = {};

    newFilters.languages = fromURLQueryVal.toArr(languages, ",");
    newFilters.minStars = fromURLQueryVal.toPosInt(minStars);
    newFilters.maxStars = fromURLQueryVal.toPosInt(maxStars);
    newFilters.primary_tag = fromURLQueryVal.onlyStr(primary_tag);
    newFilters.tags = fromURLQueryVal.toArr(tags, ",");

    console.log("newFilters:", newFilters);
    console.log("newPg:", newPg);

    /* Get Fetch Query String */
    let fetchURL = `/api/repositories/filter?page=${newPg}`;
    for (const [k, v] of Object.entries(newFilters)) {
      if (!v) continue;
      fetchURL += `&${k}=${Array.isArray(v) ? v.join(",") : v}`;
    }
    console.log(fetchURL);

    /*
      Determine whether we have a new filter or if we just changed pages
        - If we just changed pages, add new results to cached results if
          not cached
        - If we have a new filter clear the cached results
    */
    // Use lodash's "isEqual" function to compare our filter objects for
    // equality
    const isSameFilter = _.isEqual(currFilters, newFilters);
    // Return if the filter remained the same & result is cached
    if (isSameFilter && results[newPg]) return;

    /* Make Request (Let backend handle input validation) */
    const abortCtrl = new AbortController();
    setIsLoading(true);
    fetch(fetchURL, { signal: abortCtrl.signal })
      .then((res) => res.json())
      .then(({ page, totalPages, repositories, errors }) => {
        console.log(page, totalPages, repositories, errors);

        if (errors.length > 0) {
          // Some error with inputs provided
          toast.error("Some filter inputs were invalid.");
        } else if (isSameFilter) {
          // Same filter, new page
          setResults((prev) => ({ ...prev, [page]: repositories }));
          setCurrPg(page);
          setMaxPgs(totalPages);
          // TODO: Update URL to show revised page number if "page !== newPg"
        } else {
          // New filter
          setResults({ [page]: repositories });
          setCurrPg(page);
          setMaxPgs(totalPages);
        }

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

  return (
    <div className="animate-load-in">
      <PageHeader
        name="Discover"
        description="Find inspiration from repositories suggested by fellow developers."
        icon={{ iconEl: FaCompass }}
        clr={{
          bkg: "bg-gradient-to-r from-blue-500 to-teal-500",
          txt: "text-slate-100",
          txtAcc: "text-gray-100",
        }}
      />
    </div>
  );
}
