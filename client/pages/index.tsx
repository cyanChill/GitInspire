import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { GiRollingDices } from "react-icons/gi";
import { AiOutlinePlus } from "react-icons/ai";
import { CiTrash, CiSearch, CiSquareChevRight } from "react-icons/ci";

import { normalizeStr } from "~utils/helpers";
import { Generic_Obj } from "~utils/types";
import useAppContext from "~hooks/useAppContext";
import Select, { SelectOption } from "~components/form/Select";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import Input, { InputGroup } from "~components/form/Input";
import Button from "~components/form/Button";
import Spinner from "~components/Loading";
import BriefWidget from "~components/repository/BriefWidget";

export default function Home() {
  return (
    <>
      <SEO pageName="Home" />
      <div className="animate-load-in rounded-3xl">
        <PageHeader
          name="Find a Random Repository"
          description="Take a chance and find something new"
          icon={{ iconEl: GiRollingDices }}
        />
        <RandomRepoForm />
      </div>
    </>
  );
}

type StarType = {
  min: number | string;
  max: number | string;
};

const MAX_LANG = 3;

const RandomRepoForm = () => {
  const { selOptionFormat } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);

  const [langVals, setLangVals] = useState<SelectOption[]>([]);
  const [suggLang, setSuggLang] = useState("");
  const [stars, setStars] = useState<StarType>({ min: "", max: "" });

  const [results, setResults] = useState<Generic_Obj[] | null>(null);
  const [display, setDisplay] = useState<Generic_Obj | null>(null);

  const addToLang = () => {
    if (suggLang && !!suggLang.trim()) {
      if (langVals.length === MAX_LANG) return;
      const newLang = { label: suggLang.trim(), value: normalizeStr(suggLang) };
      // If suggested language is not in list of language criterias
      if (!langVals.find((o) => o.value === newLang.value)) {
        setLangVals((prev) => [...prev, newLang]);
      }
      setSuggLang("");
    }
  };

  const clearForm = () => {
    setLangVals([]);
    setSuggLang("");
    setStars({ min: "", max: "" });
    setResults(null);
    setDisplay(null);
  };

  const findRepo = async () => {
    if (isLoading) return;
    // Validation
    const errors = [];
    const langs = langVals
      .map((lg) => `${lg.value}`)
      .filter((lg) => !!lg.trim());
    const langQueryString = langs.join(",");
    if (
      parseInt(`${stars.min}`) < 0 ||
      (stars.max !== "" && stars.min >= stars.max)
    ) {
      errors.push("Invalid values for star range.");
    }
    if (langs.length > MAX_LANG) {
      errors.push(`Too many languages (max: ${MAX_LANG}).`);
    }
    if (errors.length > 0) {
      errors.forEach((err) => toast.error(err));
      return;
    }

    setIsLoading(true);
    setResults(null);
    setDisplay(null);
    const res = await fetch(
      `/api/random?minStars=${stars.min}&maxStars=${
        stars.max
      }&languages=${encodeURIComponent(langQueryString)}`
    );

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
      } else if (data.results.length === 0) {
        toast.error("No repos found with this search criteria.", {
          duration: 5000,
        });
      } else {
        const foundRepos: Generic_Obj[] = data.results;
        const randIdx = Math.floor(Math.random() * foundRepos.length);
        setDisplay(foundRepos[randIdx]);
        setResults(foundRepos.filter((_, idx) => idx != randIdx));
      }
      setIsLoading(false);
    } catch (err) {
      toast.error("Something went wrong.");
      setIsLoading(false);
    }
  };

  const newDisplayRepo = () => {
    if (!results || results.length === 0) {
      // If no cached results, search with the current query
      setDisplay(null);
      findRepo();
    } else {
      // Get random value from cached results
      const randIdx = Math.floor(Math.random() * results.length);
      setDisplay(results[randIdx]);
      setResults((prev) =>
        !prev ? null : prev.filter((_, idx) => idx != randIdx)
      );
    }
  };

  return (
    <main className="mt-8 rounded-lg bg-gray-50 p-4 pb-2 dark:bg-gray-800">
      <h2 className="mb-2 text-xl font-semibold">
        Languages{" "}
        <span className="text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-400">
          (Max 3)
        </span>
      </h2>
      <Select
        multiple={true}
        options={selOptionFormat.languages}
        value={langVals}
        max={MAX_LANG}
        onChange={setLangVals}
      />
      <InputGroup label="Or Suggest Your Own" className="mt-3">
        <div className="flex flex-nowrap">
          <Input
            disabled={isLoading}
            type="text"
            value={suggLang}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSuggLang(e.target.value)
            }
            onKeyDown={(e: KeyboardEvent) => {
              if (e.code === "Enter") addToLang();
            }}
            className="w-full max-w-[10rem] rounded-r-none"
          />
          <button
            title="Add Language to Filter"
            disabled={isLoading}
            onClick={addToLang}
            className="hover:text-teal-p-100"
          >
            <AiOutlinePlus />
          </button>
        </div>
      </InputGroup>

      <h2 className="mb-2 mt-4 overflow-y-clip text-xl font-semibold">
        Star Range
      </h2>
      <div className="flex flex-col gap-2 gap-x-6 text-base min-[400px]:flex-row">
        <InputGroup label="MIN">
          <Input
            disabled={isLoading}
            type="number"
            min={0}
            value={stars.min}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setStars((prev) => ({ ...prev, min: +e.target.value }))
            }
            className="w-full max-w-[10rem] text-right"
          />
        </InputGroup>
        <InputGroup label="MAX">
          <Input
            disabled={isLoading}
            type="number"
            value={stars.max}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setStars((prev) => ({ ...prev, max: +e.target.value }))
            }
            className="w-full max-w-[10rem] text-right"
          />
        </InputGroup>
      </div>

      <div className="flex justify-end gap-3 p-2 text-base">
        <button
          title="Clear Filters"
          disabled={isLoading}
          onClick={clearForm}
          className="hover:text-red-p-400"
        >
          <CiTrash className="h-6 w-6" />
        </button>
        <button
          title="Search"
          disabled={isLoading}
          onClick={findRepo}
          className="text-teal-p-600 hover:text-teal-p-700"
        >
          <CiSearch className="h-6 w-6" />
        </button>
      </div>

      {isLoading && <Spinner />}

      {display && (
        <>
          <hr />
          <div className="mt-1.5">
            <h2 className="my-3 mb-2 text-xl font-semibold">Result:</h2>
            <BriefWidget data={display} fixedDim={true} />
            <button
              title="Next Result"
              onClick={newDisplayRepo}
              className="block my-2 ml-auto text-3xl hover:text-orange-p-600"
            >
              <CiSquareChevRight />
            </button>
          </div>
        </>
      )}
    </main>
  );
};
