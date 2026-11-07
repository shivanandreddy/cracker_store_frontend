import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../../services/api";
import TopBar from "../../components/TopBar";
import DiscountBanner from "../../components/DiscountBanner";

const ProductsTable = ({ onEdit, onDelete }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.products ||
          response.data?.data ||
          [];

      setAllProducts(data);
    } catch (err) {
      console.error("Fetch Products Error:", err);
      setError(
        err.response?.data?.message || "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter Products
  const filteredProducts = allProducts.filter((product) => {
    const query = searchQuery.toLowerCase().trim();

    return (
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / limit) || 1;

  // Keep current page valid
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = (currentPage - 1) * limit;

  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + limit
  );

  return (
    <div className="w-full min-w-0 min-h-[calc(100vh-4rem)] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm rounded-xl overflow-hidden mb-6">

      {/* Top Elements */}
      <TopBar />
      <DiscountBanner />

      {/* Header & Search Bar Section */}
      <div className="w-full min-w-0 p-4 sm:p-5 md:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
          Checkout Crackers
        </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, SKU..."
            className="w-full min-w-0 pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs transition"
          />
        </div>
      </div>

      {/* Main Table Content Area */}
      <div className="flex-1 min-w-0 w-full overflow-hidden flex flex-col">
        {loading ? (
          <div className="py-16 text-center text-gray-500 animate-pulse text-sm">
            Loading products...
          </div>
        ) : error ? (
          <div className="py-16 px-4 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            No products found matching your search.
          </div>
        ) : (
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[360px] text-sm text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-semibold w-16 sm:w-20">#</th>
                  <th className="py-3.5 px-4 font-semibold">Product Name</th>
                  <th className="py-3.5 px-4 font-semibold text-right whitespace-nowrap">Price (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {currentProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 text-gray-400 dark:text-gray-500 font-mono text-xs whitespace-nowrap">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white break-words">
                      {product.name}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-blue-600 dark:text-blue-400 text-right whitespace-nowrap">
                      ₹{Number(product.sellingPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Bar - Fully Visible and Responsive on Mobile & Desktop */}
      <div className="w-full shrink-0 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-3.5 gap-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-xs">
        
        {/* Item Counter Info */}
        <div className="text-gray-500 dark:text-gray-400 text-center sm:text-left">
          Showing{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {filteredProducts.length === 0 ? 0 : startIndex + 1}
          </span>
          {" - "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {Math.min(startIndex + limit, filteredProducts.length)}
          </span>
          {" of "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {filteredProducts.length}
          </span>
          {" items"}
        </div>

        {/* Page Switcher Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-medium text-gray-700 dark:text-gray-300 px-2 whitespace-nowrap">
            Page <strong className="text-gray-900 dark:text-white">{currentPage}</strong> of <strong className="text-gray-900 dark:text-white">{totalPages}</strong>
          </span>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages || loading}
            aria-label="Next page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer shadow-2xs"
          >
            <ChevronRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProductsTable;