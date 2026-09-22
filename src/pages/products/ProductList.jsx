import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const ProductList = () => {
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
            className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
          >
            + Add Product
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Product count */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total Products
        </p>

        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
          {products.length}
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Product
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  SKU
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Category
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Selling Price
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Stock
                </th>

                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                  Status
                </th>

                {(user?.role === "admin" ||
                  user?.role === "useradmin") && (
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.map((product) => (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.unit}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {product.sku}
                  </td>

                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {product.category}
                  </td>

                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    ₹{Number(product.sellingPrice).toFixed(2)}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={
                        product.stockQuantity <= 5
                          ? "text-red-600 font-semibold"
                          : "text-gray-700 dark:text-gray-300"
                      }
                    >
                      {product.stockQuantity}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </span>
                  </td>

                  {(user?.role === "admin" ||
                    user?.role === "useradmin") && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="px-3 py-1.5 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                        >
                          Edit
                        </Link>

                        {user?.role === "admin" && (
                          <button
                            onClick={() =>
                              handleDelete(product._id)
                            }
                            className="px-3 py-1.5 rounded-md bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No products found.
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {product.sku}
                </p>
              </div>

              <span className="px-2 py-1 h-fit rounded-full text-xs bg-green-100 text-green-700">
                Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs text-gray-500">
                  Category
                </p>
                <p className="font-medium dark:text-white">
                  {product.category}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Stock
                </p>
                <p className="font-medium dark:text-white">
                  {product.stockQuantity} {product.unit}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  Selling Price
                </p>
                <p className="font-medium dark:text-white">
                  ₹{Number(product.sellingPrice).toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">
                  GST
                </p>
                <p className="font-medium dark:text-white">
                  {product.gst}%
                </p>
              </div>
            </div>

            {(user?.role === "admin" ||
              user?.role === "useradmin") && (
              <div className="flex gap-2 mt-5">
                <Link
                  to={`/products/edit/${product._id}`}
                  className="flex-1 text-center px-3 py-2 rounded-lg bg-blue-600 text-white"
                >
                  Edit
                </Link>

                {user?.role === "admin" && (
                  <button
                    onClick={() =>
                      handleDelete(product._id)
                    }
                    className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;