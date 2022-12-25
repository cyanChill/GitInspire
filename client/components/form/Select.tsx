import { useState, useEffect, useRef, useCallback } from "react";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";

export type SelectOption = {
  label: string; // What we display
  value: string | number;
};

type SingleSelectProps = {
  multiple?: false;
  max?: 1;
  value?: SelectOption;
  onChange: (value: SelectOption | undefined) => void;
};

type MultiSelectProps = {
  multiple: true;
  max: number;
  value: SelectOption[];
  onChange: (value: SelectOption[]) => void;
};

type SelectProps = {
  options: SelectOption[];
} & (SingleSelectProps | MultiSelectProps);

export default function Select({
  multiple,
  value,
  max,
  onChange,
  options,
}: SelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const clearOptions = () => {
    multiple ? onChange([]) : onChange(undefined);
  };

  const selectOption = useCallback(
    (option: SelectOption) => {
      const prevSelected = multiple ? value.includes(option) : value == option;

      if (prevSelected) {
        multiple
          ? onChange(value.filter((o) => o !== option))
          : onChange(undefined);
      } else {
        if (!multiple) onChange(option);
        else {
          if (value.length === max) return;
          else onChange([...value, option]);
        }
      }
    },
    [max, multiple, onChange, value]
  );

  const optionSelected = (o: SelectOption) =>
    multiple ? value.includes(o) : value === o;

  useEffect(() => {
    const handleKeyAction = (e: KeyboardEvent) => {
      if (e.target !== containerRef.current) return;
      // Open list when in focused
      if (["Enter", "Space"].includes(e.code)) {
        setIsOpen((prev) => !prev);
        if (isOpen) selectOption(options[highlightedIdx]);
      }
      // Moving up & down through the list
      if (["ArrowUp", "ArrowDown"].includes(e.code)) {
        if (!isOpen) setIsOpen(true);
        // Keeping index in check (don't go beyond)
        const newVal = highlightedIdx + (e.code === "ArrowDown" ? 1 : -1);
        if (newVal >= 0 && newVal < options.length) {
          setHighlightedIdx(newVal);
        }
        selectionRef.current?.scrollTo({
          top: newVal * 36,
          left: 0,
          behavior: "smooth",
        });
      }
      // Leave selection menu
      if (e.code === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyAction);

    return () => {
      window.removeEventListener("keydown", handleKeyAction);
    };
  }, [highlightedIdx, isOpen, options, selectOption]);

  const baseClasses =
    "w-full rounded-md bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-[inset_0_0_8px_0_rgba(0,0,0,0.5)] shadow-slate-300 dark:shadow-slate-600";

  return (
    <div
      ref={containerRef}
      className={`relative flex justify-between items-center min-h-[3.25rem] p-2 ${baseClasses} hover:cursor-pointer`}
      tabIndex={0}
      onClick={() => setIsOpen((prev) => !prev)}
      onBlur={() => setIsOpen(false)}
    >
      <span className="flex flex-wrap gap-2">
        {!multiple ? (
          <>{value?.label || ""}</>
        ) : (
          value.map((v) => (
            <button
              key={v.value}
              className="group inline-flex items-center gap-2 p-2 py-1 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
              onClick={(e) => {
                e.stopPropagation();
                selectOption(v);
              }}
            >
              {v.label} <FiX className="group-hover:text-red-500" />
            </button>
          ))
        )}
      </span>

      <div className="shrink-0 flex gap-1 text-lg">
        <button
          className="hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            clearOptions();
          }}
        >
          <FiX />
        </button>
        <span className="w-0.5 self-stretch bg-slate-900 dark:bg-white" />
        <FiChevronDown />
      </div>

      <ul
        ref={selectionRef}
        className={`${
          isOpen ? "visible" : "hidden"
        } overflow-y-auto absolute left-0 top-[calc(100%+1rem)] max-h-56 ${baseClasses}`}
      >
        {options.map((o, idx) => {
          const isSelected = optionSelected(o);
          const isHighlighted = highlightedIdx === idx;

          return (
            <li
              key={o.value}
              onClick={() => selectOption(o)}
              onMouseEnter={() => setHighlightedIdx(idx)}
              className={`group flex justify-between items-center w-full p-2 px-4 hover:bg-slate-300 dark:hover:bg-slate-500 ${
                isHighlighted
                  ? "bg-slate-300 dark:bg-slate-500"
                  : isSelected
                  ? "bg-slate-200 dark:bg-slate-600"
                  : ""
              }`}
            >
              {o.label}

              {isSelected && (
                <>
                  <FiCheck
                    className={isHighlighted ? "hidden" : "group-hover:hidden"}
                  />
                  <FiX
                    className={`text-red-500 ${
                      isHighlighted ? "block" : "hidden group-hover:block "
                    }`}
                  />
                </>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
