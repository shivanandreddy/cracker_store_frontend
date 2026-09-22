
const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 text-white bg-orange-500 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg text-white dark:text-gray-300 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30 dark:hover:text-orange-400 focus:outline-none transition-colors"
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

        <h2 className="text-base font-semibold text-white dark:text-orange-400">
          Kanakadurga Fireworks
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
          Welcome back!
        </span>
      </div>
    </header>
  );
};

export default Navbar;
