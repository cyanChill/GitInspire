import toast from "react-hot-toast";
import { FaCompass } from "react-icons/fa";

import PageHeader from "~components/layout/PageHeader";
import Button from "~components/form/Button";

export default function DiscoverPage() {
  const callNotify = () => toast.success("Toast to discovering new things!");

  return (
    <>
      <PageHeader
        name="Discover"
        description="Find inspiration from repositories suggested by fellow developers."
        icon={{ iconEl: FaCompass }}
        clr={{
          bkg: "bg-gradient-to-r from-blue-500 to-teal-500",
          txt: "text-slate-100",
          txtAcc: "text-gray-100",
        }}
      />

      <Button onClick={callNotify} className="mt-10">
        Click for Toast
      </Button>
    </>
  );
}
