/*
  This component is used to help with Search Engine Optimizations (SEO).
*/
import { IconType } from "react-icons";

interface PgHdrProps {
  name: string;
  description?: string;
  icon?: { iconEl: IconType };
  clr?: { bkg: string; txt: string; txtAcc: string };
  className?: string;
}

export default function PageHeader({
  name,
  description,
  icon,
  clr = {
    bkg: "bg-white dark:bg-slate-800",
    txt: "text-slate-900 dark:text-white",
    txtAcc: "text-slate-500 dark:text-zinc-300",
  },
  className,
  ...rest
}: PgHdrProps) {
  return (
    <header
      className={`z-10 relative w-full inline-flex flex-col justify-center items-center  p-4 py-6 rounded-3xl text-center shadow-xl shadow-neutral-300 dark:shadow-slate-700 ${clr.txt} ${clr.bkg} ${className}`}
      {...rest}
    >
      <h1 className="inline-flex justify-center items-center gap-x-6">
        {icon && (
          <icon.iconEl className="hidden min-[400px]:block shrink-0 text-5xl" />
        )}{" "}
        <span className="text-2xl min-[400px]:text-3xl lg:text-4xl font-bold">
          {name}
        </span>
      </h1>
      {description && (
        <p
          className={`max-w-md mt-3 text-xs min-[400px]:text-sm italic ${clr.txtAcc}`}
        >
          {description}
        </p>
      )}
    </header>
  );
}
