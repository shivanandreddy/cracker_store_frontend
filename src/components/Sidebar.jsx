import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItemClass = (path) => `
    flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
    ${
      isActive(path)
        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200"
    }
  `;

  // Function to close sidebar on mobile when a link is clicked
  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside 
        className={`
          fixed left-0 top-0 h-screen w-64 bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col select-none z-50
          transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        
        {/* Project/App Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0">
              CB
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                Cracker Billing
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                Workspace
              </p>
            </div>
          </div>

          {/* Close button for mobile screen */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          
          {/* General Group */}
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
              Overview
            </p>
            <Link to="/dashboard" onClick={handleLinkClick} className={navItemClass("/dashboard")}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </Link>
          </div>

          {/* Management Group */}
          {(user?.role === "admin" || user?.role === "useradmin" || user?.role === "user") && (
            <div className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">
                Operations
              </p>

              {(user?.role === "admin" || user?.role === "useradmin") && (
                <Link to="/products" onClick={handleLinkClick} className={navItemClass("/products")}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Inventory
                </Link>
              )}

              {(user?.role === "admin" || user?.role === "user") && (
                <>
                  <Link to="/billing/create" onClick={handleLinkClick} className={navItemClass("/billing/create")}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Bill
                  </Link>

                  <Link to="/billing" onClick={handleLinkClick} className={navItemClass("/billing")}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Bill History
                  </Link>
                </>
              )}
            </div>
          )}

        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 text-xs flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-800 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleLinkClick();
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-red-500 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;