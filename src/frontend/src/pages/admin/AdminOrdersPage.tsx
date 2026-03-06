import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Download, Loader2, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Order } from "../../backend";
import { useAdminActor } from "../../hooks/useAdminActor";

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Date(ms).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    card: "Credit/Debit Card",
    upi: "UPI",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
  };
  return map[method] ?? method.charAt(0).toUpperCase() + method.slice(1);
}

function exportToCSV(orders: Order[]) {
  const headers = [
    "Order ID",
    "Customer Name",
    "Email",
    "Phone",
    "Address",
    "Payment Method",
    "Quantity",
    "Total (₹)",
    "Date",
  ];
  const rows = orders.map((o) => [
    o.id,
    o.customerName,
    o.email,
    o.phone,
    `"${o.address.replace(/"/g, '""')}"`,
    formatPaymentMethod(o.paymentMethod),
    Number(o.quantity),
    Number(o.totalPrice),
    formatDate(o.createdAt),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `airon-orders-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const { actor, isFetching: actorFetching } = useAdminActor();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const isAdminSession = localStorage.getItem("adminSession") === "true";

  useEffect(() => {
    if (!isAdminSession) {
      void navigate({ to: "/admin/login" });
    }
  }, [isAdminSession, navigate]);

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getOrders();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && isAdminSession,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: 2000,
  });

  const orders = ordersQuery.data ?? [];
  const isLoading = ordersQuery.isLoading || ordersQuery.isFetching;

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.includes(q),
    );
  }, [orders, searchQuery]);

  // Sort newest first
  const sortedOrders = useMemo(
    () => [...filteredOrders].sort((a, b) => Number(b.createdAt - a.createdAt)),
    [filteredOrders],
  );

  const PAYMENT_BADGE_COLOR: Record<string, { bg: string; color: string }> = {
    card: { bg: "#3b82f615", color: "#60a5fa" },
    upi: { bg: "#10b98115", color: "#34d399" },
    netbanking: { bg: "#f59e0b15", color: "#fbbf24" },
    wallet: { bg: "#a855f715", color: "#c084fc" },
    emi: { bg: "#ef444415", color: "#f87171" },
  };

  return (
    <div className="space-y-5" data-ocid="admin.orders.page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>
            All Orders
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            {isLoading ? "Loading…" : `${orders.length} total orders`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Search */}
          <div className="relative flex items-center">
            <Search
              size={14}
              className="absolute left-3"
              style={{ color: "#64748b" }}
            />
            <input
              type="text"
              placeholder="Search by name, email, ID…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-ocid="admin.orders.search_input"
              className="pl-8 pr-8 py-2 text-sm rounded-lg outline-none transition-all"
              style={{
                background: "#1a1a35",
                border: "1px solid #2a2a4a",
                color: "#e2e8f0",
                width: "240px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#6366f1";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#2a2a4a";
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2.5"
                onClick={() => setSearchQuery("")}
                style={{ color: "#64748b" }}
                data-ocid="admin.orders.cancel_button"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Export CSV */}
          <button
            type="button"
            data-ocid="admin.orders.primary_button"
            onClick={() => exportToCSV(sortedOrders)}
            disabled={orders.length === 0 || isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#6366f1",
              color: "#fff",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                (e.currentTarget as HTMLElement).style.background = "#4f46e5";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#6366f1";
            }}
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
      >
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20 gap-3"
            data-ocid="admin.orders.loading_state"
          >
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: "#6366f1" }}
            />
            <span className="text-sm" style={{ color: "#64748b" }}>
              Loading orders…
            </span>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-4"
            data-ocid="admin.orders.empty_state"
          >
            <ShoppingBag
              size={36}
              className="mb-3"
              style={{ color: "#2a2a4a" }}
            />
            <p className="font-medium mb-1" style={{ color: "#e2e8f0" }}>
              {searchQuery ? "No matching orders" : "No orders yet"}
            </p>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {searchQuery
                ? "Try a different search term"
                : "Customer orders will appear here once a purchase is made."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-ocid="admin.orders.table">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    background: "#13132b",
                    borderBottom: "1px solid #2a2a4a",
                  }}
                >
                  {[
                    "#",
                    "Order ID",
                    "Customer",
                    "Email",
                    "Phone",
                    "Address",
                    "Payment",
                    "Qty",
                    "Amount",
                    "Date",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#64748b" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order, index) => {
                  const pm =
                    PAYMENT_BADGE_COLOR[order.paymentMethod] ??
                    PAYMENT_BADGE_COLOR.card;
                  return (
                    <tr
                      key={order.id}
                      style={{ borderBottom: "1px solid #1e1e3f" }}
                      data-ocid={`admin.orders.row.${index + 1}`}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "#1e1e3f";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <td
                        className="px-4 py-3.5 text-xs"
                        style={{ color: "#475569" }}
                      >
                        {index + 1}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs font-mono px-2 py-1 rounded"
                          style={{ background: "#6366f115", color: "#818cf8" }}
                        >
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 font-medium whitespace-nowrap"
                        style={{ color: "#e2e8f0" }}
                      >
                        {order.customerName}
                      </td>
                      <td
                        className="px-4 py-3.5 whitespace-nowrap"
                        style={{ color: "#94a3b8" }}
                      >
                        {order.email}
                      </td>
                      <td
                        className="px-4 py-3.5 whitespace-nowrap"
                        style={{ color: "#94a3b8" }}
                      >
                        {order.phone}
                      </td>
                      <td className="px-4 py-3.5 max-w-[160px]">
                        <span
                          className="text-xs line-clamp-2"
                          style={{ color: "#94a3b8" }}
                        >
                          {order.address}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                          style={{ background: pm.bg, color: pm.color }}
                        >
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 text-center font-semibold"
                        style={{ color: "#e2e8f0" }}
                      >
                        {Number(order.quantity)}
                      </td>
                      <td
                        className="px-4 py-3.5 whitespace-nowrap font-semibold"
                        style={{ color: "#10b981" }}
                      >
                        ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                      </td>
                      <td
                        className="px-4 py-3.5 text-xs whitespace-nowrap"
                        style={{ color: "#64748b" }}
                      >
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary row */}
      {!isLoading && orders.length > 0 && (
        <div
          className="flex flex-wrap gap-4 text-sm"
          style={{ color: "#64748b" }}
        >
          <span>
            Showing{" "}
            <strong style={{ color: "#e2e8f0" }}>{sortedOrders.length}</strong>{" "}
            {searchQuery ? `of ${orders.length} orders` : "orders"}
          </span>
          <span>·</span>
          <span>
            Total Revenue:{" "}
            <strong style={{ color: "#10b981" }}>
              ₹
              {sortedOrders
                .reduce((s, o) => s + Number(o.totalPrice), 0)
                .toLocaleString("en-IN")}
            </strong>
          </span>
          <span>·</span>
          <span>
            Units:{" "}
            <strong style={{ color: "#e2e8f0" }}>
              {sortedOrders.reduce((s, o) => s + Number(o.quantity), 0)}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}
