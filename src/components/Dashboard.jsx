
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome, {user?.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Role
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {user?.role}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Products
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Billing
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            Bills
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Inventory */}
          {(user?.role === "admin" ||
            user?.role === "useradmin") && (
            <Link
              to="/products"
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">
                  📦
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Inventory
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Manage products
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Create Bill */}
          {(user?.role === "admin" ||
            user?.role === "user") && (
            <Link
              to="/billing/create"
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-green-400 dark:hover:border-green-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">
                  🧾
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Create Bill
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Create a new customer bill
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Bill History */}
          {(user?.role === "admin" ||
            user?.role === "user") && (
            <Link
              to="/billing"
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-purple-400 dark:hover:border-purple-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
                  📋
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Bill History
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    View previous bills
                  </p>
                </div>
              </div>
            </Link>
          )}

          {/* Add Product */}
          {(user?.role === "admin" ||
            user?.role === "useradmin") && (
            <Link
              to="/products/add"
              className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-md hover:border-orange-400 dark:hover:border-orange-500 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl">
                  ➕
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Add Product
                  </h3>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add product to inventory
                  </p>
                </div>
              </div>
            </Link>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

