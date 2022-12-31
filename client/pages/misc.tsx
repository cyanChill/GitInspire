import { FaCog } from "react-icons/fa";

import useUserContext from "~hooks/useUserContext";
import useThemeContext from "~hooks/useThemeContext";
import SEO from "~components/layout/SEO";
import PageHeader from "~components/layout/PageHeader";
import Button from "~components/form/Button";

export default function MiscPage() {
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

        <div className="flex flex-col gap-2 mt-8">
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
            <Button
              onClick={logout}
              clr={{
                bkg: "bg-gradient-to-r from-orange-600 hover:from-red-600 to-red-500 hover:to-red-800",
                txt: "text-white",
              }}
            >
              Logout
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
