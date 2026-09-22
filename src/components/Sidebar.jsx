import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-blue-600">
          Cracker Billing
        </h1>
      </div>

      {/* User */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <p className="font-semibold text-gray-800 dark:text-white">
          {user?.name}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {user?.role}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">

        <Link
          to="/dashboard"
          className={`block px-4 py-3 rounded-lg ${
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
            className={`block px-4 py-3 rounded-lg ${
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
              className={`block px-4 py-3 rounded-lg ${
                isActive("/billing/create")
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Create Bill
            </Link>

            <Link
              to="/billing"
              className={`block px-4 py-3 rounded-lg ${
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
          onClick={logout}
          className="w-full px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;