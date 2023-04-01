import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import { getCookie } from "~utils/cookies";
import { ReportObjType } from "~utils/types";

export default function AdminPage() {
  const { redirectIfNotAdmin } = useUserContext();

  const [data, setData] = useState<ReportObjType[]>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    fetch("/api/report", {
      method: "GET",
      headers: { "X-CSRF-TOKEN": getCookie("csrf_access_token") || "" },
    })
      .then((res) => {
        if (!res.ok) {
          // There's no errors that'll stem from the inputs provided in the query string
          toast.error("Something went wrong with fetching reports.");
        } else {
          return res.json();
        }
      })
      .then((data) => {
        console.log(data);
        setData(data.reports);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  return <div className="animate-load-in">Admin Panel</div>;
}
