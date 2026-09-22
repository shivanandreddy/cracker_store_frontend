
import { useEffect, useState } from "react";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((previous) => !previous);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
        Cracker Billing System
      </h2>

      <button
        onClick={toggleDarkMode}
        className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white transition"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
    </header>
  );
};

export default Navbar;

