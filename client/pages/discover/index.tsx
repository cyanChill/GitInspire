import _ from "lodash";
import { useState, useEffect, useCallback } from "react";
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
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import Select, { SelectOption } from "~components/form/Select";
import Pagnation from "~components/form/Pagnation";

// Key is the page number of results for current search filter
interface RepoResults {
  [x: number]: RepositoryObjType[];
}

type SearchFilters = {
  minStars?: number;
  maxStars?: number;
  languages?: string[];
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
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<RepoResults>({});
  const [currPg, setCurrPg] = useState(0);
  const [maxPgs, setMaxPgs] = useState(0);
  const [sortMethod, setSortMethod] = useState("sort=date&order=desc");
  const [currFilters, setCurrFilters] = useState<SearchFilters>({});
  const [selectedRepo, setSelectedRepo] = useState<RepositoryObjType>();

  const clearSelectedRepo = () => setSelectedRepo(undefined);

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
    clearSelectedRepo();
    router.push(replaceURLParam(router.asPath, "page", `${newPage}`));
  };

  const updateURLSortMethod = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearSelectedRepo();

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
    const sameSortMethod = sortMethod === newSort;
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
    if (sameSortMethod && isSameFilter && results[page]) {
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
        if (isSameFilter && sameSortMethod) {
          // Same filter, new page
          setResults((prev) => ({ ...prev, [currPageNum]: repositories }));
        } else {
          // New filter
          setResults({ [currPageNum]: repositories });
        }
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
          <div className="relative flex flex-initial border border-red-500">
            <FilterMenu
              currentFilter={currFilters}
              currentSortMethod={sortMethod}
              resetState={clearSelectedRepo}
            />
            {/* Sort Button */}
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
          <div className="flex-auto overflow-y-auto px-2">
            {results[currPg] && results[currPg].length > 0 && !isLoading ? (
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
              <p className="text-red:500 mt-5 text-center dark:text-red-400">
                No repositories found with given filter.
              </p>
            )}
          </div>

          {/* Pagnation */}
          <Pagnation
            currPg={currPg}
            maxPg={maxPgs}
            siblingCount={1}
            onPgChange={updateURLPage}
          />
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
              handleClose={clearSelectedRepo}
              repository={selectedRepo}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* Filter Menu Component (Button + Menu) */
const DEFAULT_FILTER = {
  minStars: "",
  maxStars: "",
  languages: [],
  primary_tag: undefined,
  tags: [],
};

type newFilterType = {
  minStars: number | string;
  maxStars: number | string;
  languages: SelectOption[];
  primary_tag: SelectOption | undefined;
  tags: SelectOption[];
};

type FilterMenuPropType = {
  currentFilter: SearchFilters;
  currentSortMethod: string;
  resetState: () => void;
};

function FilterMenu({
  currentFilter,
  currentSortMethod,
  resetState,
}: FilterMenuPropType) {
  const router = useRouter();
  const { selOptionFormat } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [newFilter, setNewFilter] = useState<newFilterType>(DEFAULT_FILTER);

  const toggleVisibility = () => {
    if (!isVisible) {
      setNewFilter({
        minStars: currentFilter.minStars ?? "",
        maxStars: currentFilter.maxStars ?? "",
        languages: selOptionFormat.languages.filter((opt) =>
          currentFilter.languages?.includes(`${opt.value}`)
        ),
        primary_tag: selOptionFormat.primary_tags.find(
          (opt) => opt.value === currentFilter.primary_tag
        ),
        tags: selOptionFormat.user_tags.filter((opt) =>
          currentFilter.tags?.includes(`${opt.value}`)
        ),
      });
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const updateFilters = () => {
    // Update URL query parameters which triggers useEffect to update repository results
    let newFiltersArr: string[] = [];
    for (const key in newFilter) {
      if ((key === "minStars" || key === "maxStars") && newFilter[key]) {
        newFiltersArr.push(`${key}=${newFilter[key]}`);
      } else if (key === "primary_tag" && newFilter.primary_tag) {
        newFiltersArr.push(`primary_tag=${newFilter.primary_tag.value}`);
      } else if (
        (key === "tags" || key === "languages") &&
        newFilter[key].length > 0
      ) {
        newFiltersArr.push(
          `${key}=${newFilter[key].map((val) => val.value).join(",")}`
        );
      }
    }

    const joiner = newFiltersArr.length > 0 ? "&" : "";
    router.push(
      `/discover?page=1&${currentSortMethod}${joiner}${newFiltersArr.join("&")}`
    );

    setIsVisible(false);
    resetState();
  };

  const updateNewFilter = useCallback(
    (type: string, val: number | SelectOption | undefined | SelectOption[]) => {
      setNewFilter((prev) => ({ ...prev, [type]: val }));
    },
    []
  );

  return (
    <>
      <Button onClick={toggleVisibility}>Filters</Button>

      <div
        className={`${
          isVisible ? "block" : "hidden"
        } absolute top-12 left-0 z-10 max-h-[20rem] w-full animate-load-in overflow-y-auto rounded-md border border-slate-500 bg-white p-2 dark:bg-slate-800`}
      >
        <p className="mb-4 text-center text-xl font-medium underline">
          Filters
        </p>

        <div className="mb-2 flex flex-wrap gap-2 text-base">
          <InputGroup label="Min Stars">
            <Input
              type="number"
              min={0}
              value={newFilter.minStars}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateNewFilter("minStars", +e.target.value)
              }
              className="w-full max-w-[7.5rem] text-right text-sm"
            />
          </InputGroup>
          <InputGroup label="Max Stars">
            <Input
              type="number"
              min={0}
              value={newFilter.maxStars}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                updateNewFilter("maxStars", +e.target.value)
              }
              className="w-full max-w-[7.5rem] text-right text-sm"
            />
          </InputGroup>
        </div>

        <InputGroupAlt label="Languages">
          <Select
            multiple={true}
            options={selOptionFormat.languages}
            value={newFilter.languages}
            max={5}
            onChange={(value) => updateNewFilter("languages", value)}
          />
        </InputGroupAlt>

        <InputGroupAlt label="Primary Tag">
          <Select
            multiple={false}
            options={selOptionFormat.primary_tags}
            value={newFilter.primary_tag}
            onChange={(value) => updateNewFilter("primary_tag", value)}
          />
        </InputGroupAlt>

        <InputGroupAlt label="Tags">
          <Select
            multiple={true}
            options={selOptionFormat.user_tags}
            value={newFilter.tags}
            max={5}
            onChange={(value) => updateNewFilter("tags", value)}
          />
        </InputGroupAlt>

        <div className="flex flex-wrap justify-end gap-x-2">
          <Button onClick={() => setNewFilter(DEFAULT_FILTER)}>
            Clear Filters
          </Button>
          <Button onClick={updateFilters}>Update Filters</Button>
        </div>
      </div>
    </>
  );
}
