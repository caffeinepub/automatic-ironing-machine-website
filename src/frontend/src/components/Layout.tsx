import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Layout() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const loggingOutRef = useRef(false);
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const isLoginPage = location.pathname === "/";

  const { data: isAdmin } = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // When identity is cleared after logout, navigate to login page
  useEffect(() => {
    if (loggingOutRef.current && !identity && !isInitializing) {
      loggingOutRef.current = false;
      navigate({ to: "/" });
    }
  }, [identity, isInitializing, navigate]);

  const handleLogout = () => {
    loggingOutRef.current = true;
    queryClient.clear();
    clear();
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: "Product", path: "/product" },
    { label: "Features", path: "/features" },
    { label: "Buy Now", path: "/checkout" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {!isLoginPage && (
        <header
          className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md"
          style={{ background: "oklch(0.1 0.008 260 / 0.95)" }}
        >
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate({ to: "/product" })}
              className="flex items-center gap-2 md:gap-3 group min-h-[44px]"
            >
              <img
                src="/assets/uploads/AIron-1.jpg"
                alt="AIron"
                className="h-8 w-8 md:h-9 md:w-9 object-contain rounded-md"
              />
              <span
                className="font-serif text-lg md:text-xl font-semibold tracking-wide"
                style={{ color: "oklch(0.96 0.005 85)" }}
              >
                AI<span className="gold-text">ron</span>
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive =
                  location.pathname === link.path ||
                  (link.path === "/checkout" &&
                    location.pathname === "/checkout");
                const isCheckout = link.path === "/checkout";
                return (
                  <button
                    type="button"
                    key={link.path}
                    data-ocid={`nav.${link.label.toLowerCase().replace(/\s+/g, "_")}.link`}
                    onClick={() => navigate({ to: link.path as "/" })}
                    className={
                      isCheckout
                        ? `text-sm font-semibold tracking-wider uppercase transition-all duration-200 min-h-[44px] px-5 py-2 rounded-full border ${
                            isActive
                              ? "border-gold-500 text-charcoal-950 bg-gold-500"
                              : "border-gold-500 text-gold-400 hover:bg-gold-500 hover:text-charcoal-950 active:scale-95"
                          }`
                        : `text-sm font-medium tracking-wider uppercase transition-colors duration-200 min-h-[44px] ${
                            isActive
                              ? "gold-text border-b-2 border-gold-500 pb-0.5"
                              : "text-muted-foreground hover:text-foreground"
                          }`
                    }
                  >
                    {link.label}
                  </button>
                );
              })}
              {isAuthenticated && isAdmin && (
                <button
                  type="button"
                  data-ocid="nav.admin_link"
                  onClick={() => navigate({ to: "/admin" })}
                  className={`flex items-center gap-1.5 text-sm font-medium tracking-wider uppercase transition-colors duration-200 min-h-[44px] ${
                    location.pathname === "/admin"
                      ? "gold-text"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck size={14} />
                  Admin
                </button>
              )}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
                >
                  <LogOut size={15} />
                  <span className="tracking-wider uppercase text-xs">
                    Logout
                  </span>
                </button>
              )}
            </nav>

            {/* Mobile menu toggle */}
            <button
              type="button"
              className="md:hidden text-foreground p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile Nav Drawer */}
          {mobileMenuOpen && (
            <div
              className="md:hidden border-t border-border/30 px-4 py-4 flex flex-col gap-1"
              style={{ background: "oklch(0.1 0.008 260)" }}
            >
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    type="button"
                    key={link.path}
                    onClick={() => {
                      navigate({ to: link.path as "/" });
                      setMobileMenuOpen(false);
                    }}
                    className={`text-sm font-medium tracking-wider uppercase text-left transition-colors py-3 px-2 min-h-[48px] border-b border-border/10 ${
                      isActive
                        ? "gold-text font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  type="button"
                  data-ocid="nav.admin_link"
                  onClick={() => {
                    navigate({ to: "/admin" });
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 text-sm font-medium tracking-wider uppercase text-left transition-colors py-3 px-2 min-h-[48px] border-b border-border/10 ${
                    location.pathname === "/admin"
                      ? "gold-text"
                      : "text-muted-foreground"
                  }`}
                >
                  <ShieldCheck size={14} />
                  Admin
                </button>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-muted-foreground py-3 px-2 min-h-[48px] mt-1"
              >
                <LogOut size={15} />
                <span className="tracking-wider uppercase text-xs">Logout</span>
              </button>
            </div>
          )}
        </header>
      )}

      {/* Main content */}
      <main className={`flex-1 ${!isLoginPage ? "pt-16" : ""}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t border-border/30 py-6 md:py-8 px-4 md:px-6"
        style={{ background: "oklch(0.08 0.008 260)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/AIron-1.jpg"
              alt="AIron"
              className="h-7 w-7 object-contain rounded opacity-70"
            />
            <span
              className="font-serif text-sm"
              style={{ color: "oklch(0.6 0.005 260)" }}
            >
              AIron © {new Date().getFullYear()}
            </span>
          </div>
          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.5 0.005 260)" }}
          >
            Built with <span className="gold-text">♥</span> using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "airon-app")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gold-text hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
