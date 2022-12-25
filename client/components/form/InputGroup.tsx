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
    <label className={`${className}`} {...rest}>
      <span className="block mb-1 text-xs font-semibold tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}
