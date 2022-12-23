import { createContext, useState, useEffect } from "react";
import { ReactChildren } from "~utils/types";

interface ThemeContextInterface {
  theme: "light" | "dark" | "";
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextInterface | undefined>(
  undefined
);

export default function ThemeContextProvider({ children }: ReactChildren) {
  const [theme, setTheme] = useState<"light" | "dark" | "">("");

  const getTheme = () => {
    if (!localStorage.getItem("theme")) localStorage.setItem("theme", "light");
    setTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    if (document.querySelector("html") && theme) {
      if (theme === "dark") {
        document.querySelector("html")?.classList.add("dark");
      } else {
        document.querySelector("html")?.classList.remove("dark");
      }
    }
  }, [theme]);

  useEffect(() => {
    getTheme();

    const updateTheme = (e: StorageEvent) => {
      if (e.key === "theme") getTheme();
    };
    window.addEventListener("storage", updateTheme);

    return () => {
      window.removeEventListener("storage", updateTheme);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
