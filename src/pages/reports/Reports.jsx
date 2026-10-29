import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  RefreshCw, 
  Calendar,
  Layers,
  CreditCard,
  Package,
  Search
} from "lucide-react";
import api from "../../services/api";

// CSV parsing helper to read and render reports in frontend
const parseCSV = (csvText) => {
  if (!csvText || typeof csvText !== "string") return { headers: [], rows: [] };

  // Remove potential UTF-8 BOM character if present
  const cleanedText = csvText.replace(/^\uFEFF/, "");

  const lines = cleanedText
    .trim()
    .split(/\r\n|\n/)
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) return { headers: [], rows: [] };

  // Parse header line
  const headers = lines[0]
    .split(",")
    .map((col) => col.replace(/^"|"$/g, "").trim());

  // Parse rows (handles quoted cells containing commas)
  const rows = lines.slice(1).map((line) => {
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
    return matches.map((val) => val.replace(/^"|"$/g, "").trim());
  });

  return { headers, rows };
};

const Reports = () => {
  const [reportType, setReportType] = useState("bills"); // 'bills' | 'item-sales' | 'inventory'
  const [reportData, setReportData] = useState({ headers: [], rows: [] });
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [search, setSearch] = useState(""); // Replaces category with Product Name search

  // ---------------------------------------------------------
  // Fetch Report Data from Backend Controller
  // ---------------------------------------------------------
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (reportType === "bills" && paymentMethod) params.paymentMethod = paymentMethod;
      if (reportType === "inventory" && search.trim()) params.search = search.trim();

      const response = await api.get(`/reports/${reportType}`, {
        params,
        responseType: "text",
      });

      const parsed = parseCSV(response.data);
      setReportData(parsed);
    } catch (err) {
      console.error("Fetch Report Error:", err);
      setError(
        err.response?.data?.message || "Failed to load report data. Please check server."
      );
      setReportData({ headers: [], rows: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType]);

  // ---------------------------------------------------------
  // Excel-Compatible Download Handler
  // ---------------------------------------------------------
  const handleDownload = async () => {
    try {
      setDownloading(true);

      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (reportType === "bills" && paymentMethod) params.paymentMethod = paymentMethod;
      if (reportType === "inventory" && search.trim()) params.search = search.trim();

      const response = await api.get(`/reports/${reportType}`, {
        params,
        responseType: "blob",
      });

      // Ensure UTF-8 BOM so Excel opens all characters and columns without format errors
      const blob = new Blob(["\uFEFF", response.data], {
        type: "text/csv;charset=utf-8;",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${reportType}_report_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download Error:", err);
      alert("Failed to download sheet.");
    } finally {
      setDownloading(false);
    }
  };

  const handleClearFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentMethod("");
    setSearch("");
    fetchReport();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Download Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="text-green-800 dark:text-green-500" />
            Reports
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Preview, analyze, and download Excel-compatible CSV sheets.
          </p>
        </div>

        {/* Enabled download button */}
        <button
          onClick={handleDownload}
          disabled={loading || downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-800 hover:bg-green-700 active:bg-green-900 text-white font-medium text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download size={16} />
          <span>{downloading ? "Exporting Sheet..." : "Download Excel Sheet"}</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => {
            setSearch("");
            setReportType("bills");
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === "bills"
              ? "border-green-800 bg-green-50/50 dark:bg-green-950/20 dark:border-green-700"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
          }`}
        >
          <div className={`p-2.5 rounded-lg ${reportType === "bills" ? "bg-green-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            <CreditCard size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Sales & Bills</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Customer totals & payment modes[cite: 19]</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setReportType("item-sales");
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === "item-sales"
              ? "border-green-800 bg-green-50/50 dark:bg-green-950/20 dark:border-green-700"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
          }`}
        >
          <div className={`p-2.5 rounded-lg ${reportType === "item-sales" ? "bg-green-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            <Layers size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Itemized Sales</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Quantity & product performance[cite: 19]</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSearch("");
            setReportType("inventory");
          }}
          className={`flex items-center gap-3 p-4 rounded-xl border text-left transition cursor-pointer ${
            reportType === "inventory"
              ? "border-green-800 bg-green-50/50 dark:bg-green-950/20 dark:border-green-700"
              : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700"
          }`}
        >
          <div className={`p-2.5 rounded-lg ${reportType === "inventory" ? "bg-green-800 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
            <Package size={20} />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Stock Valuation</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Cost value, retail & margins[cite: 20]</p>
          </div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReport();
          }}
          className="flex flex-wrap items-end gap-3"
        >
          {reportType !== "inventory" ? (
            <>
              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  Start Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700"
                  />
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {reportType === "bills" && (
                <div>
                  <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-36 py-2 px-3 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700"
                  >
                    <option value="">All Modes</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            /* Stock Valuation: Product Name filter */
            <div className="flex-1 min-w-[260px] max-w-sm">
              <label className="block mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                Search Product Name / SKU
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Enter product name or SKU..."
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-700"
                />
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-800 hover:bg-green-700 text-white text-sm font-medium transition cursor-pointer"
          >
            <Filter size={15} />
            <span>Apply</span>
          </button>

          {(startDate || endDate || paymentMethod || search) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline py-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Report Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {reportData.rows.length} Record{reportData.rows.length !== 1 ? "s" : ""} Found
          </div>
          <button
            type="button"
            onClick={fetchReport}
            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-green-700" />
            Loading records...
          </div>
        ) : reportData.rows.length === 0 ? (
          <div className="py-20 text-center text-gray-500 dark:text-gray-400">
            No records found for the current search filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  {reportData.headers.map((head, index) => (
                    <th key={index} className="px-5 py-3.5">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {reportData.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-5 py-3 text-gray-800 dark:text-gray-200"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;