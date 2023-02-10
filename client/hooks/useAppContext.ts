import { useContext } from "react";

import { AppContext } from "~context/appContext";

const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw Error("useAppContext must be used inside AppContextProvider.");
  }

  return context;
};

export default useAppContext;
