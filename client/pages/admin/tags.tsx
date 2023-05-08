import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { BsTagFill } from "react-icons/bs";

import useAppContext from "~hooks/useAppContext";
import useUserContext from "~hooks/useUserContext";
import { TagObjType } from "~utils/types";
import { fromURLQueryVal, normalizeStr, replaceURLParam } from "~utils/helpers";
import { authFetch } from "~utils/cookies";
import Spinner from "~components/Loading";
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import Select, { SelectOption } from "~components/form/Select";
import SEO from "~components/layout/SEO";

export default function AdminTagsPage() {
  const router = useRouter();
  const { isAdmin, isOwner, redirectIfNotAdmin } = useUserContext();
  const { tags, selOptionFormat, addTag, removeTag } = useAppContext();

  const searchRef = useRef<HTMLInputElement>(null);
  const updateRef = useRef<HTMLInputElement>(null);
  const [currQuery, setCurrQuery] = useState("");
  const [selTag, setSelTag] = useState<TagObjType>();
  const [replacementTag, setReplacementTag] = useState<SelectOption>();
  const [action, setAction] = useState<"update" | "delete">("update");
  const [isLoading, setIsLoading] = useState(false);

  const searchTag = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      replaceURLParam(
        router.asPath,
        "tag",
        normalizeStr((e.target as HTMLFormElement).tag_name.value)
      )
    );
  };

  const submitUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selTag || isLoading) return;
    const newTagName = (e.target as HTMLFormElement).tag_name.value;
    if (!newTagName) {
      toast.error("You must provide a new tag name in order to update it.");
      return;
    }
    if (newTagName == selTag.display_name) {
      toast.error("Tag name has not been changed.");
      return;
    }

    setIsLoading(true);
    const res = await authFetch("/api/tags", {
      method: "PATCH",
      body: JSON.stringify({
        oldName: selTag.name,
        newDisplayName: newTagName,
      }),
    });

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      addTag(data.tag);
      removeTag(selTag);
      toast.success("Succsesfully updated tag.");
      router.push(
        replaceURLParam(router.asPath, "tag", normalizeStr(newTagName))
      );
    } catch (err) {
      toast.error("Something unexpected occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selTag || isLoading) return;

    if (selTag.type === "primary" && !replacementTag) {
      toast.error("You must select a replacement primary tag.");
      return;
    }
    if (
      selTag.type === "primary" &&
      replacementTag &&
      replacementTag.label == selTag.display_name
    ) {
      toast.error("Replacement tag is the tag to be deleted.");
      return;
    }

    setIsLoading(true);
    const res = await authFetch("/api/tags", {
      method: "PUT",
      body: JSON.stringify({
        oldTagName: selTag.name,
        replacementTagName: replacementTag?.value || "",
      }),
    });

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      removeTag(selTag);
      toast.success("Succsesfully deleted tag.");
      router.push(
        replaceURLParam(router.asPath, "tag", `${replacementTag?.value || ""}`)
      );
      setReplacementTag(undefined);
    } catch (err) {
      toast.error("Something unexpected occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    redirectIfNotAdmin();
  }, [redirectIfNotAdmin]);

  useEffect(() => {
    const { tag } = router.query;
    const tag_val = fromURLQueryVal.onlyStr(tag);
    setSelTag(undefined);
    if (!tag_val || !isAdmin) return;

    setCurrQuery(tag_val);
    if (searchRef.current) searchRef.current.value = tag_val;
    if (updateRef.current) updateRef.current.value = "";
    const queryFrom = isOwner
      ? [...tags.primary, ...tags.user_gen]
      : tags.user_gen;
    setSelTag(queryFrom.find((tg) => tg.name === tag_val));
  }, [router.query, tags, isAdmin, isOwner]);

  if (!isAdmin) {
    return (
      <>
        <SEO pageName="Tag Management" />
        <div className="flex animate-load-in justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageName="Tag Management" />
      <div className="animate-load-in">
        <h1 className="mb-4 text-center text-4xl font-semibold underline">
          Manage Tags
        </h1>

        {/* Search Bar */}
        <form className="grid grid-cols-[1fr_min-content]" onSubmit={searchTag}>
          <Input
            name="tag_name"
            type="text"
            placeholder="Enter a tag to get started"
            className="w-full rounded-r-none"
            ref={searchRef}
            required
          />
          <button
            type="submit"
            className="align-center rounded-r-md bg-sky-500 p-1.5 px-3 hocus:bg-sky-600"
          >
            <IoSearch className="text-white" />
          </button>
        </form>

        {/* Results */}
        <main className="my-2 animate-load-in">
          {!selTag && !currQuery && (
            <p className="text-center font-semibold text-red-400">
              Find a tag to get started.
            </p>
          )}

          {!selTag && currQuery && (
            <p className="text-center font-semibold text-red-400">
              That tag doesn&apos;t exist or you don&apos; have permission to
              edit it.
            </p>
          )}

          {/* Tag summary and management tools */}
          {selTag && (
            <div className="my-4 flex animate-load-in flex-col">
              {/* Tag Info Preview */}
              <div className="flex min-w-0 max-w-full items-center gap-2 self-center rounded-md bg-gray-200 p-1.5 shadow shadow-xl dark:bg-slate-800 dark:shadow-slate-600">
                <BsTagFill className="h-10 w-10 shrink-0 rounded-md bg-sky-500 p-1 text-white" />
                <div className="w-min min-w-0">
                  <p className="truncate font-semibold">
                    {selTag.display_name}
                  </p>
                  <p className="truncate text-xs">({selTag.type})</p>
                </div>
              </div>

              {/* Management Options */}
              <div className="flex gap-2 overflow-x-auto font-semibold">
                <button
                  className={
                    action === "update" ? "underline" : "hocus:underline"
                  }
                  disabled={action === "update"}
                  onClick={() => setAction("update")}
                >
                  Update
                </button>
                <button
                  className={
                    action === "delete" ? "underline" : "hocus:underline"
                  }
                  disabled={action === "delete"}
                  onClick={() => setAction("delete")}
                >
                  Delete
                </button>
              </div>
              {/* Update Form */}
              {action === "update" && (
                <form
                  className="my-2 flex animate-load-in flex-col"
                  onSubmit={submitUpdateRequest}
                >
                  <InputGroup label="New Tag Name:" required>
                    <Input
                      type="text"
                      name="tag_name"
                      className="w-full"
                      maxLength={25}
                      required
                      ref={updateRef}
                    />
                  </InputGroup>

                  <button
                    type="submit"
                    className={`mt-2 self-end font-semibold text-green-500 active:text-green-900 ${
                      isLoading
                        ? "hocus:cursor-not-allowed"
                        : "hocus:text-green-700 hocus:underline"
                    }`}
                    disabled={isLoading}
                  >
                    Update Tag
                  </button>
                </form>
              )}

              {/* Delete Form */}
              {action === "delete" && (
                <form
                  className="my-2 flex animate-load-in flex-col"
                  onSubmit={submitDeleteRequest}
                >
                  {isOwner && selTag.type === "primary" && (
                    <InputGroupAlt label="Replacement Tag:" required>
                      <Select
                        multiple={false}
                        options={selOptionFormat.primary_tags.filter(
                          (tg) => tg.value !== selTag.name
                        )}
                        value={replacementTag}
                        onChange={(val: SelectOption | undefined) =>
                          setReplacementTag(val)
                        }
                      />
                    </InputGroupAlt>
                  )}

                  <button
                    type="submit"
                    className={`mt-2 self-end font-semibold text-red-500 hocus:text-red-700 active:text-red-900 ${
                      isLoading ? "" : "hocus:underline"
                    }`}
                    disabled={isLoading}
                  >
                    Delete Tag
                  </button>
                </form>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
