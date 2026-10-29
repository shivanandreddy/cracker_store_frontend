import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Users, Circle, RefreshCw, Clock } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const canvasRef = useRef(null);

  const [billingSummary, setBillingSummary] = useState([]);
  const [loadingBilling, setLoadingBilling] = useState(false);
  const [billingError, setBillingError] = useState("");

  // Online Active Users state
  const [activeUsers, setActiveUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState("");

  // ---------------------------------------------------------
  // Ambient Fireworks / Cracker Sparkles Canvas
  // ---------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const crackerColors = ["#166534", "#22c55e", "#4ade80", "#86efac", "#a3e635", "#fde047"];

    class CrackerBurst {
      constructor(x, y) {
        this.x = x || Math.random() * width;
        this.y = y || Math.random() * (height * 0.45);
        this.particles = [];
        const count = 25 + Math.floor(Math.random() * 20);
        const color = crackerColors[Math.floor(Math.random() * crackerColors.length)];

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 3 + 1;
          this.particles.push({
            x: this.x,
            y: this.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color,
            alpha: 1,
            decay: Math.random() * 0.02 + 0.015,
          });
        }
      }

      update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.04;
          p.alpha -= p.decay;
          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
          }
        }
        return this.particles.length > 0;
      }

      draw() {
        this.particles.forEach((p) => {
          ctx.save();
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.restore();
        });
      }
    }

    let frameCount = 0;
    const bursts = [];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      frameCount++;
      if (frameCount % 60 === 0) {
        bursts.push(new CrackerBurst());
      }

      for (let i = bursts.length - 1; i >= 0; i--) {
        if (!bursts[i].update()) {
          bursts.splice(i, 1);
        } else {
          bursts[i].draw();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ---------------------------------------------------------
  // Fetch Active Logged-in Users
  // ---------------------------------------------------------
  const fetchActiveUsers = async () => {
    try {
      setLoadingUsers(true);
      setUserError("");
      const response = await api.get("/auth/active-users");
      setActiveUsers(response.data.activeUsers || []);
      setAllUsers(response.data.allUsers || []);
    } catch (err) {
      console.error("Fetch Active Users Error:", err);
      setUserError("Failed to fetch online users.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActiveUsers();
      // Auto-refresh active users count every 30 seconds
      const interval = setInterval(fetchActiveUsers, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // ---------------------------------------------------------
  // Fetch Billing Summary
  // ---------------------------------------------------------
  useEffect(() => {
    const fetchBillingSummary = async () => {
      if (user?.role !== "admin" && user?.role !== "user") {
        return;
      }

      try {
        setLoadingBilling(true);
        setBillingError("");

        const response = await api.get("/bills");
        const bills = response.data.bills || [];

        const userWiseBilling = {};

        bills.forEach((bill) => {
          const createdBy = bill.createdBy;
          if (!createdBy?._id) return;

          const userId = createdBy._id;
          const paymentMethod = String(bill.paymentMethod || "")
            .trim()
            .toLowerCase();
          const billAmount = Number(bill.grandTotal || 0);

          if (!userWiseBilling[userId]) {
            userWiseBilling[userId] = {
              userId: createdBy._id,
              userName: createdBy.name,
              email: createdBy.email,
              role: createdBy.role,
              totalBills: 0,
              creditBills: 0,
              cashBills: 0,
              upiBills: 0,
              cardBills: 0,
              totalAmount: 0,
              creditAmount: 0,
              cashAmount: 0,
              upiAmount: 0,
              cardAmount: 0,
              receivedAmount: 0,
            };
          }

          const item = userWiseBilling[userId];
          item.totalBills += 1;
          item.totalAmount += billAmount;

          if (paymentMethod === "credit") {
            item.creditBills += 1;
            item.creditAmount += billAmount;
          } else if (paymentMethod === "cash") {
            item.cashBills += 1;
            item.cashAmount += billAmount;
          } else if (paymentMethod === "upi") {
            item.upiBills += 1;
            item.upiAmount += billAmount;
          } else if (paymentMethod === "card") {
            item.cardBills += 1;
            item.cardAmount += billAmount;
          }
        });

        Object.values(userWiseBilling).forEach((item) => {
          item.receivedAmount = item.totalAmount - item.creditAmount;
        });

        const summary = Object.values(userWiseBilling);
        summary.sort((a, b) => b.totalAmount - a.totalAmount);

        setBillingSummary(summary);
      } catch (error) {
        console.error("Billing Summary Error:", error);
        setBillingError(
          error.response?.data?.message || "Failed to load billing summary."
        );
      } finally {
        setLoadingBilling(false);
      }
    };

    if (user) {
      fetchBillingSummary();
    }
  }, [user]);

  const grandTotals = {
    totalBills: billingSummary.reduce(
      (total, item) => total + (Number(item.totalBills) || 0),
      0
    ),
    creditBills: billingSummary.reduce(
      (total, item) => total + (Number(item.creditBills) || 0),
      0
    ),
    cashBills: billingSummary.reduce(
      (total, item) => total + (Number(item.cashBills) || 0),
      0
    ),
    upiBills: billingSummary.reduce(
      (total, item) => total + (Number(item.upiBills) || 0),
      0
    ),
    cardBills: billingSummary.reduce(
      (total, item) => total + (Number(item.cardBills) || 0),
      0
    ),
    totalAmount: billingSummary.reduce(
      (total, item) => total + (Number(item.totalAmount) || 0),
      0
    ),
    creditAmount: billingSummary.reduce(
      (total, item) => total + (Number(item.creditAmount) || 0),
      0
    ),
    cashAmount: billingSummary.reduce(
      (total, item) => total + (Number(item.cashAmount) || 0),
      0
    ),
    upiAmount: billingSummary.reduce(
      (total, item) => total + (Number(item.upiAmount) || 0),
      0
    ),
    cardAmount: billingSummary.reduce(
      (total, item) => total + (Number(item.cardAmount) || 0),
      0
    ),
  };

  grandTotals.receivedAmount =
    grandTotals.totalAmount - grandTotals.creditAmount;

  const formatLastActive = (date) => {
    if (!date) return "Never";
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="relative min-h-full">
      {/* Background Cracker Sparkles Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0 w-full h-full"
      />

      <style>{`
        @keyframes fire-glow {
          0%, 100% {
            text-shadow: 0 0 6px rgba(34, 197, 94, 0.6), 0 0 14px rgba(22, 101, 52, 0.7);
          }
          50% {
            text-shadow: 0 0 12px rgba(74, 222, 128, 0.9), 0 0 24px rgba(34, 197, 94, 0.8), 0 0 32px rgba(22, 101, 52, 0.9);
          }
        }
        .animate-fire-glow {
          animation: fire-glow 2.5s ease-in-out infinite;
        }
      `}</style>

      <div className="relative z-10 space-y-8">
        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
                Dashboard
              </h1>
              <span className="text-xl animate-bounce">✨</span>
            </div>

            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Welcome,{" "}
              <span className="font-semibold text-green-700 dark:text-green-400 capitalize">
                {user?.name}
              </span>
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100/70 dark:bg-green-950/40 border border-green-300 dark:border-green-800 text-green-800 dark:text-green-400 text-xs font-semibold shadow-xs">
            <Sparkles size={14} className="text-green-600 dark:text-green-400 animate-spin" style={{ animationDuration: "6s" }} />
            <span>Kanakadurga Fireworks Active</span>
          </div>
        </div>

        {/* ==========================================
            ACTIVE USERS ONLINE PANEL
        ========================================== */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <Users size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Active Users Online
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                    {activeUsers.length} Online
                  </span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Real-time active sessions across staff and operators
                </p>
              </div>
            </div>

            <button
              onClick={fetchActiveUsers}
              disabled={loadingUsers}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition cursor-pointer"
              title="Refresh online status"
            >
              <RefreshCw size={15} className={loadingUsers ? "animate-spin" : ""} />
            </button>
          </div>

          {userError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-3">{userError}</p>
          )}

          {/* Active Users Horizontal Scroll / Grid */}
          <div className="mt-4">
            {allUsers.length === 0 && !loadingUsers ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">
                No registered users found.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {allUsers.map((u) => {
                  const isOnline = activeUsers.some((act) => act._id === u._id);

                  return (
                    <div
                      key={u._id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isOnline
                          ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300/80 dark:border-emerald-800/60 shadow-xs"
                          : "bg-gray-50/50 dark:bg-gray-800/40 border-gray-200/70 dark:border-gray-800/70 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar with Status Dot */}
                        <div className="relative shrink-0">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isOnline 
                              ? "bg-green-800 text-white" 
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${
                              isOnline ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                        </div>

                        {/* Name and Role */}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize truncate">
                            {u.role}
                          </p>
                        </div>
                      </div>

                      {/* Online status indicator */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isOnline
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          <Circle
                            size={5}
                            className={isOnline ? "fill-emerald-500 text-emerald-500" : "fill-gray-400 text-gray-400"}
                          />
                          {isOnline ? "Online" : "Offline"}
                        </span>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 mt-1">
                          <Clock size={10} />
                          <span>{formatLastActive(u.lastActiveAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            BILLING TABLE
        ========================================== */}
        {(user?.role === "admin" || user?.role === "user") && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  User-wise Billing Details
                </h2>
                <span className="text-base animate-pulse">🎆</span>
              </div>
            </div>

            {loadingBilling && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Loading billing summary...
                </p>
              </div>
            )}

            {!loadingBilling && billingError && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-900 p-6">
                <p className="text-red-600 dark:text-red-400">{billingError}</p>
              </div>
            )}

            {!loadingBilling && !billingError && billingSummary.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No bills have been created yet.
                </p>
              </div>
            )}

            {!loadingBilling && !billingError && billingSummary.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          #
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          User
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                          Bills
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-center text-[10px] sm:text-xs font-semibold uppercase text-red-500">
                          Credit
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-red-500">
                          Credit Amount
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-emerald-500">
                          Received Amount
                        </th>
                        <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold uppercase text-blue-500">
                          Total Amount
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {billingSummary.map((item, index) => (
                        <tr
                          key={item.userId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                        >
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3">
                            <p className="font-medium text-xs sm:text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                              {item.userName}
                            </p>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {item.totalBills}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-center">
                            <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                              {item.creditBills}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                            <span className="font-bold text-xs sm:text-sm text-red-600 dark:text-red-400">
                              ₹{Number(item.creditAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                            <span className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                              ₹{Number(item.receivedAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="px-2 py-2 sm:px-4 sm:py-3 text-right">
                            <span className="font-bold text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                              ₹{Number(item.totalAmount || 0).toLocaleString("en-IN")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-700">
                        <td className="px-2 py-3 sm:px-4 sm:py-4"></td>
                        <td className="px-2 py-3 sm:px-4 sm:py-4">
                          <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                            GRAND TOTAL
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-blue-200 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {grandTotals.totalBills}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-center">
                          <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-1 rounded-full text-xs font-bold bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                            {grandTotals.creditBills}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-red-600 dark:text-red-400">
                            ₹{grandTotals.creditAmount.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                            ₹{grandTotals.receivedAmount.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-2 py-3 text-right">
                          <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                            ₹{grandTotals.totalAmount.toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            QUICK ACTIONS WITH CRACKER EFFECTS
        ========================================== */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
            <span className="text-sm">🧨</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(user?.role === "admin" || user?.role === "useradmin") && (
              <Link
                to="/products"
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📦
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Inventory
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            {(user?.role === "admin" || user?.role === "user") && (
              <Link
                to="/billing/create"
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg hover:border-green-500 dark:hover:border-green-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    🧾
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Create Bill
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            {(user?.role === "admin" || user?.role === "user") && (
              <Link
                to="/billing"
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    📋
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Bill History
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            {(user?.role === "admin" || user?.role === "useradmin") && (
              <Link
                to="/products/add"
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:shadow-lg hover:border-orange-400 dark:hover:border-orange-500 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    ➕
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Add Product
                    </h3>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;