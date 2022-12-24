interface MultiSelProps {
  items: [];
  maxSel?: number;
}

export default function MultiSelectDropDown({items, maxSel=3}: MultiSelProps) {
  return <div className="w-full p-2 rounded-lg text-white bg-slate-500">MutliSelect Dropdown Component</div>;
}
