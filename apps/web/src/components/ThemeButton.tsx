import { Moon, Sun, SunMoon } from "lucide-react";
import { useState } from "react";

export const ThemeButton = () => {
  const [theme, setTheme] = useState<"light" | "dark" | undefined>(localStorage.theme);

  const updateTheme = () => {
    document.documentElement.classList.toggle(
      "dark",
      localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
    );
  };

  const handleSetTheme = (theme?: "light" | "dark") => {
    setTheme(theme);
    if (theme) {
      localStorage.theme = theme;
    } else {
      localStorage.removeItem("theme");
    }
    updateTheme();
  };

  return (
    <div className="flex gap-1">
      <button
        className="ui-button data-active:ring data-active:ring-border"
        onClick={() => handleSetTheme("light")}
        data-active={theme === "light" ? true : undefined}
        title="Light Theme"
      >
        <Sun />
      </button>
      <button
        className="ui-button data-active:ring data-active:ring-border"
        onClick={() => handleSetTheme("dark")}
        data-active={theme === "dark" ? true : undefined}
        title="Dark Theme"
      >
        <Moon />
      </button>
      <button
        className="ui-button data-active:ring data-active:ring-border"
        onClick={() => handleSetTheme(undefined)}
        data-active={theme === undefined ? true : undefined}
        title="System Theme"
      >
        <SunMoon />
      </button>
    </div>
  );
};
