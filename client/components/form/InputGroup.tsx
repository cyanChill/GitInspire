interface InputGroupProps {
  label: string;
  required?: boolean;
  className?: string;
  children: JSX.Element;
  [x: string]: any;
}

export default function InputGroup({
  label,
  required = false,
  className = "",
  children,
  ...rest
}: InputGroupProps) {
  return (
    <label {...rest}>
      <span
        className={`block mb-1 text-xs font-semibold tracking-wide ${className}`}
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
