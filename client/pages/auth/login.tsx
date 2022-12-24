import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Lato } from "@next/font/google";
import toast from "react-hot-toast";

import useUserContext from "~hooks/useUserContext";
import Repot from "~public/assets/repot.svg";
import Github from "~public/assets/github.svg";
import Preloadercomp from "~components/PreloaderComp";

const GITHUB_AUTH_URL = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL;
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});

export default function LoginPage() {
  const { errors, isLoading, isAuthenticated, authenticateFromCode } =
    useUserContext();

  const router = useRouter();
  const [urlHasCode, setUrlHasCode] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/");

    if (router.asPath.startsWith("/auth/login?code=")) setUrlHasCode(true);
    else setUrlHasCode(false);

    authenticateFromCode();
  }, []); /* eslint-disable-line */

  useEffect(() => {
    if (errors.errMsg && errors.authErr) {
      toast.error(errors.errMsg);
    }
  }, [errors]);

  if (isLoading || isAuthenticated) {
    return <Preloadercomp />;
  }

  const btnBase = `w-full inline-flex justify-center items-center gap-2 px-4 py-3 my-2 ${lato.variable} font-sans text-base font-medium tracking-tight rounded-md`;
  const btnClasses = `${btnBase} hover:text-white bg-amber-500 hover:bg-amber-600 dark:bg-orange-500 hover:dark:bg-orange-600`;

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
          <a href={GITHUB_AUTH_URL} className={`${btnClasses}`}>
            Sign In with Github
            <Github
              aria-label="Github logo"
              className="shrink-0 max-[275px]:hidden max-h-[24px]"
            />
          </a>
          <button
            onClick={() => router.push("/")}
            className={`animate-[load-in_250ms_ease-in-out_300ms_forwards] ${btnBase} opacity-0 hover:text-orange-500 hover:underline`}
          >
            Return Home
          </button>
        </div>
      )}
    </div>
  );
}
