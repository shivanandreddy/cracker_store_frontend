
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const CreateBill = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [discount, setDiscount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] =
    useState(false);

  const productSearchRef = useRef(null);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        setError("");

        const response = await api.get("/products");

        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Fetch Products Error:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load products."
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Add product to bill
  const addProduct = (product) => {
    setError("");

    const existingItem = items.find(
      (item) => item.productId === product._id
    );

    if (existingItem) {
      if (
        existingItem.quantity >= product.stockQuantity
      ) {
        setError(
          `Only ${product.stockQuantity} ${product.unit}(s) available for ${product.name}.`
        );

        return;
      }

      setItems((previous) =>
        previous.map((item) =>
          item.productId === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );

      return;
    }

    setItems((previous) => [
      ...previous,
      {
        productId: product._id,
        name: product.name,
        price: Number(product.sellingPrice),
        quantity: 1,
        stockQuantity: product.stockQuantity,
        unit: product.unit,
      },
    ]);
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    const product = products.find(
      (item) => item._id === productId
    );

    if (!product) return;

    const newQuantity = Number(quantity);

    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (newQuantity > product.stockQuantity) {
      setError(
        `Only ${product.stockQuantity} ${product.unit}(s) available for ${product.name}.`
      );

      return;
    }

    setError("");

    setItems((previous) =>
      previous.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item
      )
    );
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    const item = items.find(
      (item) => item.productId === productId
    );

    if (!item) return;

    updateQuantity(productId, item.quantity + 1);
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    const item = items.find(
      (item) => item.productId === productId
    );

    if (!item) return;

    if (item.quantity === 1) {
      removeItem(productId);
      return;
    }

    updateQuantity(productId, item.quantity - 1);
  };

  // Remove item
  const removeItem = (productId) => {
    setItems((previous) =>
      previous.filter(
        (item) => item.productId !== productId
      )
    );

    setError("");
  };

  // Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }, [items]);

  // Calculate discount
  const discountAmount = Math.min(
    Math.max(Number(discount) || 0, 0),
    subtotal
  );

  // Calculate grand total
  const grandTotal = subtotal - discountAmount;

  // Total quantity
  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Product Search Logic
  const filteredProducts = useMemo(() => {
    const search = productSearch
      .toLowerCase()
      .trim();

    if (!search) {
      return [];
    }

    return products.filter((product) => {
      return (
        product.name
          ?.toLowerCase()
          .includes(search) ||
        product.sku
          ?.toLowerCase()
          .includes(search) ||
        product.category
          ?.toLowerCase()
          .includes(search)
      );
    });
  }, [products, productSearch]);

  // Select product from dropdown
  const handleProductSelect = (product) => {
    if (!product) return;

    addProduct(product);

    setProductSearch("");
    setShowProductDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Create bill
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    if (
      customerPhone &&
      !/^\d{10}$/.test(customerPhone)
    ) {
      setError(
        "Customer phone number must contain exactly 10 digits."
      );

      return;
    }

    if (Number(discount) < 0) {
      setError("Discount cannot be negative.");
      return;
    }

    if (Number(discount) > subtotal) {
      setError(
        "Discount cannot be greater than the subtotal."
      );

      return;
    }

    try {
      setSaving(true);

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),

        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),

        discount: discountAmount,
        paymentMethod,
      };

      const response = await api.post(
        "/bills",
        payload
      );

      setSuccess("Bill created successfully.");

      const billId = response.data.bill?._id;

      setTimeout(() => {
        if (billId) {
          navigate(`/billing/${billId}`);
        } else {
          navigate("/billing");
        }
      }, 800);
    } catch (error) {
      console.error("Create Bill Error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to create bill."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create Bill
        </h1>

        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Create a new customer bill and update
          inventory automatically.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="xl:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customer Information
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Customer details are optional.
                </p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Name
                  </label>

                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) =>
                      setCustomerName(e.target.value)
                    }
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Customer Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Phone
                  </label>

                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Products
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Search and select products to add
                      to the bill.
                    </p>
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {products.length} products available
                  </div>
                </div>
              </div>

              <div className="p-6">
                {loadingProducts ? (
                  <div className="py-10 text-center text-gray-500 dark:text-gray-400">
                    Loading products...
                  </div>
                ) : products.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No products available.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/products/add")
                      }
                      className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Add Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search */}
                    <div
                      ref={productSearchRef}
                      className="relative"
                    >
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Search Product
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(
                              e.target.value
                            );
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => {
                            if (
                              productSearch.trim()
                            ) {
                              setShowProductDropdown(
                                true
                              );
                            }
                          }}
                          placeholder="Search product name, SKU or category..."
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        {/* Clear Search */}
                        {productSearch && (
                          <button
                            type="button"
                            onClick={() => {
                              setProductSearch("");
                              setShowProductDropdown(
                                false
                              );
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Dropdown */}
                      {showProductDropdown &&
                        productSearch.trim() && (
                          <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                            {filteredProducts.length >
                            0 ? (
                              <div className="max-h-72 overflow-y-auto">
                                {filteredProducts.map(
                                  (product) => {
                                    const selectedItem =
                                      items.find(
                                        (item) =>
                                          item.productId ===
                                          product._id
                                      );

                                    const outOfStock =
                                      product.stockQuantity <=
                                      0;

                                    return (
                                      <button
                                        key={product._id}
                                        type="button"
                                        disabled={
                                          outOfStock
                                        }
                                        onClick={() =>
                                          handleProductSelect(
                                            product
                                          )
                                        }
                                        className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition ${
                                          outOfStock
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-4">
                                          {/* Product Info */}
                                          <div className="min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                              {
                                                product.name
                                              }
                                            </p>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                              SKU:{" "}
                                              {
                                                product.sku
                                              }
                                            </p>

                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                              Category:{" "}
                                              {
                                                product.category
                                              }
                                            </p>
                                          </div>

                                          {/* Price / Stock */}
                                          <div className="text-right shrink-0">
                                            <p className="font-semibold text-gray-900 dark:text-white">
                                              ₹
                                              {Number(
                                                product.sellingPrice
                                              ).toFixed(
                                                2
                                              )}
                                            </p>

                                            <p
                                              className={`text-sm ${
                                                outOfStock
                                                  ? "text-red-500"
                                                  : "text-green-600 dark:text-green-400"
                                              }`}
                                            >
                                              {outOfStock
                                                ? "Out of Stock"
                                                : `Stock: ${product.stockQuantity}`}
                                            </p>

                                            {selectedItem && (
                                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                Added:{" "}
                                                {
                                                  selectedItem.quantity
                                                }
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  }
                                )}
                              </div>
                            ) : (
                              <div className="p-5 text-center">
                                <p className="text-gray-500 dark:text-gray-400">
                                  No products found for "
                                  {productSearch}"
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                    </div>

                    {/* Search Result Count */}
                    {productSearch.trim() && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {filteredProducts.length}{" "}
                          product
                          {filteredProducts.length !==
                          1
                            ? "s"
                            : ""}{" "}
                          found
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setProductSearch("");
                            setShowProductDropdown(
                              false
                            );
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Items */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bill Items
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  No products added to the bill yet.
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Product
                          </th>

                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Price
                          </th>

                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Quantity
                          </th>

                          <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Total
                          </th>

                          <th className="px-6 py-4"></th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {items.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-6 py-4">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </p>

                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.unit}
                              </p>
                            </td>

                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                              ₹{item.price.toFixed(2)}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    decreaseQuantity(
                                      item.productId
                                    )
                                  }
                                  className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  -
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  max={item.stockQuantity}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(
                                      item.productId,
                                      e.target.value
                                    )
                                  }
                                  className="w-16 text-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-1.5 text-gray-900 dark:text-white"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    increaseQuantity(
                                      item.productId
                                    )
                                  }
                                  className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                              ₹
                              {(
                                item.price *
                                item.quantity
                              ).toFixed(2)}
                            </td>

                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  removeItem(
                                    item.productId
                                  )
                                }
                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile */}
                  <div className="md:hidden p-4 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.productId}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>

                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ₹{item.price.toFixed(2)} /{" "}
                              {item.unit}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.productId
                              )
                            }
                            className="text-red-600 text-sm shrink-0"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.productId
                                )
                              }
                              className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              -
                            </button>

                            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">
                              {item.quantity}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                increaseQuantity(
                                  item.productId
                                )
                              }
                              className="w-8 h-8 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹
                            {(
                              item.price *
                              item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDE - SUMMARY */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 sticky top-6">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bill Summary
                </h2>
              </div>

              <div className="p-6 space-y-5">
                {/* Items */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Items
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    {totalQuantity}
                  </span>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>

                  <span className="font-medium text-gray-900 dark:text-white">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Discount */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(e.target.value)
                      }
                      placeholder="0.00"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-4 py-3 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Grand Total */}
                <div className="border-t border-gray-200 dark:border-gray-800 pt-5">
                  <div className="flex justify-between gap-3">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Grand Total
                    </span>

                    <span className="text-2xl font-bold text-blue-600">
                      ₹{grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Payment Method
                  </label>

                  <select
                    value={paymentMethod}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={
                    saving || items.length === 0
                  }
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-700"
                >
                  {saving
                    ? "Creating Bill..."
                    : "Create Bill"}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  disabled={saving}
                  className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateBill;

