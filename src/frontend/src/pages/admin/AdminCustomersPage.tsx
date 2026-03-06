import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Search, UserCheck, UserX, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Order } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

type CustomerRow = {
  principal: string;
  name: string;
  hasPurchased: boolean;
  orderCount: number;
  totalSpent: number;
};

export default function AdminCustomersPage() {
  const { identity } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "purchased" | "registered">(
    "all",
  );

  const adminQuery = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });

  const usersQuery = useQuery<
    Array<[{ toString(): string }, { name: string }]>
  >({
    queryKey: ["adminRegisteredUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRegisteredUsers() as Promise<
        Array<[{ toString(): string }, { name: string }]>
      >;
    },
    enabled: !!actor && !actorFetching && adminQuery.data === true,
    refetchOnWindowFocus: false,
  });

  const ordersQuery = useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !actorFetching && adminQuery.data === true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!identity && !adminQuery.isLoading) {
      void navigate({ to: "/admin/login" });
    }
  }, [identity, adminQuery.isLoading, navigate]);

  useEffect(() => {
    if (adminQuery.isFetched && adminQuery.data === false) {
      void navigate({ to: "/admin/login" });
    }
  }, [adminQuery.isFetched, adminQuery.data, navigate]);

  const users = usersQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const isLoading =
    adminQuery.isLoading ||
    usersQuery.isLoading ||
    usersQuery.isFetching ||
    ordersQuery.isLoading;

  // Build customer rows by cross-referencing users with orders
  const customerRows = useMemo((): CustomerRow[] => {
    // Build a map of customer names → orders
    const nameToOrders = new Map<string, Order[]>();
    for (const order of orders) {
      const existing = nameToOrders.get(order.customerName.toLowerCase()) ?? [];
      nameToOrders.set(order.customerName.toLowerCase(), [...existing, order]);
    }

    return users.map(([principal, profile]) => {
      const matchedOrders = nameToOrders.get(profile.name.toLowerCase()) ?? [];
      const totalSpent = matchedOrders.reduce(
        (sum, o) => sum + Number(o.totalPrice),
        0,
      );
      return {
        principal: principal.toString(),
        name: profile.name,
        hasPurchased: matchedOrders.length > 0,
        orderCount: matchedOrders.length,
        totalSpent,
      };
    });
  }, [users, orders]);

  // Filter + search
  const filteredRows = useMemo(() => {
    let rows = customerRows;
    if (filter === "purchased") rows = rows.filter((r) => r.hasPurchased);
    if (filter === "registered") rows = rows.filter((r) => !r.hasPurchased);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.principal.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [customerRows, filter, searchQuery]);

  const purchasedCount = customerRows.filter((r) => r.hasPurchased).length;
  const registeredOnlyCount = customerRows.filter(
    (r) => !r.hasPurchased,
  ).length;

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
            {isLoading ? "Loading…" : `${customerRows.length} registered users`}
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
            placeholder="Search by name or principal…"
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
            label: "Total Users",
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
                : "Customers will appear here once someone signs in."}
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
                    "Principal ID",
                    "Status",
                    "Orders",
                    "Total Spent",
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
                    key={row.principal}
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
                    <td className="px-4 py-3.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: "#64748b" }}
                      >
                        {`${row.principal.slice(0, 10)}…${row.principal.slice(-5)}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.hasPurchased ? (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
                          style={{ background: "#10b98115", color: "#34d399" }}
                        >
                          <UserCheck size={11} />
                          Purchased
                        </span>
                      ) : (
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit"
                          style={{ background: "#f59e0b15", color: "#fbbf24" }}
                        >
                          <UserX size={11} />
                          Registered
                        </span>
                      )}
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
