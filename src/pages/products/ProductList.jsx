import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ProductList = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Pagination States
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);
    } catch (error) {
      console.error("Fetch Products Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this product?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/products/${id}`);

      fetchProducts();
    } catch (error) {
      console.error("Delete Product Error:", error);

      alert(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  // Filter products based on search input (name, SKU, category)
  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.sku?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  });

  // Calculate stats for the cards
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => Number(p.stockQuantity) <= 5).length;
  const uniqueCategoriesCount = new Set(products.map((p) => p.category)).size;

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to page 1 if search results change and current page exceeds total
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [searchTerm, totalPages, currentPage]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-600 dark:text-gray-300">
          Loading products...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your products and stock
          </p>
        </div>

        {(user?.role === "admin" ||
          user?.role === "useradmin") && (
          <Link
            to="/products/add"
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition text-sm shadow-md hover:shadow-lg border border-blue-500"
          >
            + Add Product
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Stats Cards Section with Clear Outlines & Borders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Card 1: Total Products */}
        <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800/80 p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Total Products
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {totalProductsCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-300 dark:border-blue-700 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* Card 2: Low Stock */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border-2 border-amber-200 dark:border-amber-800/80 p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Low Stock Items
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {lowStockCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-300 dark:border-amber-700 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Card 3: Categories */}
        <div className="bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800/80 p-4 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Categories
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {uniqueCategoriesCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-300 dark:border-purple-700 shadow-inner">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
        </div>

      </div>

      {/* Search Bar Section */}
      <div>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-md text-sm transition-all"
          />
        </div>
      </div>

      {/* Product Cards Grid with Sharp Borders and Outlines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentProducts.map((product) => (
          <div
            key={product._id}
            className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Product Name */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                    <span className="text-orange-700">{product.name}</span>  
                  </h4>

                 
                </div>

                {/* Stock Status */}
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                    Number(product.stockQuantity) <= 5
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-800"
                      : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-800"
                  }`}
                >
                  {Number(product.stockQuantity) <= 5 ? "Low Stock" : "In Stock"}
                </span>
              </div>

              {/* Stock Details */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Stock
                  </p>

                  <p className="mt-0.5 text-base font-bold text-gray-900 dark:text-white">
                    {product.stockQuantity}{" "}
                    <span className="text-xs font-normal text-gray-500">
                      {product.unit}
                    </span>
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-2.5 border border-gray-200 dark:border-gray-700/60 shadow-sm">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">
                    Selling Price
                  </p>

                  <p className="mt-0.5 text-base font-bold text-green-600 dark:text-green-400">
                    ₹{Number(product.sellingPrice || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="mt-3 flex items-between justify-between">
              <div className="mt-3 flex items-center gap-2">
                <p className=" text-xs text-gray-500 dark:text-gray-400">
                  Category
                </p>

                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                  {product.category}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <p className=" text-xs text-gray-500 dark:text-gray-400">
                  SKU
                </p>

                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                  {product.sku}
                </p>
              </div>
              </div>
            </div>

            {/* Actions */}
            {(user?.role === "admin" || user?.role === "useradmin") && (
              <div className="mt-4   flex gap-2 flex-wrap">
                <Link
                  to={`/products/edit/${product._id}`}
                  className="flex-1 text-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition shadow-sm border border-blue-500"
                >
                  Edit
                </Link>

                {user?.role === "admin" && (
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="flex-1 text-center px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition shadow-sm border border-red-400"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 text-sm shadow-md">
          No matching products found.
        </div>
      )}

      {/* Pagination Bar */}
      {filteredProducts.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800 gap-4 shadow-md">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-medium text-gray-900 dark:text-white">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.min(indexOfLastItem, filteredProducts.length)}
            </span>{" "}
            of <span className="font-medium text-gray-900 dark:text-white">{filteredProducts.length}</span> results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Previous
            </button>

            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductList;