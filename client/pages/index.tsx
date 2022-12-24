import { Open_Sans } from "@next/font/google";
import { GiRollingDices } from "react-icons/gi";

import SEO from "~components/SEO";
import PageHeader from "~components/PageHeader";
import MultiSelectDropDown from "~components/form/MutliSelDD";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI"],
});

export default function Home() {
  return (
    <>
      <SEO pageName="Home" />

      <div className={`relative rounded-3xl ${openSans.className}`}>
        <PageHeader
          name="Find a Random Repository"
          description="Take a chance and find something new"
          icon={GiRollingDices}
          clr={{
            bkg: "bg-gradient-to-r from-violet-500 dark:from-violet-600 via-purple-500 dark:via-purple-600 to-fuchsia-500 dark:to-fuchsia-600",
            txt: "text-slate-100 dark:text-white",
            txtAcc: "text-gray-100 dark:text-gray-200",
          }}
        />

        <section className="p-4 pt-10 mt-[-1.5rem] rounded-3xl rounded-t-none bg-gray-50 dark:bg-gray-800 shadow-inner shadow-slate-500 dark:shadow-zinc-500">
          <h2 className="text-xl font-semibold mb-2">
            Languages{" "}
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 tracking-wide">
              (Max 3)
            </span>
          </h2>
          <MultiSelectDropDown items={[]} />

          <h2 className="text-xl font-semibold mt-4 mb-2">Star Range</h2>
          <div className="flex flex-col min-[400px]:flex-row gap-4 text-base">
            <div className="overflow-hidden w-fit rounded-md">
              <span className="inline-block w-12 p-2 py-1 text-white bg-cyan-600 ">
                Min
              </span>
              <input
                type="number"
                min={0}
                placeholder="0 (default)"
                className="max-w-[112px] p-2 py-1 text-right bg-slate-100 shadow-inner shadow-neutral-300"
              />
            </div>

            <div className="overflow-hidden w-fit rounded-md">
              <span className="inline-block w-12 p-2 py-1 text-white bg-cyan-600 ">
                Max
              </span>
              <input
                type="number"
                className="max-w-[112px] p-2 py-1 text-right bg-slate-100 shadow-inner shadow-neutral-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-2 text-base">
            <button className="p-2 px-3 text-red-300 rounded-lg font-medium tracking-wide">Reset Filters</button>
            <button className="p-2 px-3 rounded-lg bg-teal-400 hover:bg-teal-500 text-white font-bold tracking-wide shadow-lg">Search</button>
          </div>
        </section>
      </div>
    </>
  );
}
