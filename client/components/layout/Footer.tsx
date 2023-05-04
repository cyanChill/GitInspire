type FooterGroupType = {
  testId: string;
  label: string;
  children: React.ReactNode;
};

export function FooterGroup({ testId, label, children }: FooterGroupType) {
  return (
    <div className="min-w-0" data-testid={testId}>
      <p className="text-xxs font-light uppercase text-slate-600 dark:text-gray-400">
        {label}
      </p>
      <p className="truncate text-xs font-semibold">{children}</p>
    </div>
  );
}
