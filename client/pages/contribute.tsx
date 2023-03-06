import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { IoCreate } from "react-icons/io5";

import useUserContext from "~hooks/useUserContext";
import useAppContext from "~hooks/useAppContext";
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
import Spinner from "~components/Spinner";

const DEFAULT_DATA: FormDataType = {
  formType: "",
  author: "",
  repo_name: "",
  primary_tag: undefined,
  add_tags: [],
  new_tag_name: "",
  new_tag_type: "user_gen",
};

export default function ContributePage() {
  const router = useRouter();

  const { redirectIfNotAuth, isLoading, isBanned, isAccAge } = useUserContext();
  const { tags } = useAppContext();

  const [data, setData] = useState(DEFAULT_DATA);
  const [doneInfo, setDoneInfo] = useState<{ redirect_link: string } | null>(
    null
  );

  const handleTypeSelection = (value: string) => {
    setData((prev) => ({ ...prev, formType: value }));
    next();
  };

  const updateField = (fields: Partial<FormDataType>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const { completed, currStep, isLastStep, goTo, next, back } =
    useMultistepForm([
      <ContributeTypeForm key="Step 1" handler={handleTypeSelection} />,
      data.formType === "tag" ? (
        <TagSuggForm key="Step 2" {...data} updateFields={updateField} />
      ) : (
        <RepoSuggForm key="Step 2" {...data} updateFields={updateField} />
      ),
      <ContributeSubmitForm
        key="Step 3"
        {...data}
        propCompleteState={setDoneInfo}
      />,
    ]);

  const handleNext = (e: FormEvent) => {
    e.preventDefault();

    // Make sure a primary tag is selected & not empty
    if (
      data.formType === "repository" &&
      (!data.primary_tag || data.primary_tag.value === "")
    ) {
      toast.error(
        "Please select a primary tag for this repository that best fits."
      );
      return;
    }

    // Make sure tag name isn't empty
    if (
      data.formType === "tag" &&
      (!data.new_tag_name || data.new_tag_name.trim() === "")
    ) {
      toast.error("The tag name should not be empty.");
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

  const resetForm = () => {
    setData(DEFAULT_DATA);
    goTo(0);
    setDoneInfo(null);
  };

  useEffect(() => {
    resetForm();
  }, []); /* eslint-disable-line */

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (doneInfo) {
      next();
      // Redirect to repository page after retrieval of completion data from
      // final form
      if (doneInfo.redirect_link) {
        timeout = setTimeout(() => {
          router.push(doneInfo.redirect_link);
        }, 3000);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [doneInfo, next]); /* eslint-disable-line */

  useEffect(() => {
    redirectIfNotAuth();
  }, [redirectIfNotAuth]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center">
        <Spinner />
      </div>
    );
  }

  if (isBanned) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 text-center text-2xl font-bold text-red-500 dark:text-red-400">
          Sorry, but your account is banned and doesn&apos;t have access to this
          feature.
        </p>
      </ContributePageWrapper>
    );
  }

  if (!isAccAge(3)) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 font-bold text-amber-500 sm:text-xl">
          Sorry, but your account isn&apos;t old enough to contribute to
          GitInspire. Accounts may suggest the following given they meet the
          criterias:
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
      <div className="mt-10 sm:m-10">
        <ProgressBar
          steps={["Contribution Type", "Submission Form", "Submit"]}
          completed={completed}
        />

        <form onSubmit={handleNext} className="mt-7 animate-load-in">
          {currStep}

          {completed !== 0 && !doneInfo && (
            <div className="mt-3 flex justify-end gap-3">
              <Button type="button" onClick={back}>
                Back
              </Button>
              {!isLastStep && <Button>Next</Button>}
            </div>
          )}
        </form>

        {completed === 3 && (
          <div className="mt-10 flex animate-load-in flex-col items-center text-center">
            <p className="text-xl font-bold">
              Successfully contributed to GitInspire!
            </p>
            {doneInfo?.redirect_link ? (
              <p className="mt-1 italic">
                Redirecting you to newly suggested repository...
              </p>
            ) : (
              <Button
                type="button"
                onClick={resetForm}
                clr={{
                  bkg: "bg-gradient-to-r from-green-500 enabled:hover:from-green-500 to-emerald-500 enabled:hover:to-emerald-600",
                  txt: "text-white",
                }}
                className="mt-5"
              >
                Contribute more?
              </Button>
            )}
          </div>
        )}
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
          name="Contribute to GitInspire"
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
