import React, { useState, useRef, useCallback } from "react";
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
  options: SelectOption[]; // Assume is sorted
} & (SingleSelectProps | MultiSelectProps);

export default function Select({
  multiple,
  value,
  max,
  onChange,
  options,
}: SelectProps) {
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

  const handleKeyAction = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // ALlow clicking "Tab" to work as expected for accessibility
    if (e.code === "Tab") return;

    e.preventDefault();
    // Open list when in focused
    if (["Enter", "Space"].includes(e.code)) {
      setIsOpen((prev) => !prev);
      if (isOpen) selOption(options[highlightedIdx]);
    }
    // Moving up & down through the list
    if (["ArrowUp", "ArrowDown"].includes(e.code)) {
      if (!isOpen) setIsOpen(true);
      // Keeping index in check (don't go beyond)
      const newVal = highlightedIdx + (e.code === "ArrowDown" ? 1 : -1);
      if (newVal >= 0 && newVal < options.length) setHighlightedIdx(newVal);
      optRef.current?.scrollTo({ top: newVal * 32 });
    }
    // Go to first entry with character in list of avaliable options
    if (/[a-zA-Z]/.test(e.key)) {
      if (!isOpen) return; // Ignore if menu isn't open

      const optionIdx = options.findIndex((opt) =>
        opt.label.toLowerCase().startsWith(e.key.toLowerCase())
      );
      if (optionIdx !== -1) {
        setHighlightedIdx(optionIdx);
        optRef.current?.scrollTo({ top: optionIdx * 32 });
      }
    }

    // Leave selection menu
    if (e.code === "Escape") setIsOpen(false);
  };

  const baseClasses = "w-full bg-transparent text-xs";

  return (
    <div
      tabIndex={0}
      onClick={() => setIsOpen((prev) => !prev)}
      onBlur={() => setIsOpen(false)}
      onKeyDown={handleKeyAction}
      className={`relative flex min-h-[2rem] items-center justify-between gap-x-1 p-1 ${baseClasses} border-b-[1px] border-slate-400 hocus:cursor-pointer`}
    >
      {/* Displaying selected items */}
      <span className="flex flex-wrap gap-2 overflow-hidden">
        {!multiple ? (
          <span className="truncate">{value?.label || ""}</span>
        ) : (
          value.map((v) => (
            <button
              type="button"
              key={v.value}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                selOption(v);
              }}
              className="group inline-flex items-center gap-2 truncate rounded-md bg-slate-200 p-2 py-0.5 hocus:bg-slate-300 dark:bg-slate-600 dark:hocus:bg-slate-500"
            >
              <span className="truncate">{v.label}</span>
              <FiX className="shrink-0 group-hocus:text-red-500 group-hocus:text-red-500" />
            </button>
          ))
        )}
      </span>
      {/* Controls (clear selection, open drop down) */}
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          onKeyDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            clearOptions();
          }}
          className={`${
            (multiple ? value.length === 0 : !value) ? "hidden" : ""
          } hocus:text-red-500 hocus:text-red-500`}
        >
          <FiX />
        </button>
        <span className="w-0.5 self-stretch bg-slate-500 dark:bg-zinc-400" />
        <FiChevronDown />
      </div>
      {/* Selection menu (list of options) */}
      <div
        className={`${
          isOpen ? "visible" : "hidden"
        } absolute left-0 top-[calc(100%+2px)] z-[1] w-full`}
      >
        <ul
          className={`max-h-40 overflow-y-auto ${baseClasses} bg-zinc-50 dark:bg-slate-700`}
          ref={optRef}
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
        {/* Spacer at end of list */}
        <div className="h-2" />
      </div>
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
    ? "bg-slate-200 dark:bg-slate-500"
    : isSel
    ? "bg-slate-100 dark:bg-slate-600"
    : "";

  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseIn}
      className={`group flex w-full items-center justify-between p-3 py-2 ${condClass}`}
    >
      {label}
      {isSel && (isHov ? <FiX className="text-red-500" /> : <FiCheck />)}
    </li>
  );
};
