import useUserContext from "~hooks/useUserContext";
import Input, { InputGroup } from "~components/form/Input";
import { SubmissionFormWrapper } from "./ContributeFormWrapper";

type tgType = { label: string; value: "primary" | "user_gen" };

const tagTypes: tgType[] = [
  { label: "User_Gen", value: "user_gen" },
  { label: "Primary", value: "primary" },
];

type TagSuggFormData = {
  new_tag_name: string;
  new_tag_type: "user_gen" | "primary";
};

type TagSuggFormProps = {
  updateFields: (fields: Partial<TagSuggFormData>) => void;
} & TagSuggFormData;

export default function TagSuggForm({
  new_tag_name,
  new_tag_type,
  updateFields,
}: TagSuggFormProps) {
  const { isOwner } = useUserContext();

  return (
    <SubmissionFormWrapper variant="Tag" bdrClr="border-orange-p-600">
      <div className="flex-1 py-6 sm:py-8">
        <InputGroup label="New Tag Name" className="!text-xs" required={true}>
          <Input
            type="text"
            required
            value={new_tag_name}
            maxLength={25}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              updateFields({ new_tag_name: e.target.value })
            }
            className="min-h-[2rem] w-full"
          />
        </InputGroup>

        {isOwner && (
          <InputGroup
            label="Tag Type"
            className="mt-3 !text-xs"
            required={true}
          >
            <>
              {tagTypes.map((tg) => {
                return (
                  <div
                    key={tg.value}
                    onClick={() => updateFields({ new_tag_type: tg.value })}
                  >
                    <Input
                      type="radio"
                      name="tag_type"
                      value={tg.value}
                      checked={tg.value === new_tag_type}
                      onChange={() => updateFields({ new_tag_type: tg.value })}
                      className="hover:cursor-pointer"
                    />
                    <label className="ml-2 text-xs hover:cursor-pointer">
                      {tg.label}
                    </label>
                    <br />
                  </div>
                );
              })}
            </>
          </InputGroup>
        )}
      </div>
    </SubmissionFormWrapper>
  );
}
