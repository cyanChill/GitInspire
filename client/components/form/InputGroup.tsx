interface InputGroupProps {
  label: string;
  className?: string;
  children: JSX.Element;
  [x: string]: any;
}

export default function InputGroup({
  label,
  className = "",
  children,
  ...rest
}: InputGroupProps) {
  return (
    <label {...rest}>
      <span
        className={`block mb-1 text-xs font-semibold tracking-wide ${className}`}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
