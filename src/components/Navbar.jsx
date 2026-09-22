
import { useEffect, useState } from "react";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
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
    <header className="sticky top-0 z-30 h-16 bg-orange-800 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-white dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>

          <h2 className="text-base sm:text-lg font-semibold text-white dark:text-white">
            Kanakadurga Fireworks
          </h2>
        </div>

        {/* Theme Button */}
        <button
          onClick={toggleDarkMode}
          className="px-3 py-2 sm:px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white text-sm transition"
        >
          {darkMode ? "☀️" : "🌙"}
          <span className="hidden sm:inline ml-1">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;

