interface InputProps {
  className?: string;
  [x: string]: any;
}

export default function Input({ className = "", ...rest }: InputProps) {
  const baseClasses =
    "p-1.5 rounded-md bg-slate-100 dark:bg-slate-700 shadow-[inset_0_0_4px_0_rgba(0,0,0,0.5)] shadow-slate-300 dark:shadow-slate-600 outline-slate-300 dark:outline-slate-800";

  return <input className={`${baseClasses} ${className}`} {...rest} />;
}
