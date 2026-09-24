import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { X } from "lucide-react";
import api from "../../services/api";

const BillDetailsModal = ({ billId, isOpen, onClose }) => {
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen || !billId) return;

    const fetchBill = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bills/${billId}`);
        setBill(response.data.bill);
      } catch (error) {
        console.error("Fetch Bill Error:", error);
        setError(
          error.response?.data?.message || "Failed to load bill details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBill();
  }, [billId, isOpen]);

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    if (!bill) return;
    const phone = bill.customerPhone?.replace(/\D/g, "");

    if (!phone) {
      alert("Customer phone number is not available.");
      return;
    }

    const message = 
`\`\`\`
================================
     KanakaDurga Fireworks          
             INVOICE            
================================
Invoice   :    ${bill.billNumber}
Date      :    ${new Date(bill.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")}
Time      :    ${new Date(bill.createdAt).toLocaleTimeString("en-GB")}
Customer  :    ${bill.customerName || "Walk-in Customer"}
Phone     :    ${bill.customerPhone || "-"}
--------------------------------
ITEM NAME        QTY  TOTAL (₹)
--------------------------------
${bill.items
  .map(
    (item) =>
      `${item.name.padEnd(16, " ")} ${String(item.quantity).padStart(3, " ")}   ${String(Number(item.total).toFixed(2)).padStart(8, " ")}`
  .trim()
  )
  .join("\n")}
--------------------------------
Subtotal         : ₹${Number(bill.subtotal).toFixed(2)}
Discount         : -₹${Number(bill.discount || 0).toFixed(2)}
GRAND TOTAL      : ₹${Number(bill.grandTotal).toFixed(2)}
--------------------------------
Payment Mode: ${bill.paymentMethod.toUpperCase()}
================================
    Thank you for your visit!        
        Please Visit Again            
================================
\`\`\``;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${
        "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100"
      }`}>
        
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-lg font-bold">Bill Details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bill ? `Invoice ${bill.billNumber}` : "Loading receipt information..."}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading bill...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          ) : !bill ? (
            <div className="text-center py-20 text-gray-500">Bill not found.</div>
          ) : (
            <>
              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🖨️</span> Print Bill
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FaWhatsapp size={18} />
                  <span>Share Template</span>
                </button>
              </div>

              {/* Invoice Document Layout */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden print:border-0 print:shadow-none print:m-0 print:p-0">
                {/* Invoice Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-600">
                        Cracker Billing
                      </h2>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Sales Invoice
                      </p>
                    </div>
                    <div className="md:text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Invoice Number
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {bill.billNumber}
                      </p>
                      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(bill.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Customer Name
                      </p>
                      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {bill.customerName || "Walk-in Customer"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Customer Phone
                      </p>
                      <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                        {bill.customerPhone || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="p-6">
                  <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                    Purchased Items
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2.5 pr-4 font-semibold text-gray-600 dark:text-gray-300">#</th>
                          <th className="text-left py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Product</th>
                          <th className="text-center py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Qty</th>
                          <th className="text-right py-2.5 px-4 font-semibold text-gray-600 dark:text-gray-300">Price</th>
                          <th className="text-right py-2.5 pl-4 font-semibold text-gray-600 dark:text-gray-300">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bill.items.map((item, index) => (
                          <tr
                            key={`${item.productId}-${index}`}
                            className="border-b border-gray-100 dark:border-gray-800"
                          >
                            <td className="py-3 pr-4 text-gray-500 dark:text-gray-400">{index + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{item.name}</td>
                            <td className="py-3 px-4 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                            <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">₹{Number(item.price).toFixed(2)}</td>
                            <td className="py-3 pl-4 text-right font-medium text-gray-900 dark:text-white">₹{Number(item.total).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="px-6 pb-6">
                  <div className="ml-auto w-full md:w-80 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{Number(bill.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Discount</span>
                      <span className="font-medium text-red-600">- ₹{Number(bill.discount || 0).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
                        <span className="text-xl font-bold text-blue-600">₹{Number(bill.grandTotal).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                      <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium capitalize">
                        {bill.paymentMethod}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created By</p>
                      <p className="mt-0.5 font-medium text-gray-900 dark:text-white text-sm">{bill.createdBy?.name || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Thank you for your purchase!</p>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default BillDetailsModal;