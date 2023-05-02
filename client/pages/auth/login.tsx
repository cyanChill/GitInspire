import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import GitInspire from "~public/assets/gitinspire_full.svg";
import Github from "~public/assets/github.svg";
import Button from "~components/form/Button";
import SEO from "~components/layout/SEO";

const GITHUB_AUTH_URL = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL || "";

export default function LoginPage() {
  const { error, isAuthenticated, redirectIfAuth, authenticateFromCode } =
    useUserContext();

  const router = useRouter();
  const [urlHasCode, setUrlHasCode] = useState(false);

  useEffect(() => {
    if (router.asPath.startsWith("/auth/login?code=")) {
      setUrlHasCode(true);
      authenticateFromCode();
    } else {
      setUrlHasCode(false);
    }
  }, []); /* eslint-disable-line */

  // Handle redirect on succesfully authentication
  useEffect(() => {
    redirectIfAuth();
  }, [redirectIfAuth]); /* eslint-disable-line */

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  return (
    <>
      <SEO pageName="Login" />
      <main className="m-auto grid animate-load-in grid-cols-[1fr] gap-x-3 border border-[1px] border-slate-300 bg-white font-sourceCodePro shadow-[5px_5px] shadow-[#eecf68] dark:border-slate-600 dark:bg-stone-950 min-[500px]:grid-cols-[200px_250px]">
        <div className="inline-flex w-full items-center justify-center">
          <GitInspire
            aria-label="GitInspire logo"
            className="w-full min-[500px]:max-h-[200px] min-[500px]:max-w-[200px]"
          />
        </div>

        {(urlHasCode || isAuthenticated) && !error ? (
          <div className="w-full self-center text-center">
            <h3 className="my-4 animate-pulse text-center text-lg font-semibold tracking-tight min-[500px]:m-0 min-[500px]:text-2xl">
              Logging in with Github
            </h3>
          </div>
        ) : (
          <div className="my-2 w-full self-center px-2 text-center min-[500px]:m-0 min-[500px]:pl-0">
            <Button
              href={GITHUB_AUTH_URL}
              link={true}
              clr={{
                bkg: "bg-[#689c96] hover:bg-[#4b726e]",
                txt: "text-white",
              }}
              className="w-full"
            >
              Sign In with Github
              <Github
                aria-label="Github logo"
                className="max-h-[24px] shrink-0 max-[300px]:hidden"
              />
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem("redirectPath"); // Clear any redirects
                router.push("/");
              }}
              clr={{ bkg: "", txt: "" }}
              className="mx-auto animate-[load-in_250ms_ease-in-out_300ms_forwards] text-sm opacity-0 !shadow-none hover:underline"
            >
              Return Home
            </Button>
          </div>
        )}
      </main>
    </>
  );
}
