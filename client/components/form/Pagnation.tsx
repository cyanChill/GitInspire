import { useMemo } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { HiOutlineDotsHorizontal } from "react-icons/hi";

import { range } from "lodash";

type PagnationPropsType = {
  currPg: number;
  maxPg: number;
  siblingCount?: number;
  onPgChange: (pg: number) => void;
};

export default function Pagnation({
  currPg,
  maxPg,
  siblingCount = 1,
  onPgChange,
}: PagnationPropsType) {
  const invalidPage = currPg > maxPg || maxPg === 0;

  const pagnationRage = useMemo(() => {
    // Number of elements in pagnation bar ("5" from 2 "...", 1st pg #, current pg #, last pg #)
    const barLength = siblingCount + 5;

    // Case 1: Number of pages is <= barLength
    if (maxPg <= barLength) {
      return range(1, maxPg + 1);
    }

    // Check the idx of sibling to the left & right of current
    const leftMostSibIdx = Math.max(currPg - siblingCount, 1);
    const rightMostSibIdx = Math.min(currPg + siblingCount, maxPg);
    // Determine if the dots should be visible
    const showLeftDot = leftMostSibIdx > 2;
    const showRightDot = rightMostSibIdx < maxPg - 2;

    // Case 2: Close to the left side
    if (!showLeftDot && showRightDot) {
      // "3" from excluding the left "..." & last pg #
      let leftItemCnt = 3 + 2 * siblingCount;
      let leftRange = range(1, leftItemCnt + 1);
      return [...leftRange, "...", maxPg];
    }

    // Case 3: Close to right side
    if (!showRightDot && showLeftDot) {
      // "3" from excluding the right "..." & 1st pg #
      let rightItemCnt = 3 + 2 * siblingCount;
      let rightRange = range(maxPg - rightItemCnt + 1, maxPg + 1);
      return [1, "...", ...rightRange];
    }

    // Case 4: In the middle
    if (showLeftDot && showRightDot) {
      let middleRange = range(leftMostSibIdx, rightMostSibIdx + 1);
      return [1, "...", ...middleRange, "...", maxPg];
    }
  }, [currPg, maxPg, siblingCount]);

  if (invalidPage) {
    return (
      <div className="flex w-full items-center justify-center border-t-2 border-gray-400 dark:border-gray-800">
        <PagnationButton onClick={() => {}} current={true} pg={0} />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center border-t-2 border-gray-300 dark:border-gray-600">
      <button
        disabled={currPg === 1}
        onClick={() => (currPg > 1 ? onPgChange(currPg - 1) : null)}
        className={`flex shrink-0 items-center ${
          currPg === 1 ? "text-gray-400 dark:text-gray-600" : ""
        }`}
      >
        <MdKeyboardArrowLeft />
      </button>
      {pagnationRage?.map((item, idx) => {
        if (typeof item === "string") {
          return <HiOutlineDotsHorizontal key={idx} className="shrink-0" />;
        } else {
          return (
            <PagnationButton
              key={idx}
              onClick={() => onPgChange(item)}
              current={currPg === item}
              pg={item}
            />
          );
        }
      })}
      <button
        disabled={currPg === maxPg}
        onClick={() => (currPg < maxPg ? onPgChange(currPg + 1) : null)}
        className={`flex shrink-0 items-center ${
          currPg === maxPg ? "text-gray-400 dark:text-gray-600" : ""
        }`}
      >
        <MdKeyboardArrowRight />
      </button>
    </div>
  );
}

type PagnationButtonPropTypes = {
  onClick: () => void;
  current: boolean;
  pg: number;
};

function PagnationButton({ onClick, current, pg }: PagnationButtonPropTypes) {
  return (
    <button
      onClick={onClick}
      disabled={current}
      className={`relative h-min w-min p-1 px-3 after:absolute after:left-0 after:top-0 after:h-0.5 after:w-full after:translate-y-[-2px] ${
        current ? "after:bg-violet-500" : ""
      }`}
    >
      {pg}
    </button>
  );
}
