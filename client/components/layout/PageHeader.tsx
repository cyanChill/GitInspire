/*
  This component is used to help with Search Engine Optimizations (SEO).
*/
import { IconType } from "react-icons";

type PgHdrPropsType = {
  name: string;
  description?: string;
  icon?: { iconEl: IconType };
  shadowAccentClr?: string;
  className?: string;
};

export default function PageHeader({
  name = "",
  description,
  icon,
  shadowAccentClr = "shadow-yellow-400 dark:shadow-yellow-300",
  className = "",
}: PgHdrPropsType) {
  return (
    <header
      className={`border border-[1px] border-slate-300 bg-white p-2 shadow-[5px_5px] dark:border-slate-600 dark:bg-stone-950 ${shadowAccentClr} ${className}`}
    >
      <h1 className="inline-flex items-center justify-center gap-x-2 pt-2">
        {icon && (
          <icon.iconEl className="hidden shrink-0 text-4xl min-[400px]:block" />
        )}{" "}
        <span className="block text-xl font-semibold min-[400px]:text-2xl">
          {name.toUpperCase()}
        </span>
      </h1>
      {description && (
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-50">
          {description}
        </p>
      )}
    </header>
  );
}
