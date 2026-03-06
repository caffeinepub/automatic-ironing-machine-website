import { useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Shield, User } from "lucide-react";
import { useState } from "react";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "airon2024";

export const ADMIN_SESSION_KEY = "airon_admin_session";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate a brief check delay
    await new Promise((res) => setTimeout(res, 600));

    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("Invalid username or password. Please try again.");
      setIsLoading(false);
      return;
    }

    // Store session — the password itself is the token for backend calls
    try {
      localStorage.setItem(ADMIN_SESSION_KEY, ADMIN_PASSWORD);
      sessionStorage.setItem(ADMIN_SESSION_KEY, ADMIN_PASSWORD);
    } catch {
      // ignore storage errors
    }

    setIsLoading(false);
    void navigate({ to: "/admin/dashboard" });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0d0d1a" }}
      data-ocid="admin.login.page"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #c9a227, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #c9a227, transparent)",
          }}
        />
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "#13132b",
          border: "1px solid #2a2a4a",
          boxShadow: "0 24px 80px rgba(201,162,39,0.08)",
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/assets/uploads/AIron-1.jpg"
              alt="AIron"
              className="w-16 h-16 rounded-2xl object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{
              color: "#e2e8f0",
              fontFamily: "'Sora', 'Outfit', sans-serif",
            }}
          >
            AI<span style={{ color: "#c9a227" }}>ron</span> Admin
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-0.5 mx-auto mb-8 rounded-full"
          style={{ background: "#c9a227" }}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-username"
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "#94a3b8" }}
            >
              Username
            </label>
            <div className="relative">
              <User
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#64748b" }}
              />
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter username"
                data-ocid="admin.login.input"
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg outline-none transition-all"
                style={{
                  background: "#0d0d1a",
                  border: `1px solid ${error ? "#ef4444" : "#2a2a4a"}`,
                  color: "#e2e8f0",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "#c9a227";
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = "#2a2a4a";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "#94a3b8" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#64748b" }}
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                data-ocid="admin.password.input"
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg outline-none transition-all"
                style={{
                  background: "#0d0d1a",
                  border: `1px solid ${error ? "#ef4444" : "#2a2a4a"}`,
                  color: "#e2e8f0",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "#c9a227";
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = "#2a2a4a";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#64748b" }}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="rounded-lg px-3 py-2.5 text-xs"
              style={{
                background: "#ef44441a",
                border: "1px solid #ef444430",
                color: "#ef4444",
              }}
              data-ocid="admin.login.error_state"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!username.trim() || !password || isLoading}
            data-ocid="admin.login.primary_button"
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            style={{
              background: "linear-gradient(135deg, #c9a227, #e8c04a)",
              color: "#0d0d1a",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <Shield size={16} />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Back to main site */}
        <div className="mt-6 text-center">
          <a
            href="/"
            data-ocid="admin.login.link"
            className="text-xs transition-colors"
            style={{ color: "#475569" }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.color = "#64748b";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.color = "#475569";
            }}
          >
            ← Back to AIron Store
          </a>
        </div>
      </div>
    </div>
  );
}
