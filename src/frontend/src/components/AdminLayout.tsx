import { useQueryClient } from "@tanstack/react-query";
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    path: "/admin/customers",
    icon: Users,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
] as const;

export default function AdminLayout() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loggingOutRef = useRef(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const truncatedPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-5)}`
    : "Anonymous";

  useEffect(() => {
    if (loggingOutRef.current && !identity && !isInitializing) {
      loggingOutRef.current = false;
      void navigate({ to: "/admin/login" });
    }
  }, [identity, isInitializing, navigate]);

  const handleLogout = () => {
    loggingOutRef.current = true;
    localStorage.removeItem("adminSession");
    queryClient.clear();
    clear();
    setSidebarOpen(false);
  };

  const currentPageTitle =
    NAV_ITEMS.find((item) => item.path === location.pathname)?.label ?? "Admin";

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "#0d0d1a", color: "#e2e8f0" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          role="presentation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          background: "#13132b",
          borderRight: "1px solid #2a2a4a",
        }}
      >
        {/* Sidebar Header */}
        <div
          className="flex items-center justify-between px-5 py-5"
          style={{ borderBottom: "1px solid #2a2a4a" }}
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/uploads/AIron-1.jpg"
              alt="AIron"
              className="w-9 h-9 rounded-lg object-cover shrink-0"
            />
            <div>
              <span
                className="font-bold text-base tracking-wide"
                style={{ color: "#e2e8f0" }}
              >
                AI<span style={{ color: "#c9a227" }}>ron</span>
              </span>
              <p className="text-xs" style={{ color: "#64748b" }}>
                Admin Panel
              </p>
            </div>
          </div>
          <button
            type="button"
            className="lg:hidden p-1.5 rounded"
            style={{ color: "#64748b" }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                data-ocid={`admin.${label.toLowerCase()}.link`}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  background: isActive ? "#6366f1" : "transparent",
                  color: isActive ? "#fff" : "#94a3b8",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "#1e1e3f";
                    (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#94a3b8";
                  }
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer — user info + logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid #2a2a4a" }}>
          <div
            className="rounded-lg p-3 mb-3"
            style={{ background: "#0d0d1a" }}
          >
            <p
              className="text-xs font-medium mb-0.5"
              style={{ color: "#94a3b8" }}
            >
              Logged in as
            </p>
            <p
              className="text-xs font-mono truncate"
              style={{ color: "#e2e8f0" }}
            >
              {truncatedPrincipal}
            </p>
          </div>
          <button
            type="button"
            data-ocid="admin.logout.button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: "#ef4444" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#ef44441a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3.5 shrink-0"
          style={{
            background: "#13132b",
            borderBottom: "1px solid #2a2a4a",
          }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg transition-colors"
              style={{ color: "#64748b" }}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              data-ocid="admin.menu.button"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1
                className="text-base font-semibold"
                style={{ color: "#e2e8f0" }}
              >
                {currentPageTitle}
              </h1>
              <p
                className="text-xs hidden sm:block"
                style={{ color: "#64748b" }}
              >
                AIron Admin Panel
              </p>
            </div>
          </div>

          {/* Header right */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search — desktop only */}
            <div className="relative hidden md:flex items-center">
              <Search
                size={14}
                className="absolute left-3"
                style={{ color: "#64748b" }}
              />
              <input
                type="text"
                placeholder="Search…"
                data-ocid="admin.search_input"
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg outline-none transition-all"
                style={{
                  background: "#0d0d1a",
                  border: "1px solid #2a2a4a",
                  color: "#e2e8f0",
                  width: "200px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#6366f1";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                }}
              />
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: "#64748b" }}
              data-ocid="admin.notifications.button"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1e1e3f";
                (e.currentTarget as HTMLElement).style.color = "#e2e8f0";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
                (e.currentTarget as HTMLElement).style.color = "#64748b";
              }}
            >
              <Bell size={18} />
            </button>

            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "#6366f1" }}
            >
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer
          className="px-6 py-3 text-center text-xs"
          style={{
            borderTop: "1px solid #2a2a4a",
            color: "#475569",
          }}
        >
          AIron Admin © {new Date().getFullYear()} · Built with{" "}
          <span style={{ color: "#ef4444" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#6366f1" }}
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
