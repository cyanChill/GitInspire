import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";
import { GoBrowser } from "react-icons/go";

import useAppContext from "~hooks/useAppContext";
import useUserContext from "~hooks/useUserContext";
import { RepositoryObjType, TagObjType } from "~utils/types";
import { fromURLQueryVal, normalizeStr, replaceURLParam } from "~utils/helpers";
import { authFetch } from "~utils/cookies";
import Spinner from "~components/Spinner";
import Input, { InputGroup, InputGroupAlt } from "~components/form/Input";
import Select, { SelectOption } from "~components/form/Select";
import SEO from "~components/layout/SEO";

type RepoUpdateValType = {
  primary_tag: SelectOption | undefined;
  tags: SelectOption[];
  maintain_link?: string;
};

const DEFAULT_NEW_REPO_VALS: RepoUpdateValType = {
  primary_tag: undefined,
  tags: [],
  maintain_link: "",
};

export default function AdminRepositoriesPage() {
  const router = useRouter();
  const { isAdmin, isOwner, redirectIfNotAdmin } = useUserContext();
  const { selOptionFormat } = useAppContext();

  const searchRef = useRef<HTMLInputElement>(null);
  const [currQuery, setCurrQuery] = useState("");

  const [selRepo, setSelRepo] = useState<RepositoryObjType>();
  const [newRepoVals, setNewRepoVals] = useState(DEFAULT_NEW_REPO_VALS);
  const [action, setAction] = useState<"update" | "delete">("update");
  const [isLoading, setIsLoading] = useState(false);

  const tagObjToSelOpt = (tag: TagObjType) => {
    return { label: tag.display_name, value: tag.name } as SelectOption;
  };

  const refreshUpdateVals = (repo: RepositoryObjType) => {
    setNewRepoVals({
      primary_tag: tagObjToSelOpt(repo.primary_tag),
      tags: repo.tags.map((tag) => tagObjToSelOpt(tag)),
      maintain_link: repo.maintain_link || "",
    });
  };

  const searchRepository = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      replaceURLParam(
        router.asPath,
        "repository",
        normalizeStr((e.target as HTMLFormElement).repo_id.value)
      )
    );
  };

  const submitUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selRepo || isLoading) return;

    if (!newRepoVals.primary_tag) {
      toast.error("Repositories must have a primary tag associated with it.");
      return;
    }

    setIsLoading(true);
    const res = await authFetch(`/api/repositories/${selRepo.id}`, {
      method: "PATCH",
      body: JSON.stringify(newRepoVals),
    });

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Succsesfully updated repository.");
      setSelRepo(data.repository);
      refreshUpdateVals(data.repository);
    } catch (err) {
      toast.error("Something unexpected occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const submitDeleteRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selRepo || isLoading) return;

    setIsLoading(true);
    const res = await authFetch(`/api/repositories/${selRepo.id}`, {
      method: "DELETE",
    });

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Succsesfully deleted repository.");
      router.push(replaceURLParam(router.asPath, "repository", ""));
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
    const { repository } = router.query;
    const repoId = fromURLQueryVal.onlyStr(repository);
    setSelRepo(undefined);
    if (!repoId || !isAdmin) return;

    if (searchRef.current) searchRef.current.value = repoId;
    const abort_ctrl = new AbortController();
    setIsLoading(true);
    setCurrQuery(repoId);
    fetch(`/api/repositories/${repoId}`, { signal: abort_ctrl.signal })
      .then((res) => {
        if (!res.ok) {
          toast.error(
            "Something went wrong with finding this repository in our database."
          );
        } else {
          return res.json();
        }
      })
      .then((data) => {
        setSelRepo(data.repository);
        refreshUpdateVals(data.repository);
      })
      .catch((err) => {
        console.log("[FETCH ERROR]", err);
        if (err.name !== "AbortError") {
          // Handle non-AbortError(s)
          toast.error("Something went wrong with fetching results.");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      abort_ctrl.abort();
    };
  }, [router.query, isAdmin, isOwner]);

  if (!isAdmin) {
    return (
      <>
        <SEO pageName="Repository Management" />
        <div className="flex animate-load-in justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageName="Repository Management" />
      <div className="animate-load-in">
        <h1 className="mb-4 text-center text-4xl font-semibold underline">
          Manage Repository
        </h1>

        {/* Search Bar */}
        <form
          className="grid grid-cols-[1fr_min-content]"
          onSubmit={searchRepository}
        >
          <Input
            name="repo_id"
            type="text"
            placeholder="Enter a repository id to get started"
            className="w-full rounded-r-none"
            ref={searchRef}
            required
          />
          <button
            type="submit"
            className="align-center rounded-r-md bg-sky-500 p-1.5 px-3 hover:bg-sky-600"
          >
            <IoSearch className="text-white" />
          </button>
        </form>

        {/* Results */}
        <main className="my-2 animate-load-in">
          {isLoading && <Spinner />}

          {!selRepo && !currQuery && (
            <p className="text-center font-semibold text-red-400">
              Find a repository to get started.
            </p>
          )}

          {!isLoading && !selRepo && currQuery && (
            <p className="text-center font-semibold text-red-400">
              That repository doesn&apos;t exist.
            </p>
          )}

          {/* Repository summary and management tools */}
          {selRepo && (
            <div className="my-4 flex animate-load-in flex-col">
              {/* Repository Info Preview */}
              <div className="flex min-w-0 max-w-full items-center gap-2 self-center rounded-md bg-gray-200 p-1.5 shadow shadow-xl dark:bg-slate-800 dark:shadow-slate-600">
                <GoBrowser className="h-10 w-10 shrink-0 rounded-md bg-orange-500 p-1 text-white" />
                <div className="w-min min-w-0">
                  <a
                    href={selRepo.repo_link}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate font-semibold hover:underline"
                  >
                    {selRepo.author}/{selRepo.repo_name}
                  </a>
                  <p className="flex flex-wrap gap-1 text-xs">
                    {selRepo.languages.map((lang) => (
                      <span
                        key={lang.name}
                        className="rounded-md bg-orange-300 px-1 py-0.5 dark:bg-amber-700"
                      >
                        {lang.display_name}
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {/* Management Options */}
              <div className="flex gap-2 overflow-x-auto font-semibold">
                <button
                  className={
                    action === "update" ? "underline" : "hover:underline"
                  }
                  disabled={action === "update"}
                  onClick={() => setAction("update")}
                >
                  Update
                </button>
                <button
                  className={
                    action === "delete" ? "underline" : "hover:underline"
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
                  <InputGroupAlt label="Primary Tag" required>
                    <Select
                      multiple={false}
                      options={selOptionFormat.primary_tags}
                      value={newRepoVals.primary_tag}
                      onChange={(value: SelectOption | undefined) =>
                        setNewRepoVals((prev) => ({
                          ...prev,
                          primary_tag: value,
                        }))
                      }
                    />
                  </InputGroupAlt>

                  <InputGroupAlt label="Additional Tags (Max 5)">
                    <Select
                      multiple={true}
                      options={selOptionFormat.user_tags}
                      max={5}
                      value={newRepoVals.tags}
                      onChange={(value: SelectOption[]) =>
                        setNewRepoVals((prev) => ({ ...prev, tags: value }))
                      }
                    />
                  </InputGroupAlt>

                  {newRepoVals.primary_tag?.value == "abandoned" && (
                    <InputGroup label="Maintain Link">
                      <Input
                        type="url"
                        value={newRepoVals.maintain_link}
                        placeholder="ie: https://example.com"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setNewRepoVals((prev) => ({
                            ...prev,
                            maintain_link: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </InputGroup>
                  )}

                  <button
                    type="submit"
                    className={`mt-2 self-end font-semibold text-green-500 active:text-green-900 ${
                      isLoading
                        ? "hover:cursor-not-allowed"
                        : "hover:text-green-700 hover:underline"
                    }`}
                    disabled={isLoading}
                  >
                    Update Repository
                  </button>
                </form>
              )}

              {/* Delete Form */}
              {action === "delete" && (
                <form
                  className="my-2 flex animate-load-in flex-col"
                  onSubmit={submitDeleteRequest}
                >
                  <button
                    type="submit"
                    className={`mt-2 self-end font-semibold text-red-500 hover:text-red-700 active:text-red-900 ${
                      isLoading ? "" : "hover:underline"
                    }`}
                    disabled={isLoading}
                  >
                    Delete Repository
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
