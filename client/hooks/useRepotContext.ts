import { useContext } from "react";

import { RepotContext } from "~context/repotContext";

const useRepotContext = () => {
  const context = useContext(RepotContext);

  if (!context) {
    throw Error("useRepotContext must be used inside RepotContextProvider.");
  }

  return context;
};

export default useRepotContext;
