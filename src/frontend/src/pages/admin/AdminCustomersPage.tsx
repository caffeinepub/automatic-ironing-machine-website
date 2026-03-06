import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search, UserCheck, UserX, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Order } from "../../backend";
import { useAdminActor } from "../../hooks/useAdminActor";

type CustomerRow = {
  name: string;
  email: string;
  phone: string;
  address: string;
  orderCount: number;
  totalSpent: number;
  paymentMethods: string[];
  lastOrderDate: bigint;
  hasOrders: boolean;
};

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    card: "Card",
    upi: "UPI",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
    paylater: "Pay Later",
  };
  return map[method] ?? method;
}

export default function AdminCustomersPage() {
  const { actor, isFetching: actorFetching } = useAdminActor();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "purchased" | "registered">(
    "all",
  );
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

  const usersQuery = useQuery<
    Array<[{ toString(): string }, { name: string }]>
  >({
    queryKey: ["adminRegisteredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const result = await actor.getRegisteredUsers();
        return result as Array<[{ toString(): string }, { name: string }]>;
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
  const registeredUsers = usersQuery.data ?? [];
  const isLoading = ordersQuery.isLoading || ordersQuery.isFetching;

  // Build customer rows: merge orders (by email, deduped) + registered-only users
  const customerRows = useMemo((): CustomerRow[] => {
    // Group orders by email (or name if no email)
    const byEmail = new Map<string, Order[]>();
    for (const order of orders) {
      const key =
        order.email?.toLowerCase().trim() ||
        order.customerName.toLowerCase().trim();
      const existing = byEmail.get(key) ?? [];
      byEmail.set(key, [...existing, order]);
    }

    const rows: CustomerRow[] = [];

    // One row per unique email/name from orders
    for (const [, customerOrders] of byEmail) {
      const sorted = [...customerOrders].sort((a, b) =>
        Number(b.createdAt - a.createdAt),
      );
      const latest = sorted[0];
      const totalSpent = customerOrders.reduce(
        (sum, o) => sum + Number(o.totalPrice),
        0,
      );
      const paymentMethods = [
        ...new Set(customerOrders.map((o) => o.paymentMethod)),
      ];
      rows.push({
        name: latest.customerName,
        email: latest.email || "—",
        phone: latest.phone,
        address: latest.address,
        orderCount: customerOrders.length,
        totalSpent,
        paymentMethods,
        lastOrderDate: latest.createdAt,
        hasOrders: true,
      });
    }

    // Add registered users who have no orders
    const orderEmails = new Set(
      orders.map(
        (o) =>
          o.email?.toLowerCase().trim() || o.customerName.toLowerCase().trim(),
      ),
    );
    for (const [, profile] of registeredUsers) {
      const key = profile.name.toLowerCase().trim();
      if (!orderEmails.has(key)) {
        rows.push({
          name: profile.name,
          email: "—",
          phone: "—",
          address: "—",
          orderCount: 0,
          totalSpent: 0,
          paymentMethods: [],
          lastOrderDate: 0n,
          hasOrders: false,
        });
      }
    }

    // Sort: customers with orders first, then by most recent
    rows.sort((a, b) => {
      if (a.hasOrders && !b.hasOrders) return -1;
      if (!a.hasOrders && b.hasOrders) return 1;
      return Number(b.lastOrderDate - a.lastOrderDate);
    });

    return rows;
  }, [orders, registeredUsers]);

  // Filter + search
  const filteredRows = useMemo(() => {
    let rows = customerRows;
    if (filter === "purchased") rows = rows.filter((r) => r.hasOrders);
    if (filter === "registered") rows = rows.filter((r) => !r.hasOrders);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q),
      );
    }
    return rows;
  }, [customerRows, filter, searchQuery]);

  const purchasedCount = customerRows.filter((r) => r.hasOrders).length;
  const registeredOnlyCount = customerRows.filter((r) => !r.hasOrders).length;

  const FILTER_TABS: {
    id: "all" | "purchased" | "registered";
    label: string;
  }[] = [
    { id: "all", label: `All (${customerRows.length})` },
    { id: "purchased", label: `Purchased (${purchasedCount})` },
    { id: "registered", label: `Registered Only (${registeredOnlyCount})` },
  ];

  return (
    <div className="space-y-5" data-ocid="admin.customers.page">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#e2e8f0" }}>
            Customers
          </h2>
          <p className="text-sm mt-0.5" style={{ color: "#64748b" }}>
            {isLoading ? "Loading…" : `${customerRows.length} customers`}
          </p>
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          <Search
            size={14}
            className="absolute left-3"
            style={{ color: "#64748b" }}
          />
          <input
            type="text"
            placeholder="Search by name, email or phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-ocid="admin.customers.search_input"
            className="pl-8 pr-8 py-2 text-sm rounded-lg outline-none transition-all"
            style={{
              background: "#1a1a35",
              border: "1px solid #2a2a4a",
              color: "#e2e8f0",
              width: "260px",
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
              data-ocid="admin.customers.cancel_button"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Stats mini-cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Customers",
            value: customerRows.length,
            icon: Users,
            color: "#6366f1",
            bg: "#6366f115",
          },
          {
            label: "Purchased",
            value: purchasedCount,
            icon: UserCheck,
            color: "#10b981",
            bg: "#10b98115",
          },
          {
            label: "Registered Only",
            value: registeredOnlyCount,
            icon: UserX,
            color: "#f59e0b",
            bg: "#f59e0b15",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-4 flex items-center gap-3"
            style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: bg }}
            >
              <Icon size={17} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: "#e2e8f0" }}>
                {isLoading ? "—" : value}
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid={`admin.customers.${tab.id}.tab`}
            onClick={() => setFilter(tab.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: filter === tab.id ? "#6366f1" : "#1a1a35",
              color: filter === tab.id ? "#fff" : "#64748b",
              border: `1px solid ${filter === tab.id ? "#6366f1" : "#2a2a4a"}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
      >
        {isLoading ? (
          <div
            className="flex items-center justify-center py-20 gap-3"
            data-ocid="admin.customers.loading_state"
          >
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: "#6366f1" }}
            />
            <span className="text-sm" style={{ color: "#64748b" }}>
              Loading customers…
            </span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 text-center px-4"
            data-ocid="admin.customers.empty_state"
          >
            <Users size={36} className="mb-3" style={{ color: "#2a2a4a" }} />
            <p className="font-medium mb-1" style={{ color: "#e2e8f0" }}>
              {searchQuery ? "No matching customers" : "No customers yet"}
            </p>
            <p className="text-sm" style={{ color: "#64748b" }}>
              {searchQuery
                ? "Try a different search term"
                : "Customers will appear here once someone places an order."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-ocid="admin.customers.table">
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
                    "Name",
                    "Email",
                    "Phone",
                    "Address",
                    "Orders",
                    "Total Spent",
                    "Payment",
                    "Status",
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
                {filteredRows.map((row, index) => (
                  <tr
                    key={`${row.email}-${row.name}-${index}`}
                    style={{ borderBottom: "1px solid #1e1e3f" }}
                    data-ocid={`admin.customers.row.${index + 1}`}
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
                    <td
                      className="px-4 py-3.5 font-medium whitespace-nowrap"
                      style={{ color: "#e2e8f0" }}
                    >
                      {row.name || <span style={{ color: "#475569" }}>—</span>}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs whitespace-nowrap"
                      style={{ color: "#94a3b8" }}
                    >
                      {row.email}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs whitespace-nowrap"
                      style={{ color: "#94a3b8" }}
                    >
                      {row.phone}
                    </td>
                    <td
                      className="px-4 py-3.5 text-xs max-w-[160px]"
                      style={{ color: "#94a3b8" }}
                    >
                      <span className="block truncate" title={row.address}>
                        {row.address}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3.5 text-center font-semibold"
                      style={{ color: "#e2e8f0" }}
                    >
                      {row.orderCount}
                    </td>
                    <td
                      className="px-4 py-3.5 font-semibold whitespace-nowrap"
                      style={{
                        color: row.totalSpent > 0 ? "#10b981" : "#475569",
                      }}
                    >
                      {row.totalSpent > 0
                        ? `₹${row.totalSpent.toLocaleString("en-IN")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.paymentMethods.length > 0 ? (
                        <span
                          className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                          style={{ background: "#6366f115", color: "#818cf8" }}
                        >
                          {row.paymentMethods
                            .map(formatPaymentMethod)
                            .join(", ")}
                        </span>
                      ) : (
                        <span style={{ color: "#475569" }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {row.hasOrders ? (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit whitespace-nowrap"
                          style={{ background: "#10b98115", color: "#34d399" }}
                        >
                          <UserCheck size={11} />
                          Purchased
                        </span>
                      ) : (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit whitespace-nowrap"
                          style={{ background: "#f59e0b15", color: "#fbbf24" }}
                        >
                          <UserX size={11} />
                          Registered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
