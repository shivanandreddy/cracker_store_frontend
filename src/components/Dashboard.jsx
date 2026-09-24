import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();

  const [billingSummary, setBillingSummary] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingError, setBillingError] = useState("");

  useEffect(() => {
    const fetchBillingSummary = async () => {
      // Only admin can see all users' billing
      if (user?.role !== "admin") {
        return;
      }

      try {
        setLoadingBilling(true);
        setBillingError("");

        const response = await api.get("/bills");
        const bills = response.data.bills || [];

        /*
          Group bills by createdBy user
        */
        const userWiseBilling = {};

bills.forEach((bill) => {
  const createdBy = bill.createdBy;

  if (!createdBy?._id) {
    return;
  }

  const userId = createdBy._id;

  // Normalize payment method
  const paymentMethod = String(
    bill.paymentMethod || ""
  )
    .trim()
    .toLowerCase();

  // Make sure grandTotal is a number
  const billAmount = Number(
    bill.grandTotal || 0
  );

  if (!userWiseBilling[userId]) {
    userWiseBilling[userId] = {
      userId: createdBy._id,
      userName: createdBy.name,
      email: createdBy.email,
      role: createdBy.role,

      totalBills: 0,

      creditBills: 0,
      creditAmount: 0,

      cashBills: 0,
      upiBills: 0,
      cardBills: 0,

      totalAmount: 0,
    };
  }

  // Total bills
  userWiseBilling[userId].totalBills += 1;

  // Total billing amount
  userWiseBilling[userId].totalAmount += billAmount;

  // Credit
  if (paymentMethod === "credit") {
    userWiseBilling[userId].creditBills += 1;

    userWiseBilling[userId].creditAmount += billAmount;
  }

  // Cash
  else if (paymentMethod === "cash") {
    userWiseBilling[userId].cashBills += 1;
  }

  // UPI
  else if (paymentMethod === "upi") {
    userWiseBilling[userId].upiBills += 1;
  }

  // Card
  else if (paymentMethod === "card") {
    userWiseBilling[userId].cardBills += 1;
  }
});

        /*
          Convert object to array
          and sort by total billed amount
        */
        const summary = Object.values(userWiseBilling);

        summary.sort(
          (a, b) => b.totalAmount - a.totalAmount
        );

        setBillingSummary(summary);
      } catch (error) {
        console.error(
          "Billing Summary Error:",
          error
        );

        setBillingError(
          error.response?.data?.message ||
            "Failed to load billing summary."
        );
      } finally {
        setLoadingBilling(false);
      }
    };

    fetchBillingSummary();
  }, [user]);

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

      {/* ==================================================
          USER WISE BILLING
      ================================================== */}

      {user?.role === "admin" && (
        <div className="mt-8">
          {/* Section Header */}
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              User-wise Billing Details
            </h2>
          </div>

          {/* Loading */}
          {loadingBilling && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Loading billing summary...
              </p>
            </div>
          )}

          {/* Error */}
          {!loadingBilling && billingError && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900 p-6">
              <p className="text-red-600 dark:text-red-400">
                {billingError}
              </p>
            </div>
          )}

          {/* No Bills */}
          {!loadingBilling &&
            !billingError &&
            billingSummary.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No bills have been created yet.
                </p>
              </div>
            )}

          {/* Billing Table */}
          {!loadingBilling &&
            !billingError &&
            billingSummary.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[850px] table-auto">
                    {/* ================================
                        TABLE HEADER
                    ================================= */}
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {/* # */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          #
                        </th>

                        {/* User */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          User
                        </th>

                        {/* Total Bills */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Bills
                        </th>

                        {/* Credit Count */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Credit
                        </th>

                       
                       

                        {/* Total Score */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Total  Amount
                        </th>

                        {/* Credit Score */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Credit Amount
                        </th>

                        {/* Received Amount */}
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Received Amount
                        </th>
                      </tr>
                    </thead>

                    {/* ================================
                        TABLE BODY
                    ================================= */}
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {billingSummary.map(
                        (item, index) => (
                          <tr
                            key={item.userId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                          >
                            {/* Number */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>

                            {/* User */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3">
                              <div className="min-w-0">
                                <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                                  {item.userName}
                                </p>

                                
                              </div>
                            </td>

                            {/* Total Bills */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3">
                              <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.totalBills}
                              </span>
                            </td>

                            {/* Credit Bills */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3">
                              <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {item.creditBills}
                              </span>
                            </td>

                           


                           

                            {/* Total Amount */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3">
                              <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                ₹
                                {Number(
                                  item.totalAmount || 0
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            </td>
                            {/* Credit Score */}
                            <td className="px-2 py-2 sm:px-4 sm:py-3">
  <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400">
    ₹
    {Number(item.creditAmount || 0).toLocaleString("en-IN")}
  </span>
</td>

<td className="px-2 py-2 sm:px-4 sm:py-3">
  <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-green-400">
    ₹
    {Number(item.totalAmount-item.creditAmount).toLocaleString("en-IN")}
  </span>
</td>

                            
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* ==================================================
          QUICK ACTIONS
      ================================================== */}

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
