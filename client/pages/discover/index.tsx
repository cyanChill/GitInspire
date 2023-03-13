import _ from "lodash";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { FaCompass } from "react-icons/fa";

import { RepositoryObjType } from "~utils/types";
import { fromURLQueryVal, replaceURLParam } from "~utils/helpers";
import useAppContext from "~hooks/useAppContext";
import PageHeader from "~components/layout/PageHeader";
import Button from "~components/form/Button";
import RepoInfoCard from "~components/repository/RepoInfoCard";
import Spinner from "~components/Spinner";

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

const SORT_OPTS = [
  { value: "sort=date&order=desc", text: "Date (desc)" },
  { value: "sort=date&order=asc", text: "Date (asc)" },
  { value: "sort=stars&order=desc", text: "Stars (desc)" },
  { value: "sort=stars&order=asc", text: "Stars (asc)" },
];

export default function DiscoverPage() {
  const { languages, tags } = useAppContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<RepoResults>({});
  const [currPg, setCurrPg] = useState(0);
  const [maxPgs, setMaxPgs] = useState(0);
  const [sortMethod, setSortMethod] = useState("sort=date&order=desc");
  const [currFilters, setCurrFilters] = useState<SearchFilters>({});
  const [selectedRepo, setSelectedRepo] = useState<RepositoryObjType>();

  const updateFilters = () => {
    // Update URL query parameters which triggers useEffect to update
    // state [when we click the "update filter" button after making
    // changes]
  };

  const onRepoRefresh = (
    exists: boolean,
    id: number,
    refreshData: RepositoryObjType | undefined
  ) => {
    // Update cached results
    const updatedRepos = results[currPg]
      .map((entry) => (entry.id === id ? refreshData : entry))
      .filter((entry): entry is RepositoryObjType => entry !== undefined);

    if (!exists) setSelectedRepo(undefined);
    else setSelectedRepo(refreshData);
    setResults((prev) => ({ ...prev, [currPg]: updatedRepos }));
  };

  const onRepoClose = () => setSelectedRepo(undefined);

  const pullFiltersFromURL = () => {
    const { minStars, maxStars, primary_tag, tags, languages, page, limit } =
      router.query;

    let filter: SearchFilters = {};
    filter.languages = fromURLQueryVal.toArr(languages, ",");
    filter.minStars = fromURLQueryVal.toPosInt(minStars);
    filter.maxStars = fromURLQueryVal.toPosInt(maxStars);
    filter.primary_tag = fromURLQueryVal.onlyStr(primary_tag);
    filter.tags = fromURLQueryVal.toArr(tags, ",");

    return {
      remainingFilters: filter,
      sort: router.query.sort ?? "date",
      order: router.query.order ?? "desc",
      page: page && !isNaN(+page) && +page >= 0 ? +page : 1,
      limit: limit && !isNaN(+limit) && +limit > 0 ? +limit : 15,
    };
  };

  const updateURLPage = (newPage: number) => {
    setSelectedRepo(undefined);
    router.push(replaceURLParam(router.asPath, "page", `${newPage}`));
  };

  const updateURLSortMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let url = router.asPath;
    let terms = e.target.value.split("&");
    url = replaceURLParam(url, "page", "1");
    terms.forEach((term) => {
      const [methodName, orderValue] = term.split("=");
      url = replaceURLParam(url, methodName, orderValue);
    });
    router.push(url);
  };

  useEffect(() => {
    // Fetch results from database based on selected filters
    const { remainingFilters, sort, order, page, limit } = pullFiltersFromURL();
    const newSort = `sort=${sort}&order=${order}`;
    setCurrFilters(remainingFilters);
    setSortMethod(newSort);

    /* Get Fetch Query String */
    let fetchURL = `/api/repositories/filter?page=${page}&limit=${limit}&${newSort}`;
    for (const [k, v] of Object.entries(remainingFilters)) {
      if (!v) continue;
      fetchURL += `&${k}=${Array.isArray(v) ? v.join(",") : v}`;
    }

    /*
      Determine whether we have a new filter or if we just changed pages
        - If we just changed pages, add new results to cached results if
          not cached
        - If we have a new filter clear the cached results
    */
    const isSameFilter = _.isEqual(currFilters, remainingFilters);
    // Return if the filter remained the same & result is cached
    if (sortMethod === newSort && isSameFilter && results[page]) {
      setCurrPg(page); // Show cached results
      return;
    }

    /* Make Request (Let backend handle input validation) */
    const abortCtrl = new AbortController();
    setIsLoading(true);

    fetch(fetchURL, { signal: abortCtrl.signal })
      .then((res) => {
        if (!res.ok) {
          // There's no errors that'll stem from the inputs provided in the query string
          toast.error(
            "Something went wrong with searching our database with the provided filters."
          );
        } else {
          return res.json();
        }
      })
      .then(({ currPage: currPageNum, numPages, repositories }) => {
        if (isSameFilter && sortMethod === newSort) {
          // Same filter, new page
          setResults((prev) => ({ ...prev, [currPageNum]: repositories }));
          setCurrPg(currPageNum);
          setMaxPgs(numPages);
        } else {
          // New filter
          setResults({ [currPageNum]: repositories });
          setCurrPg(currPageNum);
          setMaxPgs(numPages);
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

      <div className="mt-4 grid grid-cols-1 grid-rows-[minmax(30rem,calc(100vh-17rem))] gap-x-2 sm:grid-cols-2 sm:grid-rows-[minmax(30rem,calc(100vh-15rem))]">
        {/* Data Column */}
        <div className="col-start-1 row-start-1  flex flex-col">
          {/* Filter and Sort button */}
          <div className="flex flex-initial border border-red-500">
            <Button>Filters</Button>
            <select
              className="ml-auto dark:text-black"
              onChange={updateURLSortMethod}
              value={sortMethod}
              disabled={isLoading}
            >
              {SORT_OPTS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.text}
                </option>
              ))}
            </select>
          </div>

          {/* Found Repositories */}
          <div className="flex-auto overflow-y-auto">
            {results[currPg] ? (
              results[currPg].map((repo) => (
                <p
                  key={repo.id}
                  className="my-2 border p-1 hover:cursor-pointer hover:underline"
                  onClick={() => setSelectedRepo(repo)}
                >
                  {repo.author}/{repo.repo_name}
                </p>
              ))
            ) : isLoading ? (
              <Spinner />
            ) : (
              <p className="text-red-500">
                No repositories found with given filter.
              </p>
            )}
          </div>

          {/* Pagnation */}
          <div className="align-center mt-auto flex flex-[0_1_50px] justify-center gap-1 border border-green-500">
            <Button
              onClick={() => updateURLPage(1)}
              disabled={currPg === 1 || isLoading}
            >
              First
            </Button>
            <Button
              onClick={() => {
                if (currPg > 1) updateURLPage(currPg - 1);
              }}
              disabled={currPg === 1 || isLoading}
            >
              Prev
            </Button>
            <p className="my-auto">
              {currPg}/{maxPgs}
            </p>
            <Button
              onClick={() => {
                if (currPg < maxPgs) updateURLPage(currPg + 1);
              }}
              disabled={currPg === maxPgs || isLoading}
            >
              Next
            </Button>
            <Button
              onClick={() => updateURLPage(maxPgs)}
              disabled={currPg === maxPgs || isLoading}
            >
              Last
            </Button>
          </div>
        </div>

        {/* Selected Repository Info */}
        <div
          className={`col-start-1 row-span-full h-full sm:col-start-2 sm:row-start-1 ${
            !selectedRepo ? "pointer-events-none" : ""
          }`}
        >
          {selectedRepo && (
            <RepoInfoCard
              handleRefresh={onRepoRefresh}
              handleClose={onRepoClose}
              repository={selectedRepo}
            />
          )}
        </div>
      </div>
    </div>
  );
}
