import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const canvasRef = useRef(null);

  // Reference container for spawning spark particles directly onto canvas
  const crackerEngineRef = useRef(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------------
  // Cracker / Fireworks Canvas Animation Engine
  // ---------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const rockets = [];
    const particles = [];

    const crackerColors = [
      "#166534", // green-800
      "#15803d", // green-700
      "#22c55e", // green-500
      "#4ade80", // green-400
      "#86efac", // green-300
      "#a3e635", // lime-400
      "#fef08a", // spark flash
      "#ffffff", // flash white
    ];

    class Rocket {
      constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = height * 0.15 + Math.random() * (height * 0.35);
        this.speed = 7 + Math.random() * 5;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.25;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.color = crackerColors[Math.floor(Math.random() * crackerColors.length)];
        this.trail = [];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;

        if (this.y <= this.targetY || this.vy >= 0) {
          this.explode();
          return false;
        }
        return true;
      }

      draw() {
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          ctx.strokeStyle = `rgba(134, 239, 172, ${i / this.trail.length})`;
          ctx.lineWidth = 2;
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#4ade80";
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      explode() {
        const particleCount = 45 + Math.floor(Math.random() * 35);
        for (let i = 0; i < particleCount; i++) {
          particles.push(new Particle(this.x, this.y, this.color));
        }
      }
    }

    class Particle {
      constructor(x, y, color, speedMultiplier = 1, decayRate = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 4 + 1.5) * speedMultiplier;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = decayRate || (Math.random() * 0.018 + 0.014);
        this.gravity = 0.08;
        this.friction = 0.96;
      }

      update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(this.alpha, 0);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }

    // Expose particle triggering directly for typing events
    crackerEngineRef.current = {
      spawnSparkBurst: (x, y) => {
        const sparkCount = 18;
        for (let i = 0; i < sparkCount; i++) {
          const color = crackerColors[Math.floor(Math.random() * crackerColors.length)];
          particles.push(new Particle(x, y, color, 1.2, 0.035));
        }
      },
    };

    let frameCount = 0;

    const render = () => {
      ctx.fillStyle = "rgba(3, 7, 18, 0.22)";
      ctx.fillRect(0, 0, width, height);

      frameCount++;
      if (frameCount % 30 === 0) {
        rockets.push(new Rocket());
      }
      if (frameCount % 75 === 0) {
        rockets.push(new Rocket());
        rockets.push(new Rocket());
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        if (!rockets[i].update()) {
          rockets.splice(i, 1);
        } else {
          rockets[i].draw();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw();
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

  // Trigger spark explosion at the active input element
  const triggerTypingSpark = (event) => {
    if (!crackerEngineRef.current) return;
    const rect = event.target.getBoundingClientRect();
    // Burst originates near the cursor/right side of the input field
    const spawnX = rect.left + Math.min(rect.width * 0.45 + (event.target.value.length * 8), rect.width - 25);
    const spawnY = rect.top + rect.height / 2;

    crackerEngineRef.current.spawnSparkBurst(spawnX, spawnY);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    triggerTypingSpark(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login(formData.email, formData.password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error);
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-950 px-4 overflow-hidden">
      {/* Background Canvas for Crackers, Rockets & Typing Sparks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* Cracker Glow CSS Effects */}
      <style>{`
        @keyframes cracker-glow {
          0%, 100% {
            text-shadow: 0 0 10px rgba(74, 222, 128, 0.7), 0 0 20px rgba(34, 197, 94, 0.8);
          }
          50% {
            text-shadow: 0 0 18px rgba(134, 239, 172, 1), 0 0 32px rgba(74, 222, 128, 0.9), 0 0 45px rgba(22, 101, 52, 1);
          }
        }
        .animate-cracker-glow {
          animation: cracker-glow 2.2s ease-in-out infinite;
        }

        /* Input Cracker Spark Flash Animation */
        @keyframes input-spark-flash {
          0% {
            box-shadow: 0 0 0px rgba(74, 222, 128, 0);
          }
          50% {
            box-shadow: 0 0 14px rgba(74, 222, 128, 0.8), 0 0 24px rgba(34, 197, 94, 0.5);
          }
          100% {
            box-shadow: 0 0 4px rgba(74, 222, 128, 0.3);
          }
        }
        .input-spark-active:focus {
          animation: input-spark-flash 0.4s ease-out;
        }
      `}</style>

      {/* Login Card: Dark Glassmorphism Container */}
      <div className="relative z-10 w-full max-w-md bg-gray-900/65 backdrop-blur-xl rounded-2xl shadow-2xl border border-green-800/40 p-8 shadow-black/80">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            {/* Sparkle halo behind logo */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-green-800 via-green-600 to-emerald-400 opacity-75 blur-md animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-green-800 flex items-center justify-center font-black text-2xl text-orange-300 shadow-lg border border-green-600 animate-cracker-glow">
              KDF
            </div>
          </div>

          {/* Title */}
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-green-400 animate-spin" style={{ animationDuration: "5s" }} />
            <h1 className="text-2xl sm:text-3xl font-black text-orange-200 tracking-wide animate-cracker-glow">
              KanakaDurga Fireworks
            </h1>
            <Sparkles className="w-5 h-5 text-green-400 animate-spin" style={{ animationDuration: "5s" }} />
          </div>

          <p className="mt-2 text-sm text-gray-400">
            Sign in to your billing account
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-950/60 border border-red-800 text-red-300 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onKeyDown={triggerTypingSpark}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-800 bg-gray-950/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 input-spark-active transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400/60 pointer-events-none">
                ✨
              </span>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onKeyDown={triggerTypingSpark}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-800 bg-gray-950/70 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-600 input-spark-active transition"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400/60 pointer-events-none">
                🧨
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-green-800 hover:bg-green-700 active:bg-green-900 text-white font-semibold shadow-lg shadow-green-950/80 border border-green-600/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{loading ? "Signing in..." : "Sign In"}</span>
            <Sparkles size={16} className="text-green-300" />
          </button>
        </form>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          ✨ Cracker Billing Management System ✨
        </p>
      </div>
    </div>
  );
};

export default Login;