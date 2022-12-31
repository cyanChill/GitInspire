import { useState } from "react";

import { SelectOption } from "~components/form/Select";
import Button from "~components/form/Button";
import { getCookie } from "~utils/cookies";

export type FormDataType = {
  formType: string;
  author: string;
  repo_name: string;
  primary_tag: SelectOption;
  add_tags: SelectOption[];
  new_tag_name: string;
  new_tag_type: "user_gen" | "primary";
};

type ContributeSubmitProps = {} & FormDataType;

export default function ContributeSubmitForm({
  formType,
  author,
  repo_name,
  primary_tag,
  add_tags,
  new_tag_name,
  new_tag_type,
}: ContributeSubmitProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [contributionLink, setContributionLink] = useState("");

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

    return "";
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

    return "";
  };

  const submitData = async () => {
    setIsLoading(true);
    let errors;

    if (formType === "repository") errors = await submitNewRepo();
    else errors = await submitNewTag();

    if (!errors) {
    } else {
    }

    setIsLoading(false);
  };

  return (
    <div className="animate-load-in">
      <p>You&apos;re approaching the end.</p>
      <p>There&apos;s one click left before you helped contributed to Repot!</p>

      <Button type="button" onClick={submitData} disabled={isLoading}>
        Submit
      </Button>
    </div>
  );
}
