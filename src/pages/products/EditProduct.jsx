
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "",
    unit: "piece",
    gst: "0",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch existing product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        const product = response.data.product;

        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          category: product.category || "",
          purchasePrice: product.purchasePrice ?? "",
          sellingPrice: product.sellingPrice ?? "",
          stockQuantity: product.stockQuantity ?? "",
          unit: product.unit || "piece",
          gst: product.gst ?? "0",
        });
      } catch (error) {
        console.error("Fetch Product Error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Required fields
    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.category
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      formData.purchasePrice === "" ||
      formData.sellingPrice === ""
    ) {
      setError(
        "Purchase price and selling price are required."
      );
      return;
    }

    // Number validation
    if (Number(formData.purchasePrice) < 0) {
      setError("Purchase price cannot be negative.");
      return;
    }

    if (Number(formData.sellingPrice) < 0) {
      setError("Selling price cannot be negative.");
      return;
    }

    if (Number(formData.stockQuantity) < 0) {
      setError("Stock quantity cannot be negative.");
      return;
    }

    if (Number(formData.gst) < 0) {
      setError("GST cannot be negative.");
      return;
    }

    if (Number(formData.gst) > 100) {
      setError("GST cannot be greater than 100%.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        category: formData.category.trim(),
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        stockQuantity:
          formData.stockQuantity === ""
            ? 0
            : Number(formData.stockQuantity),
        unit: formData.unit,
        gst:
          formData.gst === ""
            ? 0
            : Number(formData.gst),
      };

      await api.put(`/products/${id}`, payload);

      setSuccess("Product updated successfully.");

      // Go back to inventory after a short delay
      setTimeout(() => {
        navigate("/products");
      }, 1000);
    } catch (error) {
      console.error("Update Product Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to update product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-600 dark:text-gray-300">
          Loading product...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Product
        </h1>

        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Update the existing product and inventory details.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <form onSubmit={handleSubmit}>
          {/* Messages */}
          <div className="p-6 pb-0">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
                {success}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Product Information
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update the basic information about the product.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Name
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Example: 1000 Wala"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SKU
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="Example: CRK-001"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 uppercase text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  SKU must be unique.
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">
                    Select category
                  </option>
                  <option value="Crackers">
                    Crackers
                  </option>
                  <option value="Sparklers">
                    Sparklers
                  </option>
                  <option value="Rockets">
                    Rockets
                  </option>
                  <option value="Flower Pots">
                    Flower Pots
                  </option>
                  <option value="Chakkars">
                    Chakkars
                  </option>
                  <option value="Fountains">
                    Fountains
                  </option>
                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </label>

                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="piece">
                    Piece
                  </option>
                  <option value="box">
                    Box
                  </option>
                  <option value="packet">
                    Packet
                  </option>
                  <option value="bundle">
                    Bundle
                  </option>
                  <option value="set">
                    Set
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pricing & Stock
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update pricing and available inventory.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {/* Purchase Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purchase Price
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selling Price
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>

                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stock Quantity
                </label>

                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;

