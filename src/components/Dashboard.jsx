import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">

        {/* Products */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Products
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                0
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-2xl dark:bg-blue-900/30">
              📦
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Stock
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                0
              </h2>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-2xl dark:bg-green-900/30">
              📊
            </div>
          </div>
        </div>

        {/* Bills */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Bills
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                0
              </h2>
            </div>

            <div className="rounded-lg bg-purple-100 p-3 text-2xl dark:bg-purple-900/30">
              🧾
            </div>
          </div>
        </div>

        {/* Sales */}
        <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sales
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                ₹0
              </h2>
            </div>

            <div className="rounded-lg bg-yellow-100 p-3 text-2xl dark:bg-yellow-900/30">
              💰
            </div>
          </div>
        </div>

      </div>

      {/* Welcome Card */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Account Information
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Name
            </p>

            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {user?.name || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Email
            </p>

            <p className="mt-1 font-medium text-gray-900 dark:text-white">
              {user?.email || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Role
            </p>

            <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {user?.role || "-"}
            </span>
          </div>

        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200 dark:bg-gray-900 dark:border-gray-800">

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {(user?.role === "admin" ||
            user?.role === "useradmin") && (
            <a
              href="/products"
              className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                📦 Manage Inventory
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add, edit and manage products
              </p>
            </a>
          )}

          {(user?.role === "admin" ||
            user?.role === "user") && (
            <a
              href="/billing/create"
              className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                🧾 Create Bill
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a new customer bill
              </p>
            </a>
          )}

          {(user?.role === "admin" ||
            user?.role === "user") && (
            <a
              href="/billing"
              className="rounded-lg border border-gray-200 p-4 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <p className="font-semibold text-gray-900 dark:text-white">
                📋 Bill History
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                View previous bills
              </p>
            </a>
          )}

        </div>
      </div>

    </div>
  );
};

export default Dashboard;