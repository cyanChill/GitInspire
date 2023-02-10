import { useState } from "react";
import toast from "react-hot-toast";

import useAppContext from "~hooks/useAppContext";
import { getCookie } from "~utils/cookies";
import { TagObjType, RepositoryObjType } from "~utils/types";
import { SelectOption } from "~components/form/Select";
import Button from "~components/form/Button";

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
    const res = await fetch("/api/repositories/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCookie("csrf_access_token") || "",
      },
      body: JSON.stringify({ author, repo_name, primary_tag, tags: add_tags }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.msg || data.message };
    return { repository: data.repository, message: data.message };
  };

  const submitNewTag = async () => {
    const res = await fetch("/api/tags/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCookie("csrf_access_token") || "",
      },
      body: JSON.stringify({ display_name: new_tag_name, type: new_tag_type }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.msg || data.message };
    return { tag: data.tag, message: data.message };
  };

  const submitData = async () => {
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
      <div className="animate-load-in mt-10 text-center">
        <p className="text-red-500 dark:text-red-400">
          Sorry, but something went wrong with your submission.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-load-in flex flex-col items-center mt-10 text-center">
      <p className="text-xl font-bold">You&apos;re approaching the end.</p>
      <p className="mt-1">
        There&apos;s one click left before you helped contributed to GitInspire!
      </p>

      <Button
        type="button"
        onClick={submitData}
        disabled={isLoading}
        clr={{
          bkg: "bg-gradient-to-r from-green-500 enabled:hover:from-green-500 to-emerald-500 enabled:hover:to-emerald-600 disabled:opacity-25",
          txt: "text-white",
        }}
        className="mt-5"
      >
        Submit
      </Button>
    </div>
  );
}
