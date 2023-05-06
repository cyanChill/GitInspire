type SubmissionFormWrapperType = {
  bdrClr?: string;
  variant: "Repository" | "Tag";
  className?: string;
  children: React.ReactNode;
};

export function SubmissionFormWrapper({
  bdrClr = "border-purple-p-500",
  variant,
  className = "",
  children,
}: SubmissionFormWrapperType) {
  return (
    <div className="flex animate-load-in flex-col sm:flex-row">
      <p
        className={`text-semibold border-b-8 px-1 text-right text-sm uppercase tracking-wide sm:mx-4 sm:ml-6 sm:scale-[-1] sm:border-b-0 sm:border-l-8 sm:p-0 sm:py-1 sm:[writing-mode:vertical-lr] ${bdrClr} ${className}`}
      >
        Suggest {variant}
      </p>
      {children}
    </div>
  );
}
