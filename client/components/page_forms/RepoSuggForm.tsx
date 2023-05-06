import useAppContext from "~hooks/useAppContext";
import Select, { SelectOption } from "~components/form/Select";
import Input, { InputGroup } from "~components/form/Input";
import { SubmissionFormWrapper } from "./ContributeFormWrapper";

type RepoSuggFormData = {
  author: string;
  repo_name: string;
  primary_tag: SelectOption | undefined;
  add_tags: SelectOption[];
};

type RepoSuggFormProps = {
  updateFields: (fields: Partial<RepoSuggFormData>) => void;
} & RepoSuggFormData;

export default function RepoSuggForm({
  author,
  repo_name,
  primary_tag,
  add_tags,
  updateFields,
}: RepoSuggFormProps) {
  const { selOptionFormat } = useAppContext();

  return (
    <SubmissionFormWrapper variant="Repository">
      <div className="flex-1 py-6 sm:py-8">
        <InputGroup
          label="Repository Author"
          className="!text-xs"
          required={true}
        >
          <Input
            type="text"
            required
            value={author}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFields({ author: e.target.value })
            }
            className="min-h-[2rem] w-full"
          />
        </InputGroup>

        <InputGroup
          label="Repository Name"
          className="mt-3 !text-xs"
          required={true}
        >
          <Input
            type="text"
            required
            value={repo_name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFields({ repo_name: e.target.value })
            }
            className="min-h-[2rem] w-full"
          />
        </InputGroup>

        <p className="mb-1 mt-3 text-xs font-semibold tracking-wide">
          Primary Tag{" "}
          <span className="text-red-500 dark:text-red-400">*Required</span>
        </p>
        <Select
          multiple={false}
          options={selOptionFormat.primary_tags}
          value={primary_tag}
          onChange={(value: SelectOption | undefined) => {
            updateFields({ primary_tag: value });
          }}
        />

        <p className="mb-1 mt-3 text-xs font-semibold tracking-wide">
          Additional Tags{" "}
          <span className="text-gray-600 dark:text-gray-400">(Max 5)</span>
        </p>
        <Select
          multiple={true}
          options={selOptionFormat.user_tags}
          max={5}
          value={add_tags}
          onChange={(value: SelectOption[]) => {
            updateFields({ add_tags: value });
          }}
        />
      </div>
    </SubmissionFormWrapper>
  );
}
