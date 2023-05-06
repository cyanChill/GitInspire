import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { IoCreate } from "react-icons/io5";
import { CiSquareChevLeft, CiSquareChevRight, CiRedo } from "react-icons/ci";

import useUserContext from "~hooks/useUserContext";
import useAppContext from "~hooks/useAppContext";
import useMultistepForm from "~hooks/useMultistepForm";
import { normalizeStr } from "~utils/helpers";
import { ReactChildren } from "~utils/types";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import ProgressBar from "~components/form/ProgressBar";

import ContributeTypeForm from "~components/page_forms/ContributeTypeForm";
import RepoSuggForm from "~components/page_forms/RepoSuggForm";
import TagSuggForm from "~components/page_forms/TagSuggForm";
import ContributeSubmitForm, {
  FormDataType,
} from "~components/page_forms/ContributeSubmitForm";
import Spinner from "~components/Loading";

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

  function handleTypeSelection(value: string) {
    setData((prev) => ({ ...prev, formType: value }));
    next();
  }

  function updateField(fields: Partial<FormDataType>) {
    setData((prev) => ({ ...prev, ...fields }));
  }

  /* Validate inputs before moving on to the next form */
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

    // Make sure tag name isn't empty or is >25 characters
    if (data.formType === "tag") {
      if (!data.new_tag_name || data.new_tag_name.trim() === "") {
        toast.error("The tag name should not be empty.");
        return;
      }
      if (data.new_tag_name.trim().length > 25) {
        toast.error("Tag name can't be more than 25 characters.");
        return;
      }
    }

    // Make sure the tag doesn't already exist
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

  /* Reset form when user clicks on the "Contribute" navigation button */
  useEffect(() => {
    resetForm();
  }, [router]); /* eslint-disable-line */

  /* Redirect user to repository page after retrieval of completion data from final form */
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (doneInfo) {
      next();
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
      <>
        <SEO pageName="Contribute" />
        <div className="flex h-full items-center">
          <Spinner />
        </div>
      </>
    );
  }

  if (isBanned) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 text-center text-xl font-semibold text-red-500 dark:text-red-400">
          Sorry, but your account is banned and doesn&apos;t have access to this
          feature.
        </p>
      </ContributePageWrapper>
    );
  }

  if (!isAccAge(3)) {
    return (
      <ContributePageWrapper>
        <p className="mt-10 text-sm font-semibold text-amber-500 sm:text-base">
          Sorry, but your account isn&apos;t old enough to contribute to
          GitInspire. Accounts may suggest the following given they meet the
          criterias:
        </p>
        <ul className="ml-10 list-disc text-xs sm:text-base">
          <li>
            You can suggest a repository if your GitHub account age is older
            than <span className="font-semibold underline">3 months</span>.
          </li>
          <li>
            You can suggest a tag if your GitHub account age is older than{" "}
            <span className="font-semibold underline">1 year</span>.
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
            <div className="ml-auto mt-3 border-t-[1px] border-black dark:border-white sm:max-w-[25rem]">
              <div className="ml-auto flex max-w-[8.5rem] items-center justify-end gap-1 border border-t-0 border-black p-1 py-0.5 dark:border-white">
                <button type="button" onClick={back}>
                  <CiSquareChevLeft className="h-7 w-7 hover:text-red-p-400" />
                </button>
                {!isLastStep && (
                  <button type="submit">
                    <CiSquareChevRight className="h-7 w-7 hover:text-teal-p-600" />
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {completed === 3 && (
          <div className="mt-10 flex animate-load-in flex-col items-center text-center">
            <p className="text-xl font-semibold">
              Successfully contributed to GitInspire!
            </p>

            {doneInfo?.redirect_link ? (
              <p className="mt-1 text-sm italic">
                Redirecting you to newly suggested repository...
              </p>
            ) : (
              <button
                type="button"
                onClick={resetForm}
                className="group mt-5 flex items-center gap-1 border border-teal-p-600 px-2 py-0.5 text-sm text-teal-p-600 transition-colors hover:border-teal-p-700 hover:text-teal-p-700 hover:underline dark:hover:border-teal-p-100 dark:hover:text-teal-p-100"
              >
                Contribute More?{" "}
                <CiRedo className="h-7 w-7 transition-transform duration-700 group-hover:rotate-[360deg] group-hover:text-teal-p-600" />
              </button>
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
          shadowAccentClr="shadow-red-500"
        />
        {children}
      </div>
    </>
  );
};
