import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import { fromURLQueryVal } from "~utils/helpers";
import Select, { SelectOption } from "~components/form/Select";
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import { Button2 } from "~components/form/Button";

type ReportDataType = {
  type?: SelectOption;
  id?: string;
  reason?: SelectOption;
  additionalInfo?: string;
};

const DEFAULT_REPORT = {
  type: undefined,
  id: "",
  reason: undefined,
  additionalInfo: "",
};

const REPORT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Repository", value: "repository" },
  { label: "Tag", value: "tag" },
  { label: "User", value: "user" },
  { label: "Bug", value: "bug" },
  { label: "Suggestion", value: "suggestion" },
  { label: "Other", value: "other" },
];

const REPORT_REASON_OPTIONS: SelectOption[] = [
  { label: "Abuse/Inappropriate", value: "abuse" },
  { label: "Maintain Link", value: "maintain_link" },
  { label: "Incorrect Information", value: "incorrect_info" },
  { label: "Update Information", value: "update_info" },
  { label: "Other", value: "other" },
];

export default function ReportPage() {
  const router = useRouter();
  const { redirectIfNotAuth } = useUserContext();

  const [reportData, setReportData] = useState<ReportDataType>(DEFAULT_REPORT);
  const [isLoading, setIsLoading] = useState(false);

  const findSelectOption = (arr: SelectOption[], type: string) => {
    return arr.find((opt) => opt.value === type);
  };

  const onReportSubmit = async () => {
    if (!reportData.type) toast.error("A report type must be selected.");
    if (!reportData.reason) toast.error("A report reason must be selected.");

    console.log(reportData);
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
      providedInfo.id = fromURLQueryVal.onlyStr(router.query.id);
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
    <div className="animate-load-in">
      <h1 className="text-2xl font-bold">Report Page</h1>
      <InputGroupAlt label="Report Type" required>
        <Select
          options={REPORT_TYPE_OPTIONS}
          onChange={(value) =>
            setReportData((prev) => ({ ...prev, type: value }))
          }
          value={reportData.type}
        />
      </InputGroupAlt>

      <InputGroup label="Content Id/Name">
        <Input
          type="text"
          value={reportData.id}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setReportData((prev) => ({ ...prev, id: e.target.value }))
          }
        />
      </InputGroup>

      <InputGroupAlt label="Reason" required>
        <Select
          options={REPORT_REASON_OPTIONS}
          onChange={(value) =>
            setReportData((prev) => ({ ...prev, reason: value }))
          }
          value={reportData.reason}
        />
      </InputGroupAlt>

      <InputGroup label="Additional Information">
        <Input
          type="text"
          value={reportData.additionalInfo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setReportData((prev) => ({
              ...prev,
              additionalInfo: e.target.value,
            }))
          }
        />
      </InputGroup>
      <Button2 onClick={onReportSubmit}>Submit Report</Button2>
    </div>
  );
}
