import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  // Sync state changes with the HTML root class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className="relative h-16 bg-orange-500 dark:bg-gray-900 text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 transition-colors print:hidden">
      {/* Left side: Hamburger button */}
      <div className="flex items-center gap-3 z-10">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-white hover:bg-orange-600 dark:hover:bg-gray-800 focus:outline-none transition-colors"
          aria-label="Toggle Sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Centered Heading */}
      <h2 className="absolute left-1/2 -translate-x-1/2 text-base sm:text-lg font-semibold text-white dark:text-orange-400 text-center pointer-events-none truncate max-w-[60%]">
        Kanakadurga Fireworks
      </h2>

      {/* Right side: Dark mode toggle */}
      <div className="flex items-center gap-3 z-10">
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="rounded-md p-2 text-white hover:bg-orange-600 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <Sun size={20} className="text-amber-400" />
          ) : (
            <Moon size={20} />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;