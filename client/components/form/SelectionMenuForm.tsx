/*
  Design Reference: https://tailwindui.com/components/application-ui/feedback/empty-states#component-fdd158a00f60e3f9cdf9415b5835e139
*/
import { MdKeyboardArrowRight } from "react-icons/md";

export type SelectMenuOption = {
  title: string;
  description: string;
  value: string;
  icon: JSX.Element;
  bkgClr: string;
};

type SelectionMenuFormType = {
  title: string;
  description: string;
  options: SelectMenuOption[];
  selectOption: (value: string) => void;
  className?: string;
};

export default function SelectionMenuForm({
  title,
  description,
  options,
  selectOption,
  className,
}: SelectionMenuFormType) {
  return (
    <div className={className}>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm mt-2">{description}</p>

      <ul className="mt-7 border-y-2 border-gray-200 dark:border-slate-700">
        {options.map((opt, idx) => (
          <li
            key={idx}
            className="group hover:cursor-pointer flex gap-2 py-4 border-b-[1px] border-gray-200 dark:border-slate-700 last:border-0"
            onClick={() => selectOption(opt.value)}
          >
            <div className={`shrink-0 p-2 rounded-lg ${opt.bkgClr} text-3xl text-white`}>
              {opt.icon}
            </div>
            
            <div className="min-w-0">
              <p className="truncate flex items-center gap-1 font-semibold">
                {opt.title}
              </p>
              <p className="truncate text-sm">{opt.description}</p>
            </div>

            <MdKeyboardArrowRight className="shrink-0 self-center ml-auto text-3xl text-gray-300 group-hover:text-gray-400 dark:text-slate-700 group-hover:dark:text-slate-500" />
          </li>
        ))}
      </ul>
    </div>
  );
}
