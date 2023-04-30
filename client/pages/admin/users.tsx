import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import toast from "react-hot-toast";
import { IoSearch } from "react-icons/io5";

import useUserContext from "~hooks/useUserContext";
import { UserObjType } from "~utils/types";
import { fromURLQueryVal, replaceURLParam, normalizeStr } from "~utils/helpers";
import { authFetch } from "~utils/cookies";
import Spinner from "~components/Spinner";
import Input, { InputGroup } from "~components/form/Input";
import SEO from "~components/layout/SEO";

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin, isOwner, redirectIfNotAdmin } = useUserContext();

  const searchRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState<"update" | "list">("update");

  const [selUser, setSelUser] = useState<UserObjType>();
  const [bannedUsers, setBannedUsers] = useState<UserObjType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchUser = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      replaceURLParam(
        router.asPath,
        "user",
        normalizeStr((e.target as HTMLFormElement).user_id.value)
      )
    );
  };

  const submitUpdateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selUser || isLoading) return;

    const target = e.target as HTMLFormElement;
    if (!target.account_status) {
      toast.error("User must have an account status associated with it.");
      return;
    }

    const acc_status = target.account_status.value;

    setIsLoading(true);
    const res = await authFetch(`/api/users/${selUser.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        account_status: acc_status,
        ban_reason: target.ban_reason.value,
      }),
    });

    try {
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message);
        return;
      }
      toast.success("Succsesfully updated user.");
      setSelUser(data.user);

      if (acc_status === "banned") {
        setBannedUsers((prev) => {
          const withoutUsr = prev.filter((usr) => usr.id !== selUser.id);
          return [...withoutUsr, data.user];
        });
      } else {
        setBannedUsers((prev) => prev.filter((usr) => usr.id !== selUser.id));
      }
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
    if (!isAdmin) return;

    const abort_ctrl = new AbortController();
    authFetch(`/api/users/banned`, { signal: abort_ctrl.signal })
      .then((res) => {
        if (!res.ok) toast.error("Failed to fetch banned users.");
        else return res.json();
      })
      .then((data) => setBannedUsers(data.users))
      .catch((err) => {
        console.log("[FETCH ERROR]", err);
        if (err.name !== "AbortError") {
          // Handle non-AbortError(s)
          toast.error("Something went wrong with fetching results.");
        }
      });

    return () => {
      abort_ctrl.abort();
    };
  }, [isAdmin]);

  useEffect(() => {
    const { user } = router.query;
    const userId = fromURLQueryVal.onlyStr(user);
    setSelUser(undefined);
    setTab("update");
    if (!userId || !isAdmin) return;

    const abort_ctrl = new AbortController();
    setIsLoading(true);
    authFetch(`/api/users/${userId}`, { signal: abort_ctrl.signal })
      .then((res) => {
        if (!res.ok) {
          toast.error(
            "Something went wrong with finding this user in our database."
          );
        } else {
          return res.json();
        }
      })
      .then((data) => setSelUser(data.user))
      .catch((err) => {
        console.log("[FETCH ERROR]", err);
        if (err.name !== "AbortError") {
          // Handle non-AbortError(s)
          toast.error("Something went wrong with fetching results.");
        }
      })
      .finally(() => setIsLoading(false));

    return () => {
      abort_ctrl.abort();
    };
  }, [router.query, isAdmin, isOwner]);

  if (!isAdmin || isLoading) {
    return (
      <>
        <SEO pageName="User Management" />
        <div className="flexanimate-load-in justify-center">
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <SEO pageName="User Management" />
      <div className="animate-load-in">
        <h1 className="mb-4 text-center text-4xl font-semibold underline">
          Manage Users
        </h1>

        {/* Tabs Options */}
        <div className="flex gap-2 overflow-x-auto font-semibold">
          <button
            className={tab === "update" ? "underline" : "hover:underline"}
            disabled={tab === "update"}
            onClick={() => setTab("update")}
          >
            Update
          </button>
          <button
            className={tab === "list" ? "underline" : "hover:underline"}
            disabled={tab === "list"}
            onClick={() => setTab("list")}
          >
            List
          </button>
        </div>

        {/* Tab list for updating a user's status */}
        {tab === "update" && (
          <main>
            {/* Search Bar */}
            <form
              className="my-2 grid grid-cols-[1fr_min-content]"
              onSubmit={searchUser}
            >
              <Input
                name="user_id"
                type="text"
                placeholder="Enter a user id to get started"
                className="w-full rounded-r-none"
                defaultValue={selUser?.id || ""}
                ref={searchRef}
                required
                disabled={isLoading}
              />
              <button
                type="submit"
                className="align-center rounded-r-md bg-sky-500 p-1.5 px-3 hover:bg-sky-600"
              >
                <IoSearch className="text-white" />
              </button>
            </form>

            {/* Display found user */}
            {selUser && (
              <article className="mt-4 flex flex-col">
                {/* User Preview */}
                <div className="shadow-l flex min-w-0 max-w-full items-center gap-2 self-center rounded-md bg-gray-200 p-1.5 shadow dark:bg-slate-800 dark:shadow-slate-600">
                  <Image
                    src={selUser?.avatar_url ?? "/assets/default_avatar.png"}
                    alt={`${selUser?.username} profile picture`}
                    width={24}
                    height={24}
                    className="h-10 w-10 shrink-0 rounded-md p-1 text-white"
                  />
                  <p className="truncate font-semibold">{selUser.username}</p>
                </div>

                {/* Update Form */}
                <form
                  className="my-2 flex animate-load-in flex-col"
                  onSubmit={submitUpdateRequest}
                >
                  <InputGroup
                    label="Account Status"
                    className="mt-3"
                    required={true}
                  >
                    <select
                      name="account_status"
                      defaultValue={selUser.account_status}
                      required
                      className="w-full rounded-md bg-zinc-50 p-1.5 shadow-[inset_0_0_2px_0_rgba(0,0,0,0.5)] shadow-slate-400 hover:cursor-pointer dark:bg-slate-700 dark:shadow-slate-600"
                    >
                      <option value="user">User</option>
                      <option value="banned">Banned</option>
                      {isOwner && <option value="admin">Admin</option>}
                    </select>
                  </InputGroup>

                  <InputGroup label="Ban Reason" className="mt-3">
                    <Input
                      name="ban_reason"
                      type="text"
                      className="w-full"
                      defaultValue={selUser?.ban_reason || ""}
                      disabled={isLoading}
                    />
                  </InputGroup>

                  <button
                    type="submit"
                    className={`mt-2 self-end font-semibold text-green-500 active:text-green-900 ${
                      isLoading
                        ? "hover:cursor-not-allowed"
                        : "hover:text-green-700 hover:underline"
                    }`}
                    disabled={isLoading}
                  >
                    Update User
                  </button>
                </form>
              </article>
            )}
          </main>
        )}

        {/* Tab for list of banned users */}
        {tab === "list" && (
          <main>
            <h2 className="my-2 text-xl font-semibold underline">
              Banned Users:
            </h2>
            {bannedUsers.length === 0 && (
              <p className="italic">No banned users found.</p>
            )}
            {bannedUsers.length > 0 && (
              <ul className="flex flex-col gap-y-1">
                {bannedUsers.map((usr) => (
                  <li key={usr.id}>
                    {usr.username} ({usr.id}) - &quot;{usr.ban_reason}&quot;
                  </li>
                ))}
              </ul>
            )}
          </main>
        )}
      </div>
    </>
  );
}
