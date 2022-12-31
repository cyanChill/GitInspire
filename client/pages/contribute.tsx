import { useState, useEffect } from "react";
import { GoBrowser, GoTag } from "react-icons/go";

import PageHeader from "~components/layout/PageHeader";
import ProgressBar from "~components/form/ProgressBar";
import SelectionMenuForm, {
  SelectMenuOption,
} from "~components/form/SelectionMenuForm";

const creation_options: SelectMenuOption[] = [
  {
    title: "Repository",
    description: "Provide anything cool or inspirational to fellow developers.",
    value: "repository",
    icon: <GoBrowser />,
    bkgClr: "bg-fuchsia-500",
  },
  {
    title: "Tag",
    description:
      "Provide a more diverse labeling scheme to help developers find what they need.",
    value: "tag",
    icon: <GoTag />,
    bkgClr: "bg-yellow-500",
  },
];

type FormType = {
  formType: string;
};

const DEFAULT_DATA: FormType = {
  formType: "",
};

export default function ContributePage() {
  const [completed, setCompleted] = useState(0);
  const [data, setData] = useState(DEFAULT_DATA);

  const addField = (fields: Partial<FormType>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  useEffect(() => {
    if (data.formType) setCompleted(1);
  }, [data]);

  return (
    <div>
      <PageHeader
        name="Contribute to Repot"
        clr={{
          bkg: "bg-gradient-to-r from-red-500 to-red-800",
          txt: "text-slate-100",
          txtAcc: "text-gray-100",
        }}
      />

      <div className="mt-10">
        <ProgressBar
          steps={["Suggestion Type", "Submission Form", "Submit"]}
          completed={completed}
        />
        <SelectionMenuForm
          title="Contribution Type"
          description="Help the community by providing new repository suggestions or tags to
          help label these repositories accordingly."
          options={creation_options}
          selectOption={(value: string) =>
            setData((prev) => ({ ...prev, formType: value }))
          }
          className="mt-7"
        />
      </div>
    </div>
  );
}
