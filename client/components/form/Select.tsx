import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const optRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);

  const optionSelected = useCallback(
    (o: SelectOption) => (multiple ? value.includes(o) : value === o),
    [multiple, value]
  );

  const clearOptions = () => (multiple ? onChange([]) : onChange(undefined));

  const selOption = useCallback(
    (opt: SelectOption) => {
      if (optionSelected(opt)) {
        multiple
          ? onChange(value.filter((o) => o !== opt))
          : onChange(undefined);
      } else {
        if (!multiple) onChange(opt);
        else {
          // Check to see if there's a similar "invalid object" in the value
          // list and replace that value if it does
          const filteredVals = value.filter((o) => o.value !== opt.value);
          if (filteredVals.length !== max) onChange([...filteredVals, opt]);
        }
      }
    },
    [max, multiple, onChange, value, optionSelected]
  );

  useEffect(() => {
    const handleKeyAction = (e: KeyboardEvent) => {
      if (e.target !== containerRef.current) return;
      // Open list when in focused
      if (["Enter", "Space"].includes(e.code)) {
        setIsOpen((prev) => !prev);
        if (isOpen) selOption(options[highlightedIdx]);
      }
      // Moving up & down through the list
      if (["ArrowUp", "ArrowDown"].includes(e.code)) {
        if (!isOpen) setIsOpen(true);
        // Keeping index in check (don't go beyond)
        const scalar = e.code === "ArrowDown" ? 1 : -1;
        const newVal = highlightedIdx + scalar;
        if (newVal >= 0 && newVal < options.length) setHighlightedIdx(newVal);
        optRef.current?.scrollBy({ top: scalar * 40 });
      }
      // Leave selection menu
      if (e.code === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyAction);

    return () => {
      window.removeEventListener("keydown", handleKeyAction);
    };
  }, [highlightedIdx, isOpen, options, selOption]);

  const baseClasses =
    "w-full rounded-md bg-slate-100 dark:bg-slate-700 shadow-[inset_0_0_4px_0_rgba(0,0,0,0.5)] shadow-slate-300 dark:shadow-slate-600";

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onClick={() => setIsOpen((prev) => !prev)}
      onBlur={() => setIsOpen(false)}
      className={`relative flex justify-between items-center gap-x-1 min-h-[2.5rem] p-1.5 ${baseClasses} hover:cursor-pointer`}
    >
      {/* Displaying selected items */}
      <span className="flex flex-wrap gap-2 overflow-hidden">
        {!multiple ? (
          <span className="truncate">{value?.label || ""}</span>
        ) : (
          value.map((v) => (
            <button
              key={v.value}
              onClick={(e) => {
                e.stopPropagation();
                selOption(v);
              }}
              className="truncate group inline-flex items-center gap-2 p-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500"
            >
              <span className="truncate">{v.label}</span>
              <FiX className="shrink-0 group-hover:text-red-500 group-focus:text-red-500" />
            </button>
          ))
        )}
      </span>
      {/* Controls (clear selection, open drop down) */}
      <div className="shrink-0 flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearOptions();
          }}
          className={`${
            (multiple ? value.length === 0 : !value) ? "hidden" : ""
          } hover:text-red-500 focus:text-red-500`}
        >
          <FiX />
        </button>
        <span className="w-0.5 self-stretch bg-slate-500 dark:bg-zinc-400" />
        <FiChevronDown />
      </div>
      {/* Selection menu (list of options) */}
      <ul
        ref={optRef}
        className={`${
          isOpen ? "visible" : "hidden"
        } overflow-y-auto absolute left-0 top-[calc(100%+1rem)] max-h-48 ${baseClasses}`}
      >
        {options.map((o, idx) => (
          <OptItem
            key={o.value}
            label={o.label}
            isSel={optionSelected(o)}
            isHov={highlightedIdx === idx}
            onClick={(e) => {
              e.stopPropagation();
              selOption(o);
              setIsOpen(false);
            }}
            onMouseIn={() => setHighlightedIdx(idx)}
          />
        ))}
      </ul>
    </div>
  );
}

interface OptItemProps {
  label: string;
  isSel: boolean;
  isHov: boolean;
  onClick: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  onMouseIn: () => void;
}

const OptItem = ({ label, isSel, isHov, onClick, onMouseIn }: OptItemProps) => {
  const condClass = isHov
    ? "bg-slate-300 dark:bg-slate-500"
    : isSel
    ? "bg-slate-200 dark:bg-slate-600"
    : "";

  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseIn}
      className={`group flex justify-between items-center w-full p-3 py-2 hover:bg-slate-300 dark:hover:bg-slate-500 ${condClass}`}
    >
      {label}
      {isSel && (isHov ? <FiX className="text-red-500" /> : <FiCheck />)}
    </li>
  );
};
