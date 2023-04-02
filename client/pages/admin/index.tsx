import { useEffect } from "react";
import { useRouter } from "next/router";
import { GoBrowser, GoTag } from "react-icons/go";
import { TbReport, TbHistory } from "react-icons/tb";
import { FaUsersCog } from "react-icons/fa";

import useUserContext from "~hooks/useUserContext";
import {
  SelectionMenuFormOptions,
  SelectMenuOption,
} from "~components/form/SelectionMenuForm";
import Spinner from "~components/Spinner";

const REDIRECT_OPTIONS: SelectMenuOption[] = [
  {
    title: "View Reports",
    description: "View all open reports.",
    value: "/admin/reports",
    icon: <TbReport />,
    bkgClr: "bg-emerald-500",
  },
  {
    title: "View Log History",
    description: "View all logs of admin & automatic server actions.",
    value: "/admin/logs",
    icon: <TbHistory />,
    bkgClr: "bg-indigo-500",
  },
  {
    title: "Manage Tags",
    description: "Update and delete tags that may be incorrect or duplicated.",
    value: "/admin/tags",
    icon: <GoTag />,
    bkgClr: "bg-sky-500",
  },
  {
    title: "Manage Repositories",
    description:
      "Update tags or the maintain links or delete any problematic repositories.",
    value: "/admin/repositories",
    icon: <GoBrowser />,
    bkgClr: "bg-orange-500",
  },
  {
    title: "Manage Users",
    description: "Update a user's status if they're problematic.",
    value: "/admin/users",
    icon: <FaUsersCog />,
    bkgClr: "bg-pink-500",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, redirectIfNotAdmin } = useUserContext();

  const handleSelection = (route: string) => {
    router.push(route);
  };

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  if (!isAdmin) {
    return (
      <div className="flexanimate-load-in justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex h-full animate-load-in flex-col items-center justify-center">
      <span className="my-3 text-center font-bold text-red-400">
        Admin Panel
      </span>
      <h1 className="text-center text-4xl font-bold">Avaliable Actions</h1>

      <SelectionMenuFormOptions
        options={REDIRECT_OPTIONS}
        selectOption={handleSelection}
        className="w-full min-w-0 max-w-fit"
      />
    </div>
  );
}
