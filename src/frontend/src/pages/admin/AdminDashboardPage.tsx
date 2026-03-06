import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BarChart2,
  Loader2,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Order } from "../../backend";
import { useActor } from "../../hooks/useActor";
import { useInternetIdentity } from "../../hooks/useInternetIdentity";

function useAdminData() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const adminQuery = useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
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

  return { adminQuery, ordersQuery, usersQuery };
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    card: "Card",
    upi: "UPI",
    netbanking: "Net Banking",
    wallet: "Wallet",
    emi: "EMI",
  };
  return map[method] ?? method;
}

// Group orders by day for last 7 days
function buildSalesChartData(orders: Order[]) {
  const days: { date: string; orders: number; revenue: number }[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
    days.push({ date: key, orders: 0, revenue: 0 });
  }

  for (const order of orders) {
    const ms = Number(order.createdAt / 1_000_000n);
    const orderDate = new Date(ms);
    const diffDays = Math.floor(
      (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays >= 0 && diffDays < 7) {
      const idx = 6 - diffDays;
      if (days[idx]) {
        days[idx].orders += 1;
        days[idx].revenue += Number(order.totalPrice);
      }
    }
  }

  return days;
}

// Group orders by month for the current year
function buildMonthlyData(orders: Order[]) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const data = months.map((m) => ({ month: m, orders: 0 }));
  const year = new Date().getFullYear();

  for (const order of orders) {
    const ms = Number(order.createdAt / 1_000_000n);
    const d = new Date(ms);
    if (d.getFullYear() === year) {
      data[d.getMonth()].orders += 1;
    }
  }

  return data;
}

