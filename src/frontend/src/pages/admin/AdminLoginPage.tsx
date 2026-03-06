import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createActorWithConfig } from "../../config";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";
import { getSecretParameter } from "../../utils/urlParams";

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "airon2024";

type LoginStep = "credentials" | "ii-login" | "initializing" | "done" | "error";

/**
 * Persist the admin token so it survives page refreshes and navigation.
 * We store it in BOTH sessionStorage and localStorage.
 */
function persistAdminToken(token: string): void {
  if (!token) return;
  try {
    sessionStorage.setItem("caffeineAdminToken", token);
    localStorage.setItem("caffeineAdminToken", token);
  } catch {
    // Ignore storage errors
  }
}

/**
 * Read the admin token from all sources (URL hash → sessionStorage → localStorage).
 */
function readAdminToken(): string {
  return (
    getSecretParameter("caffeineAdminToken") ||
    sessionStorage.getItem("caffeineAdminToken") ||
    localStorage.getItem("caffeineAdminToken") ||
    ""
  );
}

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { identity, login: iiLogin, isLoggingIn } = useInternetIdentity();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<LoginStep>("credentials");
  const initializingRef = useRef(false);

  // On mount: extract & persist admin token from URL so it's available for all calls
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount to extract URL token
  useEffect(() => {
    const token = readAdminToken();
    if (token) {
      persistAdminToken(token);
    }
    // If already has a valid admin session AND II identity, go straight to dashboard
    if (localStorage.getItem("adminSession") === "true" && identity) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, []); // intentionally run once on mount

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.trim() !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      setError("Invalid username or password. Please try again.");
      return;
    }

    // Credentials valid — check if II identity is already available
    if (identity) {
      void initializeAdmin(identity);
    } else {
      // Need to sign in with Internet Identity
      setStep("ii-login");
      // Auto-trigger II login
      iiLogin();
    }
  };

  const initializeAdmin = async (
    providedIdentity: typeof identity,
  ): Promise<void> => {
    if (!providedIdentity) return;
    if (initializingRef.current) return;
    initializingRef.current = true;
    setStep("initializing");

    try {
      const adminToken = readAdminToken();

      const actor = await createActorWithConfig({
        agentOptions: { identity: providedIdentity },
      });

      // Initialize/register this principal as admin using the token
      await actor._initializeAccessControlWithSecret(adminToken);

      // Verify they actually have admin access now
      const isAdmin = await actor.isCallerAdmin();
      if (!isAdmin) {
        setError(
          "Access denied. This Internet Identity account is not authorized as admin. Please use the designated admin account.",
        );
        setStep("error");
        initializingRef.current = false;
        return;
      }

      // Persist the session and token for future visits
      persistAdminToken(adminToken);
      localStorage.setItem("adminSession", "true");

      setStep("done");
      setTimeout(() => {
        void navigate({ to: "/admin/dashboard" });
      }, 800);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown error during setup";
      setError(`Admin initialization failed: ${msg}`);
      setStep("error");
      initializingRef.current = false;
    }
  };

  // Watch for II identity arriving while we're on the ii-login step
  // biome-ignore lint/correctness/useExhaustiveDependencies: initializeAdmin is stable (uses refs internally)
  useEffect(() => {
    if (
      step === "ii-login" &&
      identity &&
      !isLoggingIn &&
      !initializingRef.current
    ) {
      void initializeAdmin(identity);
    }
  }, [identity, isLoggingIn, step]);

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
            {step === "credentials" && "Sign in to access the admin panel"}
            {step === "ii-login" && "Opening Internet Identity…"}
            {step === "initializing" && "Verifying admin access…"}
            {step === "done" && "Access granted — redirecting…"}
            {step === "error" && "Authentication failed"}
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-0.5 mx-auto mb-8 rounded-full"
          style={{ background: "#c9a227" }}
        />

        {/* ---- STEP: CREDENTIALS ---- */}
        {step === "credentials" && (
          <form onSubmit={handleCredentials} className="space-y-4">
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
              disabled={!username.trim() || !password}
              data-ocid="admin.login.primary_button"
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e8c04a)",
                color: "#0d0d1a",
              }}
            >
              <Shield size={16} />
              Sign In
            </button>

            <p className="text-center text-xs" style={{ color: "#475569" }}>
              After entering credentials, you'll be asked to sign in with
              Internet Identity to confirm your admin access.
            </p>
          </form>
        )}

        {/* ---- STEP: II LOGIN ---- */}
        {step === "ii-login" && (
          <div className="space-y-5 text-center">
            <div
              className="rounded-xl p-4"
              style={{
                background: "#0d0d1a",
                border: "1px solid #2a2a4a",
              }}
            >
              <p className="text-sm mb-1" style={{ color: "#e2e8f0" }}>
                Credentials verified ✓
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#64748b" }}
              >
                Please complete the Internet Identity sign-in popup to verify
                your admin account. This is a security requirement.
              </p>
            </div>

            {error && (
              <div
                className="rounded-lg px-3 py-2.5 text-xs text-left"
                style={{
                  background: "#ef44441a",
                  border: "1px solid #ef444430",
                  color: "#ef4444",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="button"
              data-ocid="admin.login.primary_button"
              onClick={() => iiLogin()}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e8c04a)",
                color: "#0d0d1a",
              }}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Opening Internet Identity…
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Sign In with Internet Identity
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError("");
              }}
              className="text-xs transition-colors"
              style={{ color: "#475569" }}
            >
              ← Back to credentials
            </button>
          </div>
        )}

        {/* ---- STEP: INITIALIZING ---- */}
        {(step === "initializing" || step === "done") && (
          <div className="flex flex-col items-center gap-5 py-4">
            {step === "done" ? (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ background: "#10b98120", border: "2px solid #10b981" }}
              >
                <CheckCircle2 size={28} style={{ color: "#10b981" }} />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: "#c9a22715",
                  border: "2px solid #c9a22740",
                }}
              >
                <Loader2
                  size={24}
                  className="animate-spin"
                  style={{ color: "#c9a227" }}
                />
              </div>
            )}
            <div className="text-center">
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "#e2e8f0" }}
              >
                {step === "done"
                  ? "Admin access confirmed!"
                  : "Verifying admin role…"}
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {step === "done"
                  ? "Redirecting to dashboard…"
                  : "Please wait while we confirm your admin access."}
              </p>
            </div>
          </div>
        )}

        {/* ---- STEP: ERROR ---- */}
        {step === "error" && (
          <div className="space-y-4 text-center">
            <div
              className="rounded-lg px-4 py-3 text-sm text-left"
              style={{
                background: "#ef44441a",
                border: "1px solid #ef444430",
                color: "#ef4444",
              }}
              data-ocid="admin.login.error_state"
            >
              {error}
            </div>
            <button
              type="button"
              onClick={() => {
                setStep("credentials");
                setError("");
                initializingRef.current = false;
              }}
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #c9a227, #e8c04a)",
                color: "#0d0d1a",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Back to main site */}
        {step === "credentials" && (
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
        )}

        {/* Security note */}
        {step === "credentials" && (
          <div
            className="mt-4 rounded-lg p-3 flex items-start gap-2"
            style={{ background: "#0d0d1a", border: "1px solid #1e1e3f" }}
          >
            <Shield
              size={13}
              className="shrink-0 mt-0.5"
              style={{ color: "#c9a227" }}
            />
            <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
              Admin access requires both credentials and Internet Identity
              verification for security. Your session will be saved after the
              first login.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
