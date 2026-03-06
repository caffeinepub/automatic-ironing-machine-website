import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Key, Loader2, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

export default function AdminLoginPage() {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [adminToken, setAdminToken] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupError, setSetupError] = useState("");

  // Once logged in + actor ready, check admin status
  useEffect(() => {
    if (!identity || actorFetching || !actor || adminChecked) return;
    setCheckingAdmin(true);
    actor
      .isCallerAdmin()
      .then((result) => {
        setIsAdmin(result);
        setAdminChecked(true);
        setCheckingAdmin(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setAdminChecked(true);
        setCheckingAdmin(false);
      });
  }, [identity, actor, actorFetching, adminChecked]);

  // Redirect if confirmed admin
  useEffect(() => {
    if (isAdmin === true) {
      void navigate({ to: "/admin/dashboard" });
    }
  }, [isAdmin, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (err: unknown) {
      const error = err as Error;
      if (error?.message === "User is already authenticated") {
        setAdminChecked(false); // trigger re-check
      }
    }
  };

  const handleSwitchAccount = () => {
    setIsAdmin(null);
    setAdminChecked(false);
    clear();
  };

  const handleSetupAdmin = async () => {
    if (!actor || !adminToken.trim()) return;
    setIsSettingUp(true);
    setSetupError("");
    try {
      await actor._initializeAccessControlWithSecret(adminToken.trim());
      // Re-check admin status after setup
      setAdminChecked(false);
      setIsAdmin(null);
    } catch (err: unknown) {
      const error = err as Error;
      setSetupError(
        error?.message?.includes("CAFFEINE_ADMIN_TOKEN")
          ? "Server configuration error. Contact support."
          : error?.message?.includes("already")
            ? "Admin has already been initialized. Try signing in with a different account."
            : "Invalid admin token. Please check and try again.",
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const isLoading =
    isLoggingIn || isInitializing || checkingAdmin || actorFetching;

  // Show denied state if logged in but not admin
  if (identity && adminChecked && isAdmin === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "#0d0d1a" }}
        data-ocid="admin.login.page"
      >
        <div
          className="w-full max-w-sm rounded-2xl p-8"
          style={{ background: "#13132b", border: "1px solid #2a2a4a" }}
        >
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "#ef44441a", border: "1px solid #ef444430" }}
            >
              <AlertTriangle size={28} style={{ color: "#ef4444" }} />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "#e2e8f0", fontFamily: "'Sora', sans-serif" }}
            >
              Access Denied
            </h2>
            <p className="text-sm mb-4" style={{ color: "#64748b" }}>
              Your account does not have administrator privileges.
            </p>
          </div>

          {/* First-time setup */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{ background: "#0d0d1a", border: "1px solid #2a2a4a" }}
          >
            <button
              type="button"
              onClick={() => setShowSetup(!showSetup)}
              className="w-full flex items-center justify-between text-sm font-medium"
              style={{ color: "#94a3b8" }}
            >
              <span className="flex items-center gap-2">
                <Key size={14} style={{ color: "#6366f1" }} />
                First-time admin setup
              </span>
              <span style={{ color: "#475569" }}>{showSetup ? "▲" : "▼"}</span>
            </button>
            {showSetup && (
              <div className="mt-3 space-y-3">
                <p className="text-xs" style={{ color: "#64748b" }}>
                  Enter the Caffeine admin token provided to you during
                  deployment to initialize your account as admin.
                </p>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => {
                    setAdminToken(e.target.value);
                    setSetupError("");
                  }}
                  placeholder="Admin token"
                  data-ocid="admin.login.input"
                  className="w-full px-3 py-2 text-sm rounded-lg outline-none"
                  style={{
                    background: "#13132b",
                    border: `1px solid ${setupError ? "#ef4444" : "#2a2a4a"}`,
                    color: "#e2e8f0",
                  }}
                />
                {setupError && (
                  <p className="text-xs" style={{ color: "#ef4444" }}>
                    {setupError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSetupAdmin}
                  disabled={isSettingUp || !adminToken.trim()}
                  data-ocid="admin.login.primary_button"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 disabled:opacity-50"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    color: "#fff",
                  }}
                >
                  {isSettingUp ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Setting up…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} />
                      Initialize Admin
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            data-ocid="admin.login.secondary_button"
            onClick={handleSwitchAccount}
            className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ background: "#1e1e3f", color: "#94a3b8" }}
          >
            Try a Different Account
          </button>
        </div>
      </div>
    );
  }

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
            background: "radial-gradient(circle, #6366f1, transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent)",
          }}
        />
      </div>

      <div
        className="relative w-full max-w-sm rounded-2xl p-8"
        style={{
          background: "#13132b",
          border: "1px solid #2a2a4a",
          boxShadow: "0 24px 80px rgba(99,102,241,0.12)",
        }}
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            }}
          >
            <ShieldCheck size={30} style={{ color: "#fff" }} />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-1"
            style={{
              color: "#e2e8f0",
              fontFamily: "'Sora', 'Outfit', sans-serif",
            }}
          >
            AI<span style={{ color: "#6366f1" }}>ron</span> Admin
          </h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Secure administrator access
          </p>
        </div>

        {/* Divider */}
        <div
          className="w-12 h-0.5 mx-auto mb-8 rounded-full"
          style={{ background: "#6366f1" }}
        />

        {/* Status when logged in but checking */}
        {identity && isLoading && (
          <div
            className="rounded-lg p-4 mb-6 flex items-center gap-3"
            style={{ background: "#1e1e3f", border: "1px solid #2a2a4a" }}
            data-ocid="admin.login.loading_state"
          >
            <Loader2
              size={16}
              className="animate-spin shrink-0"
              style={{ color: "#6366f1" }}
            />
            <p className="text-sm" style={{ color: "#94a3b8" }}>
              Verifying administrator privileges…
            </p>
          </div>
        )}

        {/* Login button */}
        {!identity && (
          <button
            type="button"
            data-ocid="admin.login.primary_button"
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isLoading
                ? "#4f4ff0"
                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Authenticating…
              </>
            ) : (
              <>
                <Shield size={16} />
                Sign In with Internet Identity
              </>
            )}
          </button>
        )}

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

        {/* Security note */}
        <div
          className="mt-6 rounded-lg p-3 flex items-start gap-2"
          style={{ background: "#0d0d1a", border: "1px solid #1e1e3f" }}
        >
          <Shield
            size={13}
            className="shrink-0 mt-0.5"
            style={{ color: "#6366f1" }}
          />
          <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
            Secured by Internet Identity. Only designated administrators can
            access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}
