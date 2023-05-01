import { useState, useEffect } from "react";

type BtnProps = {
  link?: false;
};

type LinkBtnProps = {
  link: true;
  href: string;
};

type ButtonProps = {
  clr?: { bkg: string; txt: string };
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
} & (LinkBtnProps | BtnProps);

const DEFAULT_COLORS = {
  bkg: "bg-gradient-to-r from-amber-500 enabled:hover:from-amber-600 to-orange-500 enabled:hover:to-orange-600 disabled:opacity-25",
  txt: "text-white",
};

export default function Button({
  link,
  href,
  clr = DEFAULT_COLORS,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const btnStyles = `flex justify-center items-center gap-2 p-3 py-1.5 my-2 font-medium tracking-tight rounded-md shadow-lg ${clr.bkg} ${clr.txt} ${className}`;

  if (link) {
    return (
      <a href={href} className={btnStyles}>
        {children}
      </a>
    );
  } else {
    return (
      <button className={btnStyles} {...rest}>
        {children}
      </button>
    );
  }
}

const DEFAULT_COLORS2 = {
  bkg: "bg-violet-500 enabled:hover:bg-violet-600 disabled:opacity-25",
  txt: "text-white",
};

export function Button2({
  link,
  href,
  clr = DEFAULT_COLORS2,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const btnStyles = `flex justify-center items-center gap-2 p-3 py-0.5 font-medium tracking-tight rounded-full shadow-lg ${clr.bkg} ${clr.txt} ${className}`;

  if (link) {
    return (
      <a href={href} className={btnStyles}>
        {children}
      </a>
    );
  } else {
    return (
      <button className={btnStyles} {...rest}>
        {children}
      </button>
    );
  }
}

type TogglePropsType = {
  defaultState: boolean;
  accentClr?: { bkg: string; ring: string };
  onToggle: () => void;
  className?: string;
};

export function ToggleBtn({
  defaultState,
  accentClr = { bkg: "bg-purple-500", ring: "focus:ring-purple-500" },
  onToggle,
  className = "",
}: TogglePropsType) {
  const [isActive, setIsActive] = useState(defaultState);

  const onClick = () => {
    setIsActive((prev) => !prev);
    onToggle();
  };

  useEffect(() => {
    setIsActive(defaultState);
  }, [defaultState]);

  const btnStyles = `h-min w-full max-w-[calc(2.5rem+8px)] rounded-full border-2 border-zinc-100 p-0.5 transition focus:ring dark:border-slate-900 ${
    accentClr.ring
  } ${className} ${isActive ? accentClr.bkg : "bg-gray-300"}`;

  return (
    <button className={btnStyles} onClick={onClick}>
      <span
        className={`block h-5 w-5 rounded-full bg-white transition-transform ${
          isActive ? "translate-x-full" : ""
        }`}
      ></span>
    </button>
  );
}
