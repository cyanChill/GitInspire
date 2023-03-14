import { useState, useMemo, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { GiRollingDices } from "react-icons/gi";

import { normalizeStr } from "~utils/helpers";
import { Generic_Obj } from "~utils/types";
import useAppContext from "~hooks/useAppContext";
import Select, { SelectOption } from "~components/form/Select";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import Input, { InputGroup } from "~components/form/Input";
import Button from "~components/form/Button";
import Spinner from "~components/Spinner";
import BriefWidget from "~components/repository/BriefWidget";

export default function Home() {
  return (
    <>
      <SEO pageName="Home" />

      <div className="relative animate-load-in rounded-3xl">
        <PageHeader
          name="Find a Random Repository"
          description="Take a chance and find something new"
          icon={{ iconEl: GiRollingDices }}
          clr={{
            bkg: "bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600",
            txt: "text-slate-100",
            txtAcc: "text-gray-100",
          }}
          className="shadow-xl"
        />
        <RandomRepoForm />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">GitInspire Stats</h2>
      </section>
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

  const [langVals, setLangVals] = useState<SelectOption[]>([]);
  const [suggLang, setSuggLang] = useState("");
  const [stars, setStars] = useState<StarType>({ min: "", max: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<Generic_Obj[] | null>(null);
  const [display, setDisplay] = useState<Generic_Obj | null>(null);

  const addToLang = () => {
    if (suggLang) {
      if (langVals.length === MAX_LANG) return;
      const newLang = { label: suggLang, value: normalizeStr(suggLang) };
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
    // Validation
    const errors = [];
    const langs = langVals
      .map((lg) => `${lg.value}`)
      .filter((lg) => !!lg.trim());
    const langQueryString = langs.join(",");
    if (stars.min < 0 || (stars.max !== "" && stars.min >= stars.max)) {
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
      `/api/random?minStars=${stars.min}&maxStars=${stars.max}&languages=${langQueryString}`
    );

    try {
      const data = await res.json();
      console.log(data);
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
    <section className="mt-[-1.5rem] rounded-2xl rounded-t-none bg-gray-50 p-4 pt-12 pb-2 shadow-inner shadow-slate-500 dark:bg-gray-800 dark:shadow-zinc-500">
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
          <Button
            onClick={addToLang}
            clr={{
              bkg: "bg-gradient-to-r from-rose-400 hover:from-rose-500 to-pink-400 hover:to-pink-500",
              txt: "text-white",
            }}
            className="!m-0 rounded-l-none"
          >
            Add
          </Button>
        </div>
      </InputGroup>

      <h2 className="mt-4 mb-2 overflow-y-clip text-xl font-semibold">
        Star Range
      </h2>
      <div className="flex flex-col gap-2 gap-x-6 text-base min-[400px]:flex-row">
        <InputGroup label="MIN">
          <Input
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
        <Button
          onClick={clearForm}
          clr={{
            bkg: "",
            txt: "text-red-400 dark:text-red-300 hover:text-red-500",
          }}
          className="!tracking-wide !shadow-none"
        >
          Reset Filters
        </Button>
        <Button
          disabled={isLoading}
          onClick={findRepo}
          clr={{
            bkg: "bg-gradient-to-r from-cyan-500 enabled:hover:from-sky-500 to-blue-500 enabled:hover:to-indigo-500 disabled:opacity-25",
            txt: "text-white",
          }}
          className="!tracking-wide"
        >
          Search
        </Button>
      </div>

      {isLoading && <Spinner />}

      {display && (
        <>
          <hr />
          <div className="mt-1.5">
            <h2 className="my-3 mb-2 text-xl font-semibold">Result:</h2>
            <BriefWidget data={display} fixedDim={true} />
            <Button onClick={newDisplayRepo} className="ml-auto">
              Next
            </Button>
          </div>
        </>
      )}
    </section>
  );
};
