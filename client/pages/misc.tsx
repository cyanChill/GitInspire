import { FaCog } from "react-icons/fa";
import { useRouter } from "next/router";

import useUserContext from "~hooks/useUserContext";
import useThemeContext from "~hooks/useThemeContext";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import Button, { Button2 } from "~components/form/Button";

export default function MiscPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useUserContext();
  const { toggleTheme } = useThemeContext();

  return (
    <>
      <SEO pageName="Misc." />
      <div className="animate-load-in">
        <PageHeader
          name="Miscellaneous"
          icon={{ iconEl: FaCog }}
          clr={{
            bkg: "bg-gradient-to-r from-teal-700 to-cyan-800",
            txt: "text-slate-100",
            txtAcc: "text-gray-100",
          }}
          className="dark:!shadow-slate-800"
        />

        <div className="mt-8 flex flex-col gap-2">
          <Button
            onClick={toggleTheme}
            clr={{
              bkg: "bg-gradient-to-r from-cyan-500 hover:from-sky-500 to-blue-500 hover:to-indigo-500",
              txt: "text-white",
            }}
          >
            Toggle Theme
          </Button>

          {isAuthenticated && (
            <>
              <Button2
                onClick={() => router.push("/report")}
                className="!py-1.5"
              >
                Report or Suggest Something
              </Button2>
              <Button
                onClick={logout}
                clr={{
                  bkg: "bg-gradient-to-r from-orange-600 hover:from-red-600 to-red-500 hover:to-red-800",
                  txt: "text-white",
                }}
              >
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
