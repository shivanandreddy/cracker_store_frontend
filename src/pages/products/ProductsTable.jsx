import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";

const ProductsTable = ({ onEdit, onDelete }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Exactly 10 items per page

  // Fetch all products once on mount
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await api.get("/products");
      
      const data = Array.isArray(response.data) 
        ? response.data 
        : response.data.products || response.data.data || [];
        
      setAllProducts(data);
    } catch (err) {
      console.error("Fetch Products Error:", err);
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query
  const filteredProducts = allProducts.filter((product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query)
    );
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / limit) || 1;
  const startIndex = (currentPage - 1) * limit;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + limit);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col w-full">
      <Navbar />

      {/* Header and Search Bar Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white self-start sm:self-center">
          Product Inventory
        </h2>
        
        {/* Search Input Bar */}
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search change
            }}
            placeholder="Search by name, SKU..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-2 sm:p-0">
        {loading ? (
          <div className="py-12 text-center text-gray-500 animate-pulse text-sm">
            Loading products...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        ) : currentProducts.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            No products found.
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Card Stack Layout (Visible on small screens) */}
            <div className="block md:hidden space-y-3 p-2">
              {currentProducts.map((product, index) => (
                <div 
                  key={product._id} 
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 space-y-2 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        #{startIndex + index + 1} • SKU: {product.sku || "N/A"}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                        {product.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${product.stockQuantity > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      Stock: {product.stockQuantity} {product.unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200 dark:border-gray-700/60">
                    <span className="text-gray-500 dark:text-gray-400">
                      Category: <span className="font-medium text-gray-700 dark:text-gray-300">{product.category}</span>
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                      ₹{Number(product.sellingPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP/TABLET VIEW: Standard Table Layout (Visible on medium screens and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <th className="py-3 px-4 font-semibold w-16">#</th>
                    <th className="py-3 px-4 font-semibold">Product Name</th>
                    <th className="py-3 px-4 font-semibold">SKU</th>
                    <th className="py-3 px-4 font-semibold">Category</th>
                    <th className="py-3 px-4 text-right font-semibold">Selling (₹)</th>
                    <th className="py-3 px-4 text-center font-semibold">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {currentProducts.map((product, index) => (
                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-4 text-gray-500">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-500">{product.sku}</td>
                      <td className="py-3 px-4">{product.category}</td>
                      <td className="py-3 px-4 text-right font-medium text-blue-600">
                        ₹{Number(product.sellingPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stockQuantity > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {product.stockQuantity} {product.unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-3 gap-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Page <span className="font-semibold text-gray-900 dark:text-white">{currentPage}</span> of{" "}
          <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage >= totalPages || loading}
            className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductsTable;