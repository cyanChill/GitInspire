import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import GitInspire from "~public/assets/gitinspire.svg";
import Github from "~public/assets/github.svg";
import Button from "~components/form/Button";
import SEO from "~components/layout/SEO";

const GITHUB_AUTH_URL = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL || "";

export default function LoginPage() {
  const { errors, isAuthenticated, redirectIfAuth, authenticateFromCode } =
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
    if (isAuthenticated) redirectIfAuth();
  }, [isAuthenticated]); /* eslint-disable-line */

  useEffect(() => {
    if (errors.errMsg && errors.authErr) toast.error(errors.errMsg);
  }, [errors]);

  return (
    <>
      <SEO pageName="Login" />
      <div className="m-auto grid h-full max-h-96 w-full max-w-xs animate-load-in grid-rows-2 items-center justify-items-center rounded-lg bg-white px-4 py-5 shadow-xl ring-1 ring-slate-900/5 dark:bg-slate-800 sm:px-6 sm:py-8">
        <div className="inline-flex w-full items-center justify-center p-2">
          <GitInspire
            aria-label="GitInspire logo"
            className="max-h-[150px] max-w-[150px]"
          />
        </div>

        {(urlHasCode || isAuthenticated) && !errors.authErr ? (
          <div className="w-full text-center">
            <h3 className="my-4 animate-pulse text-center text-lg font-semibold tracking-tight min-[400px]:text-2xl">
              Logging in with Github
            </h3>
          </div>
        ) : (
          <div className="w-full self-end text-center">
            <Button
              href={GITHUB_AUTH_URL}
              link={true}
              className="w-full !p-4 !py-3"
            >
              Sign In with Github
              <Github
                aria-label="Github logo"
                className="max-h-[24px] shrink-0 max-[275px]:hidden"
              />
            </Button>
            <Button
              onClick={() => {
                sessionStorage.removeItem("redirectPath"); // Clear any redirects
                router.push("/");
              }}
              clr={{ bkg: "", txt: "" }}
              className="mx-auto animate-[load-in_250ms_ease-in-out_300ms_forwards] opacity-0 !shadow-none hover:text-orange-500 hover:underline"
            >
              Return Home
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
