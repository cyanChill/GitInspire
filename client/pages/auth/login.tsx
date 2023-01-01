import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import Repot from "~public/assets/repot.svg";
import Github from "~public/assets/github.svg";
import Button from "~components/form/Button";

const GITHUB_AUTH_URL = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL || "";

export default function LoginPage() {
  const { errors, isAuthenticated, authenticateFromCode } = useUserContext();

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

  useEffect(() => {
    if (isAuthenticated) router.replace("/");
  }, [isAuthenticated]); /* eslint-disable-line */

  useEffect(() => {
    if (errors.errMsg && errors.authErr) {
      toast.error(errors.errMsg);
    }
  }, [errors]);

  return (
    <div className="animate-load-in w-full max-w-xs h-full max-h-96 grid grid-rows-2 justify-items-center items-center px-4 py-5 sm:px-6 sm:py-8 m-auto rounded-lg bg-white dark:bg-slate-800 ring-1 ring-slate-900/5 shadow-xl">
      <div className="w-full inline-flex items-center justify-center p-2">
        <Repot
          aria-label="Repot logo"
          className="max-w-[150px] max-h-[150px]"
        />
      </div>

      {(urlHasCode || isAuthenticated) && !errors.authErr ? (
        <div className="w-full text-center">
          <h3 className="animate-pulse my-4 text-lg min-[400px]:text-2xl font-semibold tracking-tight text-center">
            Logging in with Github
          </h3>
        </div>
      ) : (
        <div className="self-end w-full text-center">
          <Button
            href={GITHUB_AUTH_URL}
            link={true}
            className="w-full !p-4 !py-3"
          >
            Sign In with Github
            <Github
              aria-label="Github logo"
              className="shrink-0 max-[275px]:hidden max-h-[24px]"
            />
          </Button>
          <Button
            onClick={() => router.push("/")}
            clr={{ bkg: "", txt: "" }}
            className="animate-[load-in_250ms_ease-in-out_300ms_forwards] opacity-0 hover:text-orange-500 hover:underline mx-auto !shadow-none"
          >
            Return Home
          </Button>
        </div>
      )}
    </div>
  );
}
