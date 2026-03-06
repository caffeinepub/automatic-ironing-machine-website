import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Loader2, Shield, Star, Zap } from "lucide-react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: "/product" });
    }
  }, [identity, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === "User is already authenticated") {
        navigate({ to: "/product" });
      }
    }
  };

  const isLoading = isLoggingIn || isInitializing;

  return (
    <div className="min-h-screen flex flex-col hero-gradient overflow-x-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.12 75), transparent)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-48 md:w-64 h-48 md:h-64 rounded-full opacity-5"
          style={{
            background:
              "radial-gradient(circle, oklch(0.72 0.12 75), transparent)",
          }}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* Left: Hero Image */}
        <div className="lg:w-1/2 relative overflow-hidden">
          <img
            src="/assets/generated/ironing-machine-hero.dim_1400x800.png"
            alt="AIron Automatic Ironing Machine"
            className="w-full h-48 sm:h-64 lg:h-full object-cover opacity-60"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, transparent, oklch(0.08 0.008 260 / 0.8))",
            }}
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-16">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4 md:gap-6">
                {[
                  { icon: Zap, label: "AI-Powered" },
                  { icon: Shield, label: "Auto-Safe" },
                  { icon: Star, label: "Premium" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={14} className="gold-text" />
                    <span
                      className="text-xs tracking-widest uppercase"
                      style={{ color: "oklch(0.75 0.005 260)" }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center p-6 md:p-8 lg:p-16">
          <div className="w-full max-w-md space-y-8 md:space-y-10">
            {/* Logo & Brand */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <img
                  src="/assets/generated/ironpro-logo.dim_256x256.png"
                  alt="AIron"
                  className="h-16 w-16 md:h-20 md:w-20 object-contain"
                />
              </div>
              <div>
                <h1
                  className="font-serif text-3xl md:text-4xl font-bold tracking-tight"
                  style={{ color: "oklch(0.96 0.005 85)" }}
                >
                  AI<span className="gold-text">ron</span>
                </h1>
                <p
                  className="mt-2 text-sm tracking-widest uppercase"
                  style={{ color: "oklch(0.6 0.005 260)" }}
                >
                  Automatic Ironing Machine
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="section-divider" />

            {/* Welcome text */}
            <div className="text-center space-y-3">
              <h2
                className="font-serif text-xl md:text-2xl font-semibold"
                style={{ color: "oklch(0.96 0.005 85)" }}
              >
                Welcome Back
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.6 0.005 260)" }}
              >
                Sign in to explore the future of garment care. Experience
                precision ironing, reimagined.
              </p>
            </div>

            {/* Login Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full btn-gold flex items-center justify-center gap-3 py-4 text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none min-h-[52px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Shield size={16} />
                    <span>Sign In Securely</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate({ to: "/product" })}
                className="w-full btn-outline-gold flex items-center justify-center gap-3 py-4 text-sm min-h-[52px]"
              >
                <span>Continue as Guest</span>
                <ArrowRight size={16} />
              </button>

              <p
                className="text-center text-xs leading-relaxed"
                style={{ color: "oklch(0.45 0.005 260)" }}
              >
                Secured by Internet Identity — your privacy is protected.
                <br />
                No passwords. No tracking.
              </p>
            </div>

            {/* Features preview */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
              {[
                { value: "99%", label: "Wrinkle-Free" },
                { value: "3×", label: "Faster" },
                { value: "0", label: "Effort" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-serif text-lg md:text-xl font-bold gold-text">
                    {value}
                  </div>
                  <div
                    className="text-xs tracking-wider uppercase mt-1"
                    style={{ color: "oklch(0.5 0.005 260)" }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
