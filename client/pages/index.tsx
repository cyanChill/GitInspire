import React, { useState } from "react";
import { GiRollingDices } from "react-icons/gi";

import { SelectOption } from "~components/form/Select";
import SEO from "~components/SEO";
import PageHeader from "~components/PageHeader";
import Select from "~components/form/Select";
import Input from "~components/form/Input";
import InputGroup from "~components/form/InputGroup";
import Button from "~components/form/Button";

const DUMMY_OPTIONS = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
  { label: "Ruby on Rails", value: "ruby_on_rails" },
  { label: "Python", value: "python" },
  { label: "Shell", value: "shell" },
  { label: "C++", value: "c++" },
  { label: "C#", value: "c#" },
];

export default function Home() {
  return (
    <>
      <SEO pageName="Home" />

      <div className="relative rounded-3xl">
        <PageHeader
          name="Find a Random Repository"
          description="Take a chance and find something new"
          icon={{ iconEl: GiRollingDices }}
          clr={{
            bkg: "bg-gradient-to-r from-violet-500 dark:from-violet-600 via-purple-500 dark:via-purple-600 to-fuchsia-500 dark:to-fuchsia-600",
            txt: "text-slate-100 dark:text-white",
            txtAcc: "text-gray-100 dark:text-gray-200",
          }}
        />
        <RandomRepoForm />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Repot Stats</h2>
      </section>
    </>
  );
}

type StarType = {
  min: number | string;
  max: number | string;
};

const RandomRepoForm = () => {
  const [langVals, setLangVals] = useState<SelectOption[]>([]);
  const [stars, setStars] = useState<StarType>({
    min: "",
    max: "",
  });
  const [result, setResult] = useState(null);

  const clearForm = () => {
    setLangVals([]);
    setStars({ min: "", max: "" });
  };

  const findRepo = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(
      `Form Data:\nLanguages: ${langVals.map((lng) => lng.label)}\nMin Stars: ${
        stars.min
      }\nMax Stars: ${stars.max}`
    );

    /*
      TODO: Send request to backend (/api/random?<query params>)
        - Do form validation (ie: minStars < maxStars)
    */
  };

  return (
    <section className="p-4 pt-12 pb-2 mt-[-1.5rem] rounded-2xl rounded-t-none bg-gray-50 dark:bg-gray-800 shadow-inner shadow-slate-500 dark:shadow-zinc-500">
      <h2 className="text-xl font-semibold mb-2">
        Languages{" "}
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
          (Max 3)
        </span>
      </h2>
      <Select
        multiple={true}
        options={DUMMY_OPTIONS}
        value={langVals}
        max={3}
        onChange={setLangVals}
      />

      <h2 className="overflow-y-clip text-xl font-semibold mt-4 mb-2">
        Star Range
      </h2>
      <div className="flex flex-col min-[400px]:flex-row gap-2 gap-x-6 text-base">
        <InputGroup label="MIN">
          <Input
            type="number"
            min={0}
            value={stars.min}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStars((prev) => ({ ...prev, min: +e.target.value }))
            }
            className="w-full max-w-[10rem] text-right"
          />
        </InputGroup>
        <InputGroup label="MAX">
          <Input
            type="number"
            value={stars.max}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
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
          onClick={findRepo}
          clr={{
            bkg: "bg-gradient-to-r from-cyan-500 hover:from-sky-500 to-blue-500 hover:to-indigo-500",
            txt: "text-white",
          }}
          className="!tracking-wide"
        >
          Search
        </Button>
      </div>

      {!!result && (
        <div>
          <hr />
          <h2>Search Response</h2>
        </div>
      )}
    </section>
  );
};
