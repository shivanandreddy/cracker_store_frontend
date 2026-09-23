import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import api from "../../services/api";

const BillDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBill = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bills/${id}`);
        setBill(response.data.bill);
      } catch (error) {
        console.error("Fetch Bill Error:", error);
        setError(
          error.response?.data?.message || "Failed to load bill."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [id]);

  const handleWhatsApp = () => {
    const phone = bill.customerPhone?.replace(/\D/g, "");

    if (!phone) {
      alert("Customer phone number is not available.");
      return;
    }

    // Formatted text invoice template for WhatsApp
    const message = 
`\`\`\`
====================================
                 KanakaDurga Fireworks           
                     INVOICE             
====================================
Invoice  :    ${bill.billNumber}
Date     :    ${new Date(bill.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
Customer :    ${bill.customerName || "Walk-in Customer"}
Phone    :    ${bill.customerPhone || "-"}
------------------------------------
ITEM DESCRIPTION         QTY    TOTAL (₹)
------------------------------------
${bill.items
  .map(
    (item) =>
      `${item.name.padEnd(24, " ")} ${String(item.quantity).padStart(3, " ")}   ${String(Number(item.total).toFixed(2)).padStart(8, " ")}`
  .trim()
  )
  .join("\n")}
-------------------------------------
Subtotal                   : ₹${Number(bill.subtotal).toFixed(2)}
Discount                   : -₹${Number(bill.discount || 0).toFixed(2)}
GRAND TOTAL                : ₹${Number(bill.grandTotal).toFixed(2)}
-------------------------------------
Payment Mode: ${bill.paymentMethod.toUpperCase()}
=====================================
        Thank you for your visit!        
            Please Visit Again             
=====================================
\`\`\``;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-600 dark:text-gray-300">Loading bill...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate("/billing")}
            className="mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Back to Bills
          </button>
        </div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-20 text-gray-500">Bill not found.</div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bill Details
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Invoice {bill.billNumber}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => navigate("/billing")}
            className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5"
          >
            <span>🖨️</span> Print Bill
          </button>

          {/* WhatsApp Template Share Button with official icon */}
          <button
            onClick={handleWhatsApp}
            className="px-4 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 font-medium transition-colors"
          >
            <FaWhatsapp size={20} />
            <span>Share Template</span>
          </button>
        </div>
      </div>

      {/* Invoice Document Layout */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden print:border-0 print:shadow-none print:m-0 print:p-0">
        {/* Invoice Header */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-blue-600">
                Cracker Billing
              </h2>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                Sales Invoice
              </p>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Invoice Number
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {bill.billNumber}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(bill.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer Name
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {bill.customerName || "Walk-in Customer"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Customer Phone
              </p>
              <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                {bill.customerPhone || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
            Purchased Items
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 pr-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Product
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Qty
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Price
                  </th>
                  <th className="text-right py-3 pl-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, index) => (
                  <tr
                    key={`${item.productId}-${index}`}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-4 pr-4 text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-700 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 dark:text-gray-300">
                      ₹{Number(item.price).toFixed(2)}
                    </td>
                    <td className="py-4 pl-4 text-right font-medium text-gray-900 dark:text-white">
                      ₹{Number(item.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="px-8 pb-8">
          <div className="ml-auto w-full md:w-96 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-white">
                ₹{Number(bill.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Discount</span>
              <span className="font-medium text-red-600">
                - ₹{Number(bill.discount || 0).toFixed(2)}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Grand Total
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{Number(bill.grandTotal).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-8 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Payment Method
              </p>
              <span className="inline-block mt-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium capitalize">
                {bill.paymentMethod}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created By
              </p>
              <p className="mt-1 font-medium text-gray-900 dark:text-white">
                {bill.createdBy?.name || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 text-center border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Thank you for your purchase!
          </p>
          <p className="mt-1 text-xs text-gray-400">
            This is a computer-generated invoice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillDetails;