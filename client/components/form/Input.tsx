import { forwardRef } from "react";

type TextAreaProps = {
  textarea: true;
  rows: number;
};

type InputProps = {
  textarea?: boolean;
  className?: string;
  [x: string]: any;
} & (TextAreaProps | {});

export default forwardRef(function Input(
  { className = "", textarea = false, rows = 2, ...rest }: InputProps,
  ref: React.ForwardedRef<any>
) {
  const baseClasses =
    "p-1.5 rounded-md bg-zinc-50 dark:bg-slate-700 shadow-[inset_0_0_2px_0_rgba(0,0,0,0.5)] shadow-slate-400 dark:shadow-slate-600 outline-slate-300 dark:outline-slate-800";

  if (textarea) {
    return (
      <textarea
        className={`${baseClasses} ${className} resize-none`}
        rows={rows}
        ref={ref}
        {...rest}
      />
    );
  } else {
    return (
      <input className={`${baseClasses} ${className}`} {...rest} ref={ref} />
    );
  }
});

interface InputGroupProps {
  label: string;
  required?: boolean;
  className?: string;
  children: JSX.Element;
  [x: string]: any;
}

export function InputGroup({
  label,
  required = false,
  className = "",
  children,
  ...rest
}: InputGroupProps) {
  return (
    <label {...rest}>
      <span
        className={`mb-1 block text-xs font-semibold tracking-wide ${className}`}
      >
        {label}{" "}
        {required && (
          <span className="text-red-500 dark:text-red-400">*Required</span>
        )}
      </span>
      {children}
    </label>
  );
}

// Version that doesn't use a <label> element (to work with our custom Select component)
export function InputGroupAlt({
  label,
  required = false,
  className = "",
  children,
  ...rest
}: InputGroupProps) {
  return (
    <div className={`mb-2 ${className}`} {...rest}>
      <p className="mb-1 text-xs font-semibold tracking-wide">
        {label}{" "}
        {required && (
          <span className="text-red-500 dark:text-red-400">*Required</span>
        )}
      </p>
      {children}
    </div>
  );
}
