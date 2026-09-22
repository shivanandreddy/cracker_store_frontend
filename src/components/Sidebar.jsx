
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-64
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transform transition-transform duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-bold text-blue-600">
            Cracker Billing
          </h1>

          {/* Mobile Close */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            ✕
          </button>
        </div>

        {/* User */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <p className="font-semibold text-gray-800 dark:text-white truncate">
            {user?.name}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
            {user?.role}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className={`block px-4 py-3 rounded-lg transition ${
              isActive("/dashboard")
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            Dashboard
          </Link>

          {/* Inventory */}
          {(user?.role === "admin" ||
            user?.role === "useradmin") && (
            <Link
              to="/products"
              onClick={closeSidebar}
              className={`block px-4 py-3 rounded-lg transition ${
                isActive("/products")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Inventory
            </Link>
          )}

          {/* Billing */}
          {(user?.role === "admin" ||
            user?.role === "user") && (
            <>
              <Link
                to="/billing/create"
                onClick={closeSidebar}
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("/billing/create")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Create Bill
              </Link>

              <Link
                to="/billing"
                onClick={closeSidebar}
                className={`block px-4 py-3 rounded-lg transition ${
                  isActive("/billing")
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                Bill History
              </Link>
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

