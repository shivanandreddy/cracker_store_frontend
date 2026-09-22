import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AddProduct = () => {
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

    if (
      !formData.name.trim() ||
      !formData.sku.trim() ||
      !formData.category.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      formData.purchasePrice === "" ||
      formData.sellingPrice === ""
    ) {
      setError("Purchase price and selling price are required.");
      return;
    }

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

    try {
      setLoading(true);

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
        gst: Number(formData.gst),
      };

      await api.post("/products", payload);

      setSuccess("Product created successfully.");

      setFormData({
        name: "",
        sku: "",
        category: "",
        purchasePrice: "",
        sellingPrice: "",
        stockQuantity: "",
        unit: "piece",
        gst: "0",
      });

      setTimeout(() => {
        navigate("/products");
      }, 1000);
    } catch (error) {
      console.error("Create Product Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create product."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/products");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Product
        </h1>

        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Add a new product to your inventory.
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
              Basic information about the product.
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
                  <option value="">Select category</option>
                  <option value="Crackers">Crackers</option>
                  <option value="Sparklers">Sparklers</option>
                  <option value="Rockets">Rockets</option>
                  <option value="Flower Pots">Flower Pots</option>
                  <option value="Chakkars">Chakkars</option>
                  <option value="Fountains">Fountains</option>
                  <option value="Other">Other</option>
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
                  <option value="piece">Piece</option>
                  <option value="box">Box</option>
                  <option value="packet">Packet</option>
                  <option value="bundle">Bundle</option>
                  <option value="set">Set</option>
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pricing & Stock
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Enter pricing and available stock.
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

          {/* Tax */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tax Information
            </h2>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Configure the GST percentage for this product.
            </p>

            <div className="mt-6 max-w-sm">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GST (%)
              </label>

              <div className="relative">
                <input
                  type="number"
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 pr-12 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 p-6">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-5 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;