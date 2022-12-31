import { GoBrowser, GoTag } from "react-icons/go";

import useUserContext from "~hooks/useUserContext";
import SelectionMenuForm, {
  SelectMenuOption,
} from "~components/form/SelectionMenuForm";

type CreateOptsType = {
  minAgeMonths: number;
} & SelectMenuOption;

/*
  Users that aren't banned can:
    - Suggest repositories after have a GitHub account age > 3 months.
    - Suggest tags after having a GitHub account agte > 1 year.
*/
const creation_options: CreateOptsType[] = [
  {
    title: "Repository",
    description: "Provide anything cool or inspirational to fellow developers.",
    value: "repository",
    icon: <GoBrowser />,
    bkgClr: "bg-fuchsia-500",
    minAgeMonths: 3,
  },
  {
    title: "Tag",
    description:
      "Provide a more diverse labeling scheme to help developers find what they need.",
    value: "tag",
    icon: <GoTag />,
    bkgClr: "bg-yellow-500",
    minAgeMonths: 12,
  },
];

type TypeFormProps = {
  handler: (value: string) => void;
};

export default function ContributeTypeForm({ handler }: TypeFormProps) {
  const { isAccAge } = useUserContext();

  const avaliableOpts = creation_options.filter((opt) =>
    isAccAge(opt.minAgeMonths)
  );

  return (
    <SelectionMenuForm
      title="Contribution Type"
      description="Help the community by providing new repository suggestions or tags to
help label these repositories accordingly."
      options={avaliableOpts}
      selectOption={handler}
      className="animate-load-in"
    />
  );
}
