
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const BillList = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/bills");

      setBills(response.data.bills || []);
    } catch (error) {
      console.error("Fetch Bills Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load bill history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const formatPaymentMethod = (method) => {
    if (!method) return "-";

    return method.charAt(0).toUpperCase() + method.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-600 dark:text-gray-300">
          Loading bill history...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bill History
          </h1>

          <p className="mt-1 text-gray-500 dark:text-gray-400">
            View all customer invoices and transactions.
          </p>
        </div>

        <Link
          to="/billing/create"
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          + Create Bill
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <span>{error}</span>

          <button
            type="button"
            onClick={fetchBills}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Bills
          </p>

          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {bills.length}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Sales
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-600">
            ₹
            {bills
              .reduce(
                (total, bill) =>
                  total + Number(bill.grandTotal || 0),
                0
              )
              .toFixed(2)}
          </p>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Invoice
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Customer
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Items
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Total
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Payment
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Date
                </th>

                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {bills.map((bill) => (
                <tr
                  key={bill._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  {/* Invoice */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {bill.billNumber}
                    </p>
                  </td>

                  {/* Customer */}
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {bill.customerName ||
                        "Walk-in Customer"}
                    </p>

                    {bill.customerPhone && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {bill.customerPhone}
                      </p>
                    )}
                  </td>

                  {/* Items */}
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {bill.items?.length || 0}
                  </td>

                  {/* Total */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹
                      {Number(
                        bill.grandTotal || 0
                      ).toFixed(2)}
                    </p>

                    {Number(bill.discount || 0) > 0 && (
                      <p className="text-xs text-red-500">
                        Discount: ₹
                        {Number(
                          bill.discount
                        ).toFixed(2)}
                      </p>
                    )}
                  </td>

                  {/* Payment */}
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      {formatPaymentMethod(
                        bill.paymentMethod
                      )}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(bill.createdAt)}
                  </td>

                  {/* Action */}
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/billing/${bill._id}`}
                      className="inline-flex px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bills.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🧾</div>

            <h3 className="font-semibold text-gray-900 dark:text-white">
              No bills found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first bill to see it here.
            </p>

            <Link
              to="/billing/create"
              className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Create Bill
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bills.map((bill) => (
          <div
            key={bill._id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {bill.billNumber}
                </p>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {formatDate(bill.createdAt)}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                {formatPaymentMethod(
                  bill.paymentMethod
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Customer
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {bill.customerName ||
                    "Walk-in Customer"}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Items
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {bill.items?.length || 0}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </p>

                <p className="mt-1 font-bold text-blue-600">
                  ₹
                  {Number(
                    bill.grandTotal || 0
                  ).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created By
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {bill.createdBy?.name || "-"}
                </p>
              </div>
            </div>

            <Link
              to={`/billing/${bill._id}`}
              className="block text-center mt-5 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              View Bill
            </Link>
          </div>
        ))}

        {bills.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🧾</div>

            <h3 className="font-semibold text-gray-900 dark:text-white">
              No bills found
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create your first bill to see it here.
            </p>

            <Link
              to="/billing/create"
              className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white"
            >
              Create Bill
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillList;

