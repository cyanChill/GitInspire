import React, { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { IoCreate } from "react-icons/io5";

import useUserContext from "~hooks/useUserContext";
import useRepotContext from "~hooks/useRepotContext";
import useMultistepForm from "~hooks/useMultistepForm";
import { normalizeStr } from "~utils/helpers";
import { ReactChildren } from "~utils/types";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import ProgressBar from "~components/form/ProgressBar";
import Button from "~components/form/Button";

import ContributeTypeForm from "~components/page_forms/ContributeTypeForm";
import RepoSuggForm from "~components/page_forms/RepoSuggForm";
import TagSuggForm from "~components/page_forms/TagSuggForm";
import ContributeSubmitForm, {
  FormDataType,
} from "~components/page_forms/ContributeSubmitForm";

const DEFAULT_DATA: FormDataType = {
  formType: "",
  author: "",
  repo_name: "",
  primary_tag: { label: "", value: "" },
  add_tags: [],
  new_tag_name: "",
  new_tag_type: "user_gen",
};

export default function ContributePage() {
  const { isBanned, isAccAge } = useUserContext();
  const { tags } = useRepotContext();

  const [data, setData] = useState(DEFAULT_DATA);

  const handleTypeSelection = (value: string) => {
    setData((prev) => ({ ...prev, formType: value }));
    next();
  };

  const updateField = (fields: Partial<FormDataType>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const { completed, currStep, isLastStep, next, back } = useMultistepForm([
    <ContributeTypeForm key="Step 1" handler={handleTypeSelection} />,
    data.formType === "tag" ? (
      <TagSuggForm key="Step 2" {...data} updateFields={updateField} />
    ) : (
      <RepoSuggForm key="Step 2" {...data} updateFields={updateField} />
    ),
    <ContributeSubmitForm key="Step 3" {...data} />,
  ]);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();

    if (data.formType === "repository" && data.primary_tag.value === "") {
      toast.error(
        "Please select a primary tag for this repository that best fits."
      );
      return;
    }

    const inPrimary = tags.primary.find(
      (val) => val.name === normalizeStr(data.new_tag_name)
    );
    const inUserGen = tags.user_gen.find(
      (val) => val.name === normalizeStr(data.new_tag_name)
    );

    if (data.formType === "tag" && (inPrimary || inUserGen)) {
      toast.error("That tag already exists.");
      return;
    }

    next();
  };

  useEffect(() => {
    setData(DEFAULT_DATA);
  }, []);

  if (isBanned) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 font-bold text-2xl text-center text-red-500 dark:text-red-400">
          Sorry, but your account is banned and doesn&apos;t have access to this
          feature.
        </p>
      </ContributePageWrapper>
    );
  }

  if (!isAccAge(3)) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 font-bold sm:text-xl text-amber-500">
          Sorry, but your account isn&apos;t old enough to contribute to Repot.
          Accounts may suggest the following given they meet the criterias:
        </p>
        <ul className="ml-10 list-disc text-sm sm:text-base">
          <li>
            You can suggest a repository if your GitHub account age is older
            than <span className="font-bold">3 months</span>.
          </li>
          <li>
            You can suggest a tag if your GitHub account age is older than{" "}
            <span className="font-bold">1 year</span>.
          </li>
        </ul>
      </ContributePageWrapper>
    );
  }

  return (
    <ContributePageWrapper>
      <div className="sm:m-10 mt-10">
        <ProgressBar
          steps={["Contribution Type", "Submission Form", "Submit"]}
          completed={completed}
        />

        <form onSubmit={handleNext} className="animate-load-in mt-7">
          {currStep}

          {completed !== 0 && (
            <div className="flex justify-end gap-3 mt-3">
              <Button type="button" onClick={back}>
                Back
              </Button>
              {!isLastStep && <Button>Next</Button>}
            </div>
          )}
        </form>
      </div>
    </ContributePageWrapper>
  );
}

const ContributePageWrapper = ({ children }: ReactChildren) => {
  return (
    <>
      <SEO pageName="Contribute" />
      <div className="animate-load-in">
        <PageHeader
          name="Contribute to Repot"
          icon={{ iconEl: IoCreate }}
          clr={{
            bkg: "bg-gradient-to-r from-red-500 to-red-800",
            txt: "text-slate-100",
            txtAcc: "text-gray-100",
          }}
        />
        {children}
      </div>
    </>
  );
};
