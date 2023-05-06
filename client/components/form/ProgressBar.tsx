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
      className="flex-wrap-none my-2 flex overflow-x-auto rounded-md border-2 border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800 [&::-webkit-scrollbar]:hidden"
    >
      {steps.map((title, idx) => (
        <div
          key={idx}
          style={{ width: `${100 / steps.length}%` }}
          className={`progress-bar-border after:progress-bar-border relative isolate min-w-fit overflow-hidden border-0 before:absolute before:inset-0 before:z-[-2] before:bg-gray-200 after:absolute after:inset-0 after:z-[-1] after:translate-x-[-3px] after:bg-white last:before:hidden last:after:hidden dark:before:bg-slate-700 dark:after:bg-slate-800`}
        >
          <div className="inline-flex h-full items-center gap-2 p-2">
            {idx < completed ? (
              <AiFillCheckCircle className="h-7 w-7 shrink-0 text-orange-p-600 sm:h-8 sm:w-8" />
            ) : (
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors sm:h-8 sm:w-8 ${
                  idx == completed
                    ? "border-orange-p-600 text-orange-p-600"
                    : "text-gray-400 dark:text-gray-300"
                }`}
              >
                {`${idx + 1}`.padStart(2, "0")}
              </div>
            )}

            <span
              className={`pr-3 text-sm font-semibold transition-colors ${
                idx == completed
                  ? "text-orange-p-600"
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
