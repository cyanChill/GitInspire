import { useState } from "react";
import toast from "react-hot-toast";
import { CiPaperplane } from "react-icons/ci";

import useAppContext from "~hooks/useAppContext";
import { authFetch } from "~utils/cookies";
import { TagObjType, RepositoryObjType } from "~utils/types";
import { SelectOption } from "~components/form/Select";
import { SubmissionFormWrapper } from "./ContributeFormWrapper";

export type FormDataType = {
  formType: string;
  author: string;
  repo_name: string;
  primary_tag: SelectOption | undefined;
  add_tags: SelectOption[];
  new_tag_name: string;
  new_tag_type: "user_gen" | "primary";
};

type ResponseType = {
  error?: string;
  repository?: RepositoryObjType;
  tag?: TagObjType;
};

type ContributeFormProps = {
  propCompleteState: (data: { redirect_link: string }) => void;
} & FormDataType;

export default function ContributeSubmitForm({
  formType,
  author,
  repo_name,
  primary_tag,
  add_tags,
  new_tag_name,
  new_tag_type,
  propCompleteState,
}: ContributeFormProps) {
  const { addTag } = useAppContext();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const submitNewRepo = async () => {
    const res = await authFetch("/api/repositories", {
      method: "POST",
      body: JSON.stringify({ author, repo_name, primary_tag, tags: add_tags }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.msg || data.message };
    return { repository: data.repository, message: data.message };
  };

  const submitNewTag = async () => {
    const res = await authFetch("/api/tags", {
      method: "POST",
      body: JSON.stringify({ display_name: new_tag_name, type: new_tag_type }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.msg || data.message };
    return { tag: data.tag, message: data.message };
  };

  const submitData = async () => {
    if (isLoading) return;

    setIsLoading(true);
    let response: ResponseType;
    if (formType === "repository") response = await submitNewRepo();
    else response = await submitNewTag();

    if (response.error) {
      toast.error(response.error);
      setError(true);
    } else if (formType === "repository" && response.repository) {
      // Handle repository submissions
      const repo_page = `/repository/${response.repository.id}`;
      propCompleteState({ redirect_link: repo_page });
    } else if (formType === "tag" && response.tag) {
      // Handle tag submissions
      addTag(response.tag);
      propCompleteState({ redirect_link: "" });
    }

    setIsLoading(false);
  };

  if (error) {
    return (
      <div className="mt-10 animate-load-in text-center">
        <p className="text-red-500 dark:text-red-400">
          Sorry, but something went wrong with your submission.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="font-semibold sm:text-xl">Review</p>
      <p className="mb-6 mt-1 text-xs sm:mb-8">
        Review your suggestion to GitInspire, then click the{" "}
        <span className="font-semibold">submit</span> button to contribute.
      </p>
      <SubmissionFormWrapper
        bdrClr={
          formType === "tag" ? "border-orange-p-600" : "border-purple-p-500"
        }
        variant={formType === "tag" ? "Tag" : "Repository"}
        className="!text-xs sm:pt-8"
      >
        <div className="flex-1 py-6 pt-4 text-xs text-slate-800 dark:text-gray-300 sm:py-8 sm:pt-6">
          {formType === "repository" ? (
            <>
              <DisplayItem label="Repository Name">
                <a
                  href={`https://www.github.com/${author}/${repo_name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {author}/{repo_name}
                </a>
              </DisplayItem>
              <DisplayItem label="Primary Tag">
                <span>{primary_tag?.label}</span>
              </DisplayItem>
              <DisplayItem label="Additional Tags">
                <span>{add_tags.map((tg) => tg.label).join(", ")}</span>
              </DisplayItem>
            </>
          ) : (
            <>
              <DisplayItem label="Tag Name">
                <span>{new_tag_name}</span>
              </DisplayItem>
              <DisplayItem label="Tag Type">
                <span>{new_tag_type.toUpperCase()}</span>
              </DisplayItem>
            </>
          )}
        </div>
      </SubmissionFormWrapper>

      <div className="ml-auto w-min animate-load-in sm:mt-4">
        <button
          type="button"
          onClick={submitData}
          disabled={isLoading}
          className="group flex items-center gap-1 border border-teal-p-600 px-2 py-0.5 text-sm text-teal-p-600 transition-colors hover:border-teal-p-700 hover:text-teal-p-700 hover:underline disabled:opacity-25 dark:hover:border-teal-p-100 dark:hover:text-teal-p-100"
        >
          Submit{" "}
          <CiPaperplane className="h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </>
  );
}

type DisplayItem = {
  label: string;
  children: React.ReactNode;
};

function DisplayItem({ label, children }: DisplayItem) {
  return (
    <p className="mt-2">
      <span className="font-semibold underline">{label}:</span> {children}
    </p>
  );
}
