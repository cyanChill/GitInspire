export default function Spinner() {
  return (
    <div className="m-auto my-2 h-8 w-8 animate-spin rounded-full border-[6px] border-solid border-gray-300 border-t-gray-400 dark:border-gray-600 dark:border-t-gray-700" />
  );
}

type LazyPropType = { dimensionStyle: string };

export function LazyText({ dimensionStyle }: LazyPropType) {
  return (
    <span
      className={`lazy-bg dark:lazy-bg-dark inline-block animate-lazy-bg rounded-md align-text-bottom ${dimensionStyle}`}
    />
  );
}

export function LazyImage({ dimensionStyle }: LazyPropType) {
  <div
    className={`lazy-bg dark:lazy-bg-dark shrink-0 animate-lazy-bg ${dimensionStyle}`}
  />;
}