const STAT_CARD_COLORS = {
  blue: { bg: "#1e3a5f", icon: "#3b82f6", border: "#1e40af30" },
  green: { bg: "#14532d", icon: "#10b981", border: "#15803d30" },
  purple: { bg: "#3b0764", icon: "#a855f7", border: "#7e22ce30" },
  amber: { bg: "#78350f", icon: "#f59e0b", border: "#b45309530" },
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  colorKey: keyof typeof STAT_CARD_COLORS;
  trend?: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  colorKey,
  trend,
}: StatCardProps) {
  const colors = STAT_CARD_COLORS[colorKey];
  return (
    <div
      className="rounded-xl p-5 flex flex-col gap-3"
      style={{
        background: "#1a1a35",
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${colors.bg}`, opacity: 0.9 }}
        >
          <Icon size={19} style={{ color: colors.icon }} />
        </div>
        {trend && (
          <span
            className="text-xs flex items-center gap-1 px-2 py-0.5 rounded-full"
            style={{ background: "#10b98115", color: "#10b981" }}
          >
            <ArrowUpRight size={11} />
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold mb-0.5" style={{ color: "#e2e8f0" }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: "#64748b" }}>
          {label}
        </p>
      </div>
    </div>
  );
}

const CustomTooltipStyle: React.CSSProperties = {
  background: "#1a1a35",
  border: "1px solid #2a2a4a",
  borderRadius: "8px",
  color: "#e2e8f0",
  fontSize: "12px",
  padding: "8px 12px",
};

export default function AdminDashboardPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { adminQuery, ordersQuery, usersQuery } = useAdminData();

  const isAdmin = adminQuery.data === true;
  const isAdminLoading = adminQuery.isLoading || adminQuery.isFetching;

  useEffect(() => {
    if (!identity && !adminQuery.isLoading) {
      void navigate({ to: "/admin/login" });
    }
  }, [identity, adminQuery.isLoading, navigate]);

  useEffect(() => {
    if (adminQuery.isFetched && !isAdmin) {
      void navigate({ to: "/admin/login" });
    }
  }, [adminQuery.isFetched, isAdmin, navigate]);

  if (!identity || isAdminLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-64"
        data-ocid="admin.dashboard.loading_state"
      >
        <div className="text-center">
          <Loader2
            size={28}
            className="animate-spin mx-auto mb-3"
            style={{ color: "#6366f1" }}
          />
          <p className="text-sm" style={{ color: "#64748b" }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  const orders = ordersQuery.data ?? [];
  const users = usersQuery.data ?? [];
  const isOrdersLoading = ordersQuery.isLoading || ordersQuery.isFetching;

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);
  const totalUnits = orders.reduce((sum, o) => sum + Number(o.quantity), 0);
  const recentOrders = [...orders]
    .sort((a, b) => Number(b.createdAt - a.createdAt))
    .slice(0, 5);

  const salesData = buildSalesChartData(orders);
  const monthlyData = buildMonthlyData(orders);

  return (
    <div className="space-y-6" data-ocid="admin.dashboard.page">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Orders"
          value={isOrdersLoading ? "—" : orders.length}
          icon={ShoppingBag}
          colorKey="blue"
        />
        <StatCard
          label="Total Revenue"
          value={
            isOrdersLoading ? "—" : `₹${totalRevenue.toLocaleString("en-IN")}`
          }
          icon={TrendingUp}
          colorKey="green"
        />
        <StatCard
          label="Registered Users"
          value={usersQuery.isLoading ? "—" : users.length}
          icon={Users}
          colorKey="purple"
        />
        <StatCard
          label="Units Sold"
          value={isOrdersLoading ? "—" : totalUnits}
          icon={Package}
          colorKey="amber"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Area chart — Sales Overview (3/5 width) */}
        <div
          className="xl:col-span-3 rounded-xl p-5"
          style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
          data-ocid="admin.dashboard.panel"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "#e2e8f0" }}
              >
                Sales Overview
              </h3>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                Last 7 days
              </p>
            </div>
            <div
              className="flex items-center gap-4 text-xs"
              style={{ color: "#64748b" }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: "#6366f1" }}
                />
                Orders
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ background: "#10b981" }}
                />
                Revenue
              </span>
            </div>
          </div>
          {orders.length === 0 && !isOrdersLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <BarChart2
                size={32}
                className="mb-2"
                style={{ color: "#2a2a4a" }}
              />
              <p className="text-sm" style={{ color: "#64748b" }}>
                No data yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={salesData}
                margin={{ top: 0, right: 0, bottom: 0, left: -10 }}
              >
                <defs>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a4a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  cursor={{ stroke: "#2a2a4a" }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#ordersGrad)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar chart — Orders by Month (2/5 width) */}
        <div
          className="xl:col-span-2 rounded-xl p-5"
          style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
          data-ocid="admin.dashboard.panel"
        >
          <div className="mb-5">
            <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
              Orders by Month
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
              {new Date().getFullYear()}
            </p>
          </div>
          {orders.length === 0 && !isOrdersLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <BarChart2
                size={32}
                className="mb-2"
                style={{ color: "#2a2a4a" }}
              />
              <p className="text-sm" style={{ color: "#64748b" }}>
                No data yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={monthlyData}
                margin={{ top: 0, right: 0, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2a2a4a"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={CustomTooltipStyle}
                  cursor={{ fill: "#2a2a4a40" }}
                />
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Orders table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1a1a35", border: "1px solid #2a2a4a" }}
        data-ocid="admin.dashboard.panel"
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid #2a2a4a" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "#e2e8f0" }}>
            Recent Orders
          </h3>
          <a
            href="/admin/orders"
            className="text-xs font-medium transition-colors"
            style={{ color: "#6366f1" }}
            data-ocid="admin.orders.link"
          >
            View all →
          </a>
        </div>

        {isOrdersLoading ? (
          <div
            className="flex items-center justify-center py-12 gap-3"
            data-ocid="admin.dashboard.loading_state"
          >
            <Loader2
              size={18}
              className="animate-spin"
              style={{ color: "#6366f1" }}
            />
            <span className="text-sm" style={{ color: "#64748b" }}>
              Loading orders…
            </span>
          </div>
        ) : recentOrders.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="admin.dashboard.empty_state"
          >
            <ShoppingBag
              size={28}
              className="mb-3"
              style={{ color: "#2a2a4a" }}
            />
            <p className="text-sm" style={{ color: "#64748b" }}>
              No orders yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto" data-ocid="admin.orders.table">
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #2a2a4a",
                    background: "#13132b",
                  }}
                >
                  {["Customer", "Phone", "Amount", "Payment", "Date"].map(
                    (h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-medium uppercase tracking-wider"
                        style={{ color: "#64748b" }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "1px solid #1e1e3f" }}
                    data-ocid={`admin.orders.row.${i + 1}`}
                  >
                    <td
                      className="px-5 py-3.5 font-medium"
                      style={{ color: "#e2e8f0" }}
                    >
                      {order.customerName}
                    </td>
                    <td className="px-5 py-3.5" style={{ color: "#94a3b8" }}>
                      {order.phone}
                    </td>
                    <td
                      className="px-5 py-3.5 font-semibold"
                      style={{ color: "#10b981" }}
                    >
                      ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: "#6366f115", color: "#818cf8" }}
                      >
                        {formatPaymentMethod(order.paymentMethod)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3.5 text-xs"
                      style={{ color: "#64748b" }}
                    >
                      {formatDate(order.createdAt)}
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
