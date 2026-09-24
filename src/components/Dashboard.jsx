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
      // Show billing table for admin and user
      if (user?.role !== "admin" && user?.role !== "user") {
        return;
      }

      try {
        setLoadingBilling(true);
        setBillingError("");

        const response = await api.get("/bills");
        const bills = response.data.bills || [];

        const userWiseBilling = {};

        bills.forEach((bill) => {
          const createdBy = bill.createdBy;

          if (!createdBy?._id) {
            return;
          }

          const userId = createdBy._id;

          const paymentMethod = String(
            bill.paymentMethod || ""
          )
            .trim()
            .toLowerCase();

          const billAmount = Number(bill.grandTotal || 0);

          if (!userWiseBilling[userId]) {
            userWiseBilling[userId] = {
              userId: createdBy._id,
              userName: createdBy.name,
              email: createdBy.email,
              role: createdBy.role,

              // Bill counts
              totalBills: 0,
              creditBills: 0,
              cashBills: 0,
              upiBills: 0,
              cardBills: 0,

              // Bill amounts
              totalAmount: 0,
              creditAmount: 0,
              cashAmount: 0,
              upiAmount: 0,
              cardAmount: 0,

              // Received amount
              receivedAmount: 0,
            };
          }

          const item = userWiseBilling[userId];

          // ==========================================
          // TOTAL
          // ==========================================

          item.totalBills += 1;
          item.totalAmount += billAmount;

          // ==========================================
          // PAYMENT METHOD
          // ==========================================

          if (paymentMethod === "credit") {
            item.creditBills += 1;
            item.creditAmount += billAmount;
          } else if (paymentMethod === "cash") {
            item.cashBills += 1;
            item.cashAmount += billAmount;
          } else if (paymentMethod === "upi") {
            item.upiBills += 1;
            item.upiAmount += billAmount;
          } else if (paymentMethod === "card") {
            item.cardBills += 1;
            item.cardAmount += billAmount;
          }
        });

        // ==========================================
        // CALCULATE RECEIVED AMOUNT
        // ==========================================

        Object.values(userWiseBilling).forEach((item) => {
          item.receivedAmount =
            item.totalAmount - item.creditAmount;
        });

        // Convert object to array
        const summary = Object.values(userWiseBilling);

        // Highest total amount first
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

    if (user) {
      fetchBillingSummary();
    }
  }, [user]);

  // ==========================================
  // GRAND TOTALS
  // ==========================================

  const grandTotals = {
    totalBills: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.totalBills) || 0),
      0
    ),

    creditBills: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.creditBills) || 0),
      0
    ),

    cashBills: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.cashBills) || 0),
      0
    ),

    upiBills: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.upiBills) || 0),
      0
    ),

    cardBills: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.cardBills) || 0),
      0
    ),

    totalAmount: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.totalAmount) || 0),
      0
    ),

    creditAmount: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.creditAmount) || 0),
      0
    ),

    cashAmount: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.cashAmount) || 0),
      0
    ),

    upiAmount: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.upiAmount) || 0),
      0
    ),

    cardAmount: billingSummary.reduce(
      (total, item) =>
        total + (Number(item.cardAmount) || 0),
      0
    ),
  };

  grandTotals.receivedAmount =
    grandTotals.totalAmount -
    grandTotals.creditAmount;

  return (
    <div className="min-h-full">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome,{" "}
          <span className="text-green-600 dark:text-green-400 capitalize">
            {user?.name}
          </span>
        </p>
      </div>

      {/* ==========================================
          BILLING TABLE
      ========================================== */}

      {(user?.role === "admin" ||
        user?.role === "user") && (
        <div className="mt-8">

          {/* Section Header */}

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              User-wise Billing Details
            </h2>

            
          </div>

          {/* ======================================
              LOADING
          ====================================== */}

          {loadingBilling && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Loading billing summary...
              </p>
            </div>
          )}

          {/* ======================================
              ERROR
          ====================================== */}

          {!loadingBilling && billingError && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900 p-6">
              <p className="text-red-600 dark:text-red-400">
                {billingError}
              </p>
            </div>
          )}

          {/* ======================================
              NO BILLS
          ====================================== */}

          {!loadingBilling &&
            !billingError &&
            billingSummary.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No bills have been created yet.
                </p>
              </div>
            )}

          {/* ======================================
              TABLE
          ====================================== */}

          {!loadingBilling &&
            !billingError &&
            billingSummary.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="w-full  table-auto">

                    {/* ==================================
                        HEADER
                    ================================== */}

                    <thead className="bg-gray-50 dark:bg-gray-800">

                      <tr>

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          #
                        </th>

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          User
                        </th>

                        {/* TOTAL BILLS */}

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Bills
                        </th>

                        {/* CREDIT */}

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase text-red-500">
                          Credit
                        </th>

                        {/* CASH */}

                      


                        {/* CREDIT AMOUNT */}

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-red-500">
                          Credit Amount
                        </th>

                        {/* CASH AMOUNT */}

                        

                        {/* RECEIVED */}

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-emerald-500">
                          Received Amount
                        </th>

                        
                        {/* TOTAL AMOUNT */}

                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-blue-500">
                          Total Amount
                        </th>

                      </tr>

                    </thead>

                    {/* ==================================
                        BODY
                    ================================== */}

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                      {billingSummary.map(
                        (item, index) => (
                          <tr
                            key={item.userId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                          >

                            {/* # */}

                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                              {index + 1}
                            </td>

                            {/* USER */}

                            <td className="px-2 py-2 sm:px-4 sm:py-3">
                              <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                                {item.userName}
                              </p>
                            </td>

                            {/* BILLS */}

                            <td className="px-2 py-2 text-center">
                              <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                {item.totalBills}
                              </span>
                            </td>

                            {/* CREDIT */}

                            <td className="px-2 py-2 text-center">
                              <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                {item.creditBills}
                              </span>
                            </td>

                        

                            

                            {/* CREDIT AMOUNT */}

                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                              <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400">
                                ₹
                                {Number(
                                  item.creditAmount || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </td>

                           
                            {/* RECEIVED AMOUNT */}

                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                              <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                                ₹
                                {Number(
                                  item.receivedAmount || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </td>

                            {/* TOTAL AMOUNT */}

                            <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                              <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                                ₹
                                {Number(
                                  item.totalAmount || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                    {/* ==================================
                        GRAND TOTAL
                    ================================== */}

                    <tfoot>

                      <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-700">

                        {/* # */}

                        <td className="px-2 py-3 sm:px-4 sm:py-4"></td>

                        {/* LABEL */}

                        <td className="px-2 py-3 sm:px-4 sm:py-4">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            GRAND TOTAL
                          </span>
                        </td>

                        {/* TOTAL BILLS */}

                        <td className="px-2 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {grandTotals.totalBills}
                          </span>
                        </td>

                        {/* CREDIT BILLS */}

                        <td className="px-2 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                            {grandTotals.creditBills}
                          </span>
                        </td>

                        {/* CASH BILLS */}

                    

                       

                        {/* CREDIT AMOUNT */}

                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-red-600 dark:text-red-400">
                            ₹
                            {grandTotals.creditAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                      

                        {/* RECEIVED AMOUNT */}

                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹
                            {grandTotals.receivedAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                         {/* TOTAL AMOUNT */}

                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                            ₹
                            {grandTotals.totalAmount.toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </td>

                      </tr>

                    </tfoot>

                  </table>

                </div>
              </div>
            )}
        </div>
      )}

      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

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
