/*
  Design Reference: https://tailwindui.com/components/application-ui/navigation/steps#component-ef491b1515ff05e8cc7429f37bc0fae5
*/

import { useEffect, useRef } from "react";
import { AiFillCheckCircle } from "react-icons/ai";

type ProgressBarProps = {
  steps: string[];
  completed: number;
};

export default function ProgressBar({ steps, completed }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      const stepWidth = barRef.current.scrollWidth / steps.length;
      barRef.current.scrollTo({
        left: stepWidth * completed,
        behavior: "smooth",
      });
    }
  }, [steps, completed]);

  return (
    <div
      ref={barRef}
      className="[&::-webkit-scrollbar]:hidden overflow-x-auto flex flex-wrap-none my-2 rounded-lg border-[3px] border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800"
    >
      {steps.map((title, idx) => (
        <div
          key={idx}
          style={{ width: `${100 / steps.length}%` }}
          className={`overflow-hidden relative isolate min-w-fit progress-bar-border border-0 before:z-[-2] before:absolute before:inset-0 before:bg-gray-200 dark:before:bg-slate-700 after:z-[-1] after:absolute after:inset-0 after:progress-bar-border after:translate-x-[-3px] after:bg-white dark:after:bg-slate-800 last:before:hidden last:after:hidden`}
        >
          <div className="h-full inline-flex items-center gap-2 p-2">
            {idx < completed ? (
              <AiFillCheckCircle className="shrink-0 h-7 sm:h-10 w-7 sm:w-10 text-orange-400" />
            ) : (
              <div
                className={`shrink-0 h-7 sm:h-10 w-7 sm:w-10 flex items-center justify-center rounded-full transition-colors border-2 text-sm sm:text-base font-semibold ${
                  idx == completed
                    ? "text-orange-400 border-orange-400"
                    : "text-gray-400 dark:text-gray-300"
                }`}
              >
                {`${idx + 1}`.padStart(2, "0")}
              </div>
            )}

            <span
              className={`pr-3 transition-colors font-semibold ${
                idx == completed
                  ? "text-orange-400"
                  : idx > completed
                  ? "text-gray-400 dark:text-gray-300"
                  : ""
              }`}
            >
              {title}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
