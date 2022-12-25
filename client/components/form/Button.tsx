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
  bkg: "bg-gradient-to-r from-amber-500 hover:from-amber-600 to-orange-500 hover:to-orange-600",
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
  const btnStyles = `inline-flex justify-center items-center gap-2 p-3 py-1.5 my-2 font-medium tracking-tight rounded-md shadow-lg ${clr.bkg} ${clr.txt} ${className}`;

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
