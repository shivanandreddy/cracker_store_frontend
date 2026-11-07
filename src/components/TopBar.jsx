import { useState, useEffect } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';

const Topbar = ({ sidebarOpen, setSidebarOpen }) => {
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
    <header className="relative h-16 bg-yellow-800 dark:bg-yellow-800 text-white flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 transition-colors print:hidden">
      {/* Left side: Hamburger button */}
     

      {/* Centered Heading with Firework Animation */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none max-w-[70%]">
        {/* Left Sparkle Burst */}
        <span className="text-yellow-300 animate-firework-burst flex items-center">
          <Sparkles size={18} />
        </span>

        {/* Firework Glowing Title */}
        <h2 className="text-base sm:text-lg font-bold text-white dark:text-white-400 text-center tracking-wide truncate animate-firework-glow">
          💥 KanakaDurga Fireworks 💥
        </h2>

        {/* Right Sparkle Burst (offset timing) */}
        <span className="text-yellow-300 animate-firework-burst-delay flex items-center">
          <Sparkles size={18} />
        </span>
      </div>

     
    </header>
  );
};

export default Topbar;