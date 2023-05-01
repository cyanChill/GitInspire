import Link from "next/link";
import { FaCog } from "react-icons/fa";

import useUserContext from "~hooks/useUserContext";
import useThemeContext from "~hooks/useThemeContext";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import { Button2, ToggleBtn } from "~components/form/Button";

export default function MiscPage() {
  const { isAuthenticated, logout } = useUserContext();
  const { theme, toggleTheme } = useThemeContext();

  return (
    <>
      <SEO pageName="Misc." />
      <div className="animate-load-in">
        <PageHeader
          name="Miscellaneous"
          icon={{ iconEl: FaCog }}
          shadowAccentClr="shadow-teal-500"
        />

        <main className="mt-8 grid grid-cols-[1fr_3.75rem] gap-x-1 gap-y-3 font-sourceCodePro">
          <h2 className="col-span-2 text-xl">General Settings</h2>
          <div>
            <p className="text-sm">Theme</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">
              Choose between light and dark themes.
            </p>
          </div>
          <ToggleBtn
            defaultState={theme === "dark"}
            onToggle={toggleTheme}
            className="self-center"
          />

          {isAuthenticated && (
            <>
              <h2 className="col-span-2 mt-4 text-xl">Support</h2>
              <div>
                <p className="text-sm">Report a Problem</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">
                  Send us a report about anything incorrect you find and
                  we&apos;ll fix it as soon as possible. You can also send a
                  report for any bug fixes or suggestions you may have.
                </p>
              </div>
              <Link
                href="/report"
                className="block w-min self-center rounded-md bg-red-600 p-2 text-xs text-white hover:bg-red-700"
              >
                Report
              </Link>

              <h2 className="col-span-2 mt-4 text-xl">Account</h2>
              <div>
                <p className="text-sm">Logout</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-gray-400">
                  Make sure to sign out of GitInspire if you&apos;re on an
                  unknown device after you&apos;re done.
                </p>
              </div>
              <Button2
                onClick={logout}
                clr={{ bkg: "bg-red-600 hover:bg-red-700", txt: "text-white" }}
                className="w-min self-center !rounded-md !p-2 text-xs"
              >
                Logout
              </Button2>
            </>
          )}
        </main>
      </div>
    </>
  );
}
