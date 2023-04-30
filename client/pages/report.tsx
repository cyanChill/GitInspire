import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import { REPORT_TYPE_OPTIONS, REPORT_REASON_OPTIONS } from "~data";
import useUserContext from "~hooks/useUserContext";
import { fromURLQueryVal } from "~utils/helpers";
import { getCookie } from "~utils/cookies";
import Select, { SelectOption } from "~components/form/Select";
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import { Button2 } from "~components/form/Button";
import SEO from "~components/layout/SEO";

type ReportDataType = {
  type?: SelectOption;
  content_id?: string;
  reason?: SelectOption;
  maintain_link?: string;
  info?: string; // Additional Info
};

const DEFAULT_REPORT = {
  type: undefined,
  content_id: "",
  reason: undefined,
  maintain_link: "",
  info: "",
};

export default function ReportPage() {
  const router = useRouter();
  const { redirectIfNotAuth } = useUserContext();

  const [reportData, setReportData] = useState<ReportDataType>(DEFAULT_REPORT);
  const [isLoading, setIsLoading] = useState(false);

  const findSelectOption = (arr: SelectOption[], type: string) => {
    return arr.find((opt) => opt.value === type);
  };

  const isReportWithId = useMemo(() => {
    if (!reportData.type) return false;
    return ["repository", "tag", "user"].includes(`${reportData.type.value}`);
  }, [reportData.type]);

  const isMaintainReport = useMemo(() => {
    if (!reportData.type || !reportData.reason) return false;
    return (
      reportData.type.value === "repository" &&
      reportData.reason.value === "maintain_link"
    );
  }, [reportData.type, reportData.reason]);

  const onReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportData.type) {
      toast.error("A report type must be selected.");
      return;
    }
    if (isReportWithId && !reportData.content_id?.trim()) {
      toast.error("A content id/name must be provided.");
      return;
    }
    if (
      isReportWithId &&
      reportData.content_id &&
      reportData.content_id.trim().length > 25
    ) {
      toast.error("Content id/name can't be more than 25 characters.");
      return;
    }
    if (!reportData.reason) {
      toast.error("A report reason must be selected.");
      return;
    }
    if (isMaintainReport && !reportData.maintain_link?.trim()) {
      toast.error("A maintain link must be provided.");
      return;
    }
    if (!reportData.info?.trim()) {
      toast.error("Additional information must be provided in the report.");
      return;
    }
    if (reportData.info.trim().length > 280) {
      toast.error("Additional information can't be more than 280 characters.");
      return;
    }

    setIsLoading(true);
    const res = await fetch("/api/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": getCookie("csrf_access_token") || "",
      },
      body: JSON.stringify({
        ...reportData,
        type: reportData.type.value,
        reason: reportData.reason.value,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setIsLoading(false);
      toast.error(data.msg || data.message);
      return;
    }

    toast.success("Successfully submitted report.");
    router.push("/");
  };

  useEffect(() => {
    let providedInfo: ReportDataType = {};

    if (router.query.type) {
      providedInfo.type = findSelectOption(
        REPORT_TYPE_OPTIONS,
        fromURLQueryVal.onlyStr(router.query.type) || ""
      );
    }
    if (router.query.id) {
      providedInfo.content_id = fromURLQueryVal.onlyStr(router.query.id);
    }
    if (router.query.reason) {
      providedInfo.reason = findSelectOption(
        REPORT_REASON_OPTIONS,
        fromURLQueryVal.onlyStr(router.query.reason) || ""
      );
    }

    setReportData((prev) => ({ ...prev, ...providedInfo }));
  }, [router.query]);

  useEffect(() => {
    redirectIfNotAuth();
  }, [redirectIfNotAuth]);

  return (
    <>
      <SEO pageName="Report" />
      <div className="flex animate-load-in justify-center">
        <div className="w-full max-w-4xl bg-white p-2 shadow-md dark:bg-slate-800 dark:shadow-slate-700">
          <h1 className="text-center text-2xl font-semibold underline">
            Report or Suggest Something
          </h1>
          <form onSubmit={onReportSubmit} className="flex flex-col gap-y-2 ">
            <InputGroupAlt label="Report Type" required>
              <Select
                options={REPORT_TYPE_OPTIONS}
                onChange={(value) =>
                  setReportData((prev) => ({ ...prev, type: value }))
                }
                value={reportData.type}
              />
            </InputGroupAlt>

            {reportData.type && isReportWithId && (
              <InputGroup label="Content Id/Name" required>
                <Input
                  type="text"
                  value={reportData.content_id}
                  className="mb-2 w-full"
                  maxLength={25}
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReportData((prev) => ({
                      ...prev,
                      content_id: e.target.value,
                    }))
                  }
                />
              </InputGroup>
            )}

            <InputGroupAlt label="Reason" required>
              <Select
                options={REPORT_REASON_OPTIONS}
                onChange={(value) =>
                  setReportData((prev) => ({ ...prev, reason: value }))
                }
                value={reportData.reason}
              />
            </InputGroupAlt>
            {reportData.reason && isMaintainReport && (
              <InputGroup label="Maintain Link" required>
                <Input
                  type="url"
                  value={reportData.maintain_link}
                  className="mb-2 w-full"
                  required
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setReportData((prev) => ({
                      ...prev,
                      maintain_link: e.target.value,
                    }))
                  }
                />
              </InputGroup>
            )}

            <InputGroup label="Additional Information" required>
              <Input
                type="text"
                value={reportData.info}
                className="mb-2 w-full"
                textarea={true}
                rows={4}
                maxLength={280}
                required
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setReportData((prev) => ({
                    ...prev,
                    info: e.target.value,
                  }))
                }
              />
            </InputGroup>
            <Button2
              type="submit"
              className="w-fit self-end py-1"
              disabled={isLoading}
            >
              Submit Report
            </Button2>
          </form>
        </div>
      </div>
    </>
  );
}
