import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { FaCompass } from "react-icons/fa";

import { RepositoryObj } from "~utils/types";
import useRepotContext from "~hooks/useRepotContext";
import PageHeader from "~components/layout/PageHeader";
import Button from "~components/form/Button";
import RepoInfoCard from "~components/repository/RepoInfoCard";

// Key is the page number of results for current search filter
interface RepoResults {
  [x: number]: RepositoryObj[];
}

interface SearchFilters {
  languages?: string[];
  stars?: { min?: number; max?: number };
  primary_tag?: string;
  tags?: string[];
  page: number;
}

export default function DiscoverPage() {
  const { languages, tags } = useRepotContext();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<RepoResults>({});
  const [maxPages, setMaxPages] = useState(0);
  const [currFilters, setCurrFilters] = useState<SearchFilters>({ page: 0 });

  const updateFilters = () => {
    // Update URL query parameters which triggers useEffect to update
    // state [when we click the "update filter" button after making
    // changes]
  };

  const firstPage = () => {
    setCurrFilters((prev) => ({ ...prev, page: 0 }));
  };

  const lastPage = () => {
    setCurrFilters((prev) => ({ ...prev, page: maxPages - 1 }));
  };

  const prevPage = () => {
    setCurrFilters((prev) => ({
      ...prev,
      page: prev.page !== 0 ? prev.page - 1 : prev.page,
    }));
  };
  const nextPage = () => {
    setCurrFilters((prev) => ({
      ...prev,
      page: prev.page !== maxPages - 1 ? prev.page + 1 : prev.page,
    }));
  };

  useEffect(() => {
    // Fetch results from database based on selected filters
    console.log(router.query);

    const abortCtrl = new AbortController();
    const pgNum = 0;
    const fetchURL = `/api/repositories/filter?page=${pgNum}`;
    setIsLoading(true);
    fetch(fetchURL, { signal: abortCtrl.signal })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setResults((prev) => ({ ...prev, [pgNum]: data }));
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
