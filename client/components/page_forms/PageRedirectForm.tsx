import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FaCompass } from "react-icons/fa";
import { IoCreate } from "react-icons/io5";
import { GiRollingDices } from "react-icons/gi";

import useUserContext from "~hooks/useUserContext";
import {
  SelectionMenuFormOptions,
  SelectMenuOption,
} from "~components/form/SelectionMenuForm";

const REDIRECT_OPTIONS: SelectMenuOption[] = [
  {
    title: "Explore",
    description:
      "Find a random repository on GitHub given your specific needs.",
    value: "/",
    icon: <GiRollingDices />,
    bkgClr: "bg-emerald-500",
  },
  {
    title: "Discover",
    description:
      "Find a repository within our database suggested by other users.",
    value: "/discover",
    icon: <FaCompass />,
    bkgClr: "bg-sky-500",
  },
];

const AUTH_REDIRECT_OPT: SelectMenuOption = {
  title: "Contribute",
  description: "Suggest a repository to other users.",
  value: "/contribute",
  icon: <IoCreate />,
  bkgClr: "bg-indigo-500",
};

export default function PageRedirectForm() {
  const router = useRouter();
  const { isAuthenticated } = useUserContext();

  const [options, setOptions] = useState<SelectMenuOption[]>([]);

  const handleSelection = (route: string) => {
    router.push(route);
  };

  useEffect(() => {
    if (isAuthenticated) setOptions([...REDIRECT_OPTIONS, AUTH_REDIRECT_OPT]);
    else setOptions(REDIRECT_OPTIONS);
  }, [isAuthenticated]);

  return (
    <SelectionMenuFormOptions
      options={options}
      selectOption={handleSelection}
      className="w-full min-w-0 max-w-fit"
    />
  );
}
