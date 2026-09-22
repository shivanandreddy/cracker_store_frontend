
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const DeleteProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      await api.delete(`/products/${id}`);

      navigate("/products");
    } catch (error) {
      console.error("Delete Product Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to delete product."
      );

      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-center text-gray-900 dark:text-white">
          Delete Product
        </h1>

        {/* Message */}
        <p className="mt-3 text-center text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this product?
        </p>

        <p className="mt-2 text-sm text-center text-gray-500 dark:text-gray-500">
          The product will be deactivated and will no longer
          appear in active inventory.
        </p>

        {/* Error */}
        {error && (
          <div className="mt-5 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-7">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProduct;

