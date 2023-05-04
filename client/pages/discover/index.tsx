import _ from "lodash";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { BsFillCalendar2WeekFill } from "react-icons/bs";
import { FaCompass, FaStar } from "react-icons/fa";
import { HiOutlineChevronDown } from "react-icons/hi";
import { HiArrowLongDown, HiArrowLongUp } from "react-icons/hi2";
import { MdFilterList, MdFilterListOff } from "react-icons/md";

import { RepositoryObjType } from "~utils/types";
import { fromURLQueryVal, replaceURLParam } from "~utils/helpers";
import useAppContext from "~hooks/useAppContext";
import PageHeader from "~components/layout/PageHeader";
import { Button2 } from "~components/form/Button";
import RepoInfoCard from "~components/repository/RepoInfoCard";
import { LazyText } from "~components/Loading";
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import Select, { SelectOption } from "~components/form/Select";
import Pagnation from "~components/form/Pagnation";
import SEO from "~components/layout/SEO";

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

  const updateURLSortMethod = (method: string) => {
    clearSelectedRepo();

    let url = router.asPath;
    let terms = method.split("&");
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
    <>
      <SEO pageName="Discover" />
      <div className="animate-load-in">
        <PageHeader
          name="Discover"
          description="Find inspiration from repositories suggested by fellow developers."
          icon={{ iconEl: FaCompass }}
          shadowAccentClr="shadow-blue-500"
        />

        <div className="min-[900px]:grid-rows-[minmax(30rem,calc(100vh-15rem))] mt-4 grid grid-cols-1 grid-rows-[minmax(30rem,calc(100vh-17rem))] gap-x-2 min-[900px]:grid-cols-2">
          {/* Data Column */}
          <div className="col-start-1 row-start-1  flex flex-col">
            {/* Filter and Sort button */}
            <div className="relative flex flex-initial gap-2 border-b-2 border-gray-300 p-1 py-2 dark:border-gray-600">
              <FilterMenu
                currentFilter={currFilters}
                currentSortMethod={sortMethod}
                resetState={clearSelectedRepo}
                disabled={isLoading}
              />
              {/* Sort Button */}
              <SortMenu
                onChange={updateURLSortMethod}
                currentSortMethod={sortMethod}
                disabled={isLoading}
              />
            </div>

            {/* Found Repositories */}
            <div className="flex-auto overflow-y-auto px-2">
              {results[currPg] && results[currPg].length > 0 && !isLoading ? (
                results[currPg].map((repo) => {
                  const selected = selectedRepo?.id === repo.id;

                  return (
                    <p
                      key={repo.id}
                      className={`my-2 truncate rounded-md border-[1px] border-slate-300 p-1.5 hover:cursor-pointer hover:underline dark:border-slate-600 ${
                        selected ? "bg-slate-200 dark:bg-slate-700" : ""
                      } hover:bg-slate-300 dark:hover:bg-slate-600`}
                      onClick={() => setSelectedRepo(repo)}
                    >
                      {repo.author}/{repo.repo_name}
                    </p>
                  );
                })
              ) : isLoading ? (
                <>
                  <LazyText dimensionStyle="w-full h-9 mt-4" />
                  <LazyText dimensionStyle="w-full h-9 mt-4" />
                  <LazyText dimensionStyle="w-full h-9 mt-4" />
                  <LazyText dimensionStyle="w-full h-9 mt-4" />
                  <LazyText dimensionStyle="w-full h-9 mt-4" />
                </>
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
            className={`z-20 col-start-1 row-span-full h-full min-[900px]:col-start-2 min-[900px]:row-start-1 ${
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
    </>
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
  disabled: boolean;
};

function FilterMenu({
  currentFilter,
  currentSortMethod,
  resetState,
  disabled,
}: FilterMenuPropType) {
  const router = useRouter();
  const { selOptionFormat } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [newFilter, setNewFilter] = useState<newFilterType>(DEFAULT_FILTER);

  const numFilters = useMemo(() => {
    return (Object.keys(currentFilter) as (keyof SearchFilters)[]).reduce(
      (curr, key) => curr + (!!currentFilter[key] ? 1 : 0),
      0
    );
  }, [currentFilter]);

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

  useEffect(() => {
    if (disabled) setIsVisible(false);
  }, [disabled]);

  return (
    <>
      {/* Filter Button */}
      <button
        onClick={toggleVisibility}
        disabled={disabled}
        className={`flex items-center gap-1 ${
          disabled ? "touch-none text-gray-400 dark:text-gray-600" : ""
        }`}
      >
        {!isVisible ? (
          <MdFilterList className="shrink-0 text-slate-500" />
        ) : (
          <MdFilterListOff className="shrink-0 text-slate-500" />
        )}{" "}
        <span className="rounded-md bg-slate-300 px-1.5 text-sm font-medium dark:bg-slate-700">
          {numFilters}
        </span>
        Filters
      </button>

      {/* Filter Menu */}
      <div
        className={`${
          isVisible ? "block" : "hidden"
        } absolute left-0 top-12 z-10 max-h-[24rem] w-full animate-load-in overflow-y-auto rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-800`}
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
              className="w-full max-w-[6.5rem] text-right text-sm"
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
              className="w-full max-w-[6.5rem] text-right text-sm"
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

        <div className="flex flex-wrap justify-end gap-x-4 py-2">
          <button
            onClick={() => setNewFilter(DEFAULT_FILTER)}
            className="hover:underline"
          >
            Clear All
          </button>
          <Button2 onClick={updateFilters}>Update</Button2>
        </div>
      </div>
    </>
  );
}

/* Sort Menu */
type SortMenuPropTypes = {
  onChange: (method: string) => void;
  currentSortMethod: string;
  disabled: boolean;
};

const SORT_OPTS = [
  {
    value: "sort=date&order=desc",
    display: (
      <p className="flex flex-nowrap items-center">
        <BsFillCalendar2WeekFill />
        <HiArrowLongDown />
        Date (desc)
      </p>
    ),
  },
  {
    value: "sort=date&order=asc",
    display: (
      <p className="flex items-center">
        <BsFillCalendar2WeekFill />
        <HiArrowLongUp />
        Date (asc)
      </p>
    ),
  },
  {
    value: "sort=stars&order=desc",
    display: (
      <p className="flex items-center">
        <FaStar />
        <HiArrowLongDown />
        Stars (desc)
      </p>
    ),
  },
  {
    value: "sort=stars&order=asc",
    display: (
      <p className="flex items-center">
        <FaStar />
        <HiArrowLongUp />
        Stars (asc)
      </p>
    ),
  },
];

function SortMenu({
  onChange,
  currentSortMethod,
  disabled,
}: SortMenuPropTypes) {
  const [isOpen, setIsOpen] = useState(false);

  const updateSortMethod = (method: string) => {
    setIsOpen(false);
    onChange(method);
  };

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <div
      className={`relative z-10 ml-auto flex items-center ${
        disabled ? "touch-none text-gray-400 dark:text-gray-600" : ""
      }`}
    >
      <div
        className={`flex shrink-0 items-center ${
          !disabled ? "hover:cursor-pointer" : ""
        }`}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Sort
        <HiOutlineChevronDown className="mx-1 text-slate-500" />
      </div>

      <div
        className={`${
          isOpen ? "visible" : "hidden"
        } absolute right-0 top-12 top-[calc(100%+0.25rem)] w-max animate-load-in overflow-hidden rounded-md border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800`}
      >
        {SORT_OPTS.map((opt) => {
          const selected = opt.value === currentSortMethod;

          return (
            <div
              key={opt.value}
              onClick={() => updateSortMethod(opt.value)}
              className={`p-1 px-3 hover:cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-500 ${
                selected ? "bg-slate-100 dark:bg-slate-600" : ""
              }`}
            >
              {opt.display}
            </div>
          );
        })}
      </div>
    </div>
  );
}
