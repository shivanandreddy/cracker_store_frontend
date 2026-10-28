import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

const EditBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Discount percentage
  const [discountPercent, setDiscountPercent] = useState(0);

  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Product search
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const productSearchRef = useRef(null);

  // --------------------------------------------------
  // Fetch Bill and Products
  // --------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [billRes, productsRes] = await Promise.all([
          api.get(`/bills/${id}`),
          api.get("/products"),
        ]);

        const billData = billRes.data.bill;
        const availableProducts = productsRes.data.products || [];

        setProducts(availableProducts);

        if (billData) {
          setCustomerName(billData.customerName || "");
          setCustomerPhone(billData.customerPhone || "");
          setPaymentMethod(billData.paymentMethod || "cash");

          // Calculate initial discount percentage
          const billSubtotal = Number(billData.subtotal) || 0;
          const billDiscount = Number(billData.discount) || 0;
          if (billSubtotal > 0 && billDiscount > 0) {
            setDiscountPercent(
              Math.round((billDiscount / billSubtotal) * 100)
            );
          } else {
            setDiscountPercent(0);
          }

          // Map existing bill items
          const mappedItems = (billData.items || []).map((billItem) => {
            const rawId = billItem.productId?._id || billItem.productId;
            const matchedProduct = availableProducts.find(
              (p) => String(p._id) === String(rawId)
            );

            const initialQuantity = Number(billItem.quantity) || 1;
            const liveStock = matchedProduct ? Number(matchedProduct.stockQuantity) : 0;

            return {
              productId: String(rawId),
              name: billItem.name || matchedProduct?.name || "Product",
              price: Number(billItem.price) || 0,
              purchasePrice: Number(
                billItem.purchasePrice ??
                  billItem.purchaseprice ??
                  matchedProduct?.purchasePrice ??
                  matchedProduct?.purchaseprice ??
                  0
              ),
              quantity: initialQuantity,
              // Available limit is current warehouse stock plus quantity already allocated to this bill
              maxAllowedStock: liveStock + initialQuantity,
              unit: matchedProduct?.unit || billItem.unit || "unit",
            };
          });

          setItems(mappedItems);
        }
      } catch (err) {
        console.error("Fetch Edit Bill Error:", err);
        setError(
          err.response?.data?.message || "Failed to load bill or products."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // --------------------------------------------------
  // Add Product
  // --------------------------------------------------
  const addProduct = (product) => {
    setError("");
    const prodIdStr = String(product._id);

    const existingItem = items.find(
      (item) => String(item.productId) === prodIdStr
    );

    if (existingItem) {
      if (existingItem.quantity >= existingItem.maxAllowedStock) {
        setError(
          `Only ${existingItem.maxAllowedStock} ${existingItem.unit || "unit"}(s) available for ${existingItem.name}.`
        );
        return;
      }

      setItems((previous) =>
        previous.map((item) =>
          String(item.productId) === prodIdStr
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
        productId: prodIdStr,
        name: product.name,
        price: Number(product.sellingPrice) || 0,
        purchasePrice: Number(
          product.purchasePrice ?? product.purchaseprice ?? 0
        ),
        quantity: 1,
        maxAllowedStock: Number(product.stockQuantity) || 1,
        unit: product.unit || "unit",
      },
    ]);
  };

  // --------------------------------------------------
  // Update Quantity
  // --------------------------------------------------
  const updateQuantity = (productId, rawQuantity) => {
    const prodIdStr = String(productId);
    const item = items.find((i) => String(i.productId) === prodIdStr);
    if (!item) return;

    if (rawQuantity === "") {
      setItems((prev) =>
        prev.map((i) =>
          String(i.productId) === prodIdStr ? { ...i, quantity: "" } : i
        )
      );
      return;
    }

    const newQuantity = parseInt(rawQuantity, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      removeItem(productId);
      return;
    }

    if (newQuantity > item.maxAllowedStock) {
      setError(
        `Only ${item.maxAllowedStock} ${item.unit || "unit"}(s) available for ${item.name}.`
      );
      return;
    }

    setError("");

    setItems((previous) =>
      previous.map((i) =>
        String(i.productId) === prodIdStr
          ? {
              ...i,
              quantity: newQuantity,
            }
          : i
      )
    );
  };

  // --------------------------------------------------
  // Increase Quantity (+)
  // --------------------------------------------------
  const increaseQuantity = (productId) => {
    const prodIdStr = String(productId);
    const item = items.find((i) => String(i.productId) === prodIdStr);
    if (!item) return;

    const currentQty = Number(item.quantity) || 0;
    updateQuantity(productId, currentQty + 1);
  };

  // --------------------------------------------------
  // Decrease Quantity (-)
  // --------------------------------------------------
  const decreaseQuantity = (productId) => {
    const prodIdStr = String(productId);
    const item = items.find((i) => String(i.productId) === prodIdStr);
    if (!item) return;

    const currentQty = Number(item.quantity) || 1;

    if (currentQty <= 1) {
      removeItem(productId);
      return;
    }

    updateQuantity(productId, currentQty - 1);
  };

  // --------------------------------------------------
  // Remove Item
  // --------------------------------------------------
  const removeItem = (productId) => {
    setItems((previous) =>
      previous.filter((item) => String(item.productId) !== String(productId))
    );
    setError("");
  };

  // --------------------------------------------------
  // Computations
  // --------------------------------------------------
  const subtotal = useMemo(() => {
    return items.reduce(
      (total, item) => total + (item.price || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [items]);

  const totalPurchasePrice = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + (item.purchasePrice || 0) * (Number(item.quantity) || 0),
      0
    );
  }, [items]);

  const discountAmount = useMemo(() => {
    return Number(
      ((subtotal * Number(discountPercent || 0)) / 100).toFixed(2)
    );
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return subtotal - discountAmount;
  }, [subtotal, discountAmount]);

  const totalQuantity = items.reduce(
    (total, item) => total + (Number(item.quantity) || 0),
    0
  );

  // --------------------------------------------------
  // Product Search Filter
  // --------------------------------------------------
  const filteredProducts = useMemo(() => {
    const search = productSearch.toLowerCase().trim();
    if (!search) return [];

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(search) ||
        product.sku?.toLowerCase().includes(search) ||
        product.category?.toLowerCase().includes(search)
      );
    });
  }, [products, productSearch]);

  const handleProductSelect = (product) => {
    if (!product) return;
    addProduct(product);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        productSearchRef.current &&
        !productSearchRef.current.contains(event.target)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDiscountChange = (value) => {
    if (value === "") {
      setDiscountPercent("");
      return;
    }

    const number = Number(value);
    if (number < 0) return setDiscountPercent(0);
    if (number > 50) return setDiscountPercent(50);
    setDiscountPercent(number);
  };

  // --------------------------------------------------
  // Submit Update
  // --------------------------------------------------
  const handleUpdateBillClick = () => {
    setError("");
    setSuccess("");

    if (items.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    if (customerPhone && !/^\d{10}$/.test(customerPhone)) {
      setError("Customer phone number must contain exactly 10 digits.");
      return;
    }

    handleUpdateSubmit();
  };

  const handleUpdateSubmit = async () => {
    setError("");
    setSuccess("");

    const finalDiscountPercent = Number(discountPercent) || 0;
    if (finalDiscountPercent < 0 || finalDiscountPercent > 50) {
      setError("Discount percentage must be between 0% and 50%.");
      return;
    }

    try {
      setSaving(true);

      const finalDiscountAmount = Number(
        ((subtotal * finalDiscountPercent) / 100).toFixed(2)
      );

      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          quantity: Number(item.quantity) || 1,
          price: item.price,
        })),
        discount: finalDiscountAmount,
        paymentMethod,
      };

      await api.put(`/bills/${id}`, payload);

      setSuccess("Bill updated successfully.");

      setTimeout(() => {
        navigate(`/billing/${id}`);
      }, 800);
    } catch (err) {
      console.error("Update Bill Error:", err);
      setError(
        err.response?.data?.message || "Failed to update bill."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-gray-500">
        Loading bill details...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Bill
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Modify items, customer info, or discounts for this bill.
        </p>
      </div>

      {/* Error / Success Alerts */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateBillClick();
        }}
      >
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
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Customer Phone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Products Search & Selection */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Products
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Search and select additional products.
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {products.length} products available
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div ref={productSearchRef} className="relative">
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Product
                  </label>

                  <div className="relative">
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => {
                        if (productSearch.trim()) setShowProductDropdown(true);
                      }}
                      placeholder="Search product name, SKU or category..."
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-10 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    {productSearch && (
                      <button
                        type="button"
                        onClick={() => {
                          setProductSearch("");
                          setShowProductDropdown(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {showProductDropdown && productSearch.trim() && (
                    <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                      {filteredProducts.length > 0 ? (
                        <div className="max-h-72 overflow-y-auto">
                          {filteredProducts.map((product) => {
                            const selectedItem = items.find(
                              (item) => String(item.productId) === String(product._id)
                            );
                            const outOfStock = product.stockQuantity <= 0 && !selectedItem;

                            return (
                              <button
                                key={product._id}
                                type="button"
                                disabled={outOfStock}
                                onClick={() => handleProductSelect(product)}
                                className={`w-full px-4 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition ${
                                  outOfStock
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                      {product.name}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                      SKU: {product.sku} | Category: {product.category}
                                    </p>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      ₹{Number(product.sellingPrice || 0).toFixed(2)}
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
                                        In Bill: {selectedItem.quantity}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-5 text-center text-gray-500 dark:text-gray-400">
                          No products found for "{productSearch}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bill Items Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bill Items
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="p-10 text-center text-gray-500 dark:text-gray-400">
                  No products added to the bill.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Product
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Selling Price
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
                            Purchase Price
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
                              ₹{(item.price || 0).toFixed(2)}
                            </td>

                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                              ₹{(item.purchasePrice || 0).toFixed(2)}
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => decreaseQuantity(item.productId)}
                                  className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition flex items-center justify-center cursor-pointer select-none"
                                >
                                  -
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  max={item.maxAllowedStock}
                                  value={item.quantity}
                                  onChange={(e) =>
                                    updateQuantity(item.productId, e.target.value)
                                  }
                                  className="w-16 text-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-1.5 text-gray-900 dark:text-white"
                                />

                                <button
                                  type="button"
                                  onClick={() => increaseQuantity(item.productId)}
                                  className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold transition flex items-center justify-center cursor-pointer select-none"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">
                              ₹{((item.price || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                            </td>

                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium cursor-pointer"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>

                      {/* Grand Total Footer Row */}
                      <tfoot className="border-t-2 border-gray-300 dark:border-gray-700 bg-gray-50/75 dark:bg-gray-800/60 font-semibold">
                        <tr>
                          <td className="px-6 py-4 text-gray-900 dark:text-white">
                            <div>
                              <span>Grand Total</span>
                              {discountAmount > 0 && (
                                <p className="text-xs font-normal text-red-500">
                                  After ₹{discountAmount.toFixed(2)} discount
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-900 dark:text-white font-bold">
                            ₹{subtotal.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-bold">
                            ₹{totalPurchasePrice.toFixed(2)}
                          </td>

                          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                            {totalQuantity} {totalQuantity !== 1 ? "items" : "item"}
                          </td>

                          <td className="px-6 py-4 text-right text-lg font-bold text-blue-600 dark:text-blue-400">
                            ₹{grandTotal.toFixed(2)}
                          </td>
                          <td className="px-6 py-4"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Mobile List */}
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
                              Selling: ₹{(item.price || 0).toFixed(2)} / {item.unit}
                            </p>
                            <p className="text-xs text-gray-400">
                              Purchased: ₹{(item.purchasePrice || 0).toFixed(2)}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.productId)}
                            className="text-red-600 text-sm shrink-0 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => decreaseQuantity(item.productId)}
                              className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center justify-center select-none cursor-pointer"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={item.maxAllowedStock}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.productId, e.target.value)
                              }
                              className="w-14 text-center rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 text-gray-900 dark:text-white"
                            />

                            <button
                              type="button"
                              onClick={() => increaseQuantity(item.productId)}
                              className="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold flex items-center justify-center select-none cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <span className="font-semibold text-gray-900 dark:text-white">
                            ₹{((item.price || 0) * (Number(item.quantity) || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {/* Mobile Summary */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-3 mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Purchase:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{totalPurchasePrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Total Selling:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Grand Total</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {totalQuantity} {totalQuantity !== 1 ? "items" : "item"}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{grandTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
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
                  <span className="text-gray-500 dark:text-gray-400">Items</span>
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

                {/* Discount Percentage */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="50"
                      step="1"
                      value={discountPercent}
                      onChange={(e) => handleDiscountChange(e.target.value)}
                      placeholder="Enter 0 to 50"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Enter a discount between 0% and 50%.
                  </p>
                </div>

                {/* Discount Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount %</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Number(discountPercent) || 0}%
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Discount Amount</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      - ₹{discountAmount.toFixed(2)}
                    </span>
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
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                {/* Save Changes */}
                <button
                  type="submit"
                  disabled={saving || items.length === 0}
                  className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:bg-gray-300 disabled:cursor-not-allowed dark:disabled:bg-gray-700 cursor-pointer"
                >
                  {saving ? "Updating Bill..." : "Update Bill"}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => navigate(`/billing/${id}`)}
                  disabled={saving}
                  className="w-full py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
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

export default EditBill;