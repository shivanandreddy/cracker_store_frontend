import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  LayoutDashboard, 
  Package, 
  FileText, 
  PlusCircle, 
  LogOut, 
  X 
} from "lucide-react";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    logout();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64
          bg-gray-50 dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
              <Sparkles size={18} className="text-yellow-300" />
            </div>
            <h6 className="text-sm font-bold text-gray-900 dark:text-white truncate">
              
            </h6>
          </div>

          {/* Mobile Close */}
          <button
            onClick={closeSidebar}
            className="lg:hidden flex-shrink-0 p-1.5 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive("/dashboard")
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
            }`}
          >
            <LayoutDashboard size={18} className={isActive("/dashboard") ? "text-blue-600 dark:text-blue-400" : "text-gray-500"} />
            Dashboard
          </Link>

          {/* Inventory */}
          {(user?.role === "admin" || user?.role === "useradmin") && (
            <Link
              to="/products"
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/products")
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
              }`}
            >
              <Package size={18} className={isActive("/products") ? "text-blue-600 dark:text-blue-400" : "text-gray-500"} />
              Inventory
            </Link>
          )}

          {/* Billing */}
          {(user?.role === "admin" || user?.role === "user") && (
            <>
              <Link
                to="/billing/create"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/billing/create")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
                }`}
              >
                <PlusCircle size={18} className={isActive("/billing/create") ? "text-blue-600 dark:text-blue-400" : "text-gray-500"} />
                Create Bill
              </Link>

              <Link
                to="/billing"
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/billing")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 font-semibold"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800/60"
                }`}
              >
                <FileText size={18} className={isActive("/billing") ? "text-blue-600 dark:text-blue-400" : "text-gray-500"} />
                Bill History
              </Link>
            </>
          )}
        </nav>

        {/* Jira-style Bottom User Profile & Logout Section */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3 mb-3 px-2 py-1.5">
            {/* Circle icon with user's name first letter */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs uppercase flex-shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0) : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize truncate">
                {user?.role || "Guest"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;