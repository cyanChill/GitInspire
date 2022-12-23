import { useContext } from "react";

import { ThemeContext } from "~context/themeContext";

const useThemeContext = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw Error("useThemeContext must be used inside ThemeContextProvider.");
  }

  return context;
};

export default useThemeContext;
