
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../../services/api";
import Topbar from "../../components/Topbar";
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
    <div className="w-full min-w-0 min-h-screen flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

      <Topbar />

      <DiscountBanner />

      {/* Header & Search */}
      <div className="w-full min-w-0 p-3 sm:p-4 md:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

        <h2 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap ">
          Checkout Crackers
        </h2>

        {/* Search */}
        <div className="relative w-full sm:w-64 md:w-72">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, SKU..."
            className="w-full min-w-0 pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 w-full">

        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse text-sm">
            Loading products...
          </div>
        ) : error ? (
          <div className="py-12 px-4 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No products found.
          </div>
        ) : (
          /* Responsive Table */
          <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">

            <table className="w-full min-w-[420px] text-sm text-left border-collapse">

              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <th className="py-3 px-3 sm:px-4 font-semibold w-12 sm:w-16">
                    #
                  </th>

                  <th className="py-3 px-3 sm:px-4 font-semibold">
                    Product Name
                  </th>

                  <th className="py-3 px-3 sm:px-4 font-semibold whitespace-nowrap">
                    Price (₹)
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">

                {currentProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-3 sm:px-4 text-gray-500 whitespace-nowrap">
                      {startIndex + index + 1}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 font-medium text-gray-900 dark:text-white break-words">
                      {product.name}
                    </td>

                    <td className="py-3.5 px-3 sm:px-4 font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      ₹{Number(product.sellingPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="w-full min-w-0 flex flex-col xs:flex-row sm:flex-row items-center justify-between px-3 sm:px-5 md:px-6 py-3 gap-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">

        {/* Page Information */}
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left">
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
          {" products"}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2">

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1 || loading}
            aria-label="Previous page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ChevronLeft size={17} />
          </button>

          <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2 whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, totalPages)
              )
            }
            disabled={currentPage >= totalPages || loading}
            aria-label="Next page"
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ChevronRight size={17} />
          </button>

        </div>
      </div>

    </div>
  );
};

export default ProductsTable;
