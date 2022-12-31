import React, { useState } from "react";

export default function useMultistepForm(steps: React.ReactElement[]) {
  const [completed, setCompleted] = useState(0);

  const back = () => {
    setCompleted((i) => (i <= 0 ? i : i - 1));
  };

  const next = () => {
    setCompleted((i) => (i >= steps.length ? i : i + 1));
  };

  const goTo = (idx: number) => {
    setCompleted(idx);
  };

  return {
    completed,
    currStep: steps[completed],
    steps,
    isFirstStep: completed === 0,
    isLastStep: completed === steps.length - 1,
    goTo,
    next,
    back,
  };
}
