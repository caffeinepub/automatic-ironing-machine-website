import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  Lock,
  Package,
  RefreshCw,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { Order } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

function useIsAdmin() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

function useOrders(enabled: boolean) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Order[]>({
    queryKey: ["adminOrders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !actorFetching && enabled,
    refetchOnWindowFocus: false,
  });
}

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / 1_000_000n);
  const date = new Date(ms);
  return date.toLocaleString("en-IN", {
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
  };
  return map[method] ?? method.charAt(0).toUpperCase() + method.slice(1);
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const adminQuery = useIsAdmin();
  const isAdmin = adminQuery.data === true;
  const isAdminLoading = adminQuery.isLoading || adminQuery.isFetching;

  const ordersQuery = useOrders(isAdmin);

  // Not logged in at all
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-charcoal-950 flex items-center justify-center px-4"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-charcoal-600 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-silver-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-silver-400 text-sm mb-8">
            Please log in to access the admin page.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            className="btn-gold rounded-xl px-8 py-3"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading admin check
  if (isAdminLoading) {
    return (
      <div
        className="min-h-screen bg-charcoal-950 flex items-center justify-center"
        data-ocid="admin.loading_state"
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-gold-400 animate-spin mx-auto mb-4" />
          <p className="text-silver-400 text-sm">Verifying admin access…</p>
        </div>
      </div>
    );
  }

  // Not an admin
  if (!isAdmin) {
    return (
      <div
        className="min-h-screen bg-charcoal-950 flex items-center justify-center px-4"
        data-ocid="admin.error_state"
      >
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-charcoal-600 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-7 h-7 text-silver-400" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-white mb-2">
            Access Denied
          </h1>
          <p className="text-silver-400 text-sm mb-8">
            This page is restricted to administrators only.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/product" })}
            className="btn-gold rounded-xl px-8 py-3 flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Admin dashboard
  const orders = ordersQuery.data ?? [];
  const isOrdersLoading = ordersQuery.isLoading || ordersQuery.isFetching;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalPrice), 0);

  return (
    <div
      className="min-h-screen bg-charcoal-950 text-white"
      data-ocid="admin.page"
    >
      {/* Dashboard Header */}
      <div className="border-b border-charcoal-800 bg-charcoal-900/60 backdrop-blur-sm px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-white mb-1">
                Admin <span className="gold-text">Dashboard</span>
              </h1>
              <p className="text-silver-400 text-sm">
                AIron Orders — All customer orders
              </p>
            </div>
            <button
              type="button"
              onClick={() => ordersQuery.refetch()}
              disabled={isOrdersLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-charcoal-600 text-silver-300 hover:text-white hover:border-gold-500 transition-all text-sm disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isOrdersLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Orders */}
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-silver-400 text-xs uppercase tracking-widest mb-0.5">
                Total Orders
              </p>
              <p className="text-white font-bold text-2xl font-serif">
                {orders.length}
              </p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-silver-400 text-xs uppercase tracking-widest mb-0.5">
                Total Revenue
              </p>
              <p className="text-white font-bold text-2xl font-serif">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Total Units */}
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-silver-400 text-xs uppercase tracking-widest mb-0.5">
                Units Sold
              </p>
              <p className="text-white font-bold text-2xl font-serif">
                {orders.reduce((sum, o) => sum + Number(o.quantity), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-charcoal-700 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-white">
              Customer Orders
            </h2>
            <span className="text-xs text-silver-500 bg-charcoal-800 px-3 py-1 rounded-full border border-charcoal-600">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          {isOrdersLoading ? (
            <div
              className="flex items-center justify-center py-20 gap-3"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="w-6 h-6 text-gold-400 animate-spin" />
              <span className="text-silver-400 text-sm">Loading orders…</span>
            </div>
          ) : orders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-center px-4"
              data-ocid="admin.empty_state"
            >
              <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-silver-500" />
              </div>
              <p className="text-white font-medium mb-1">No orders yet</p>
              <p className="text-silver-500 text-sm">
                Customer orders will appear here once a purchase is made.
              </p>
            </div>
          ) : (
            /* Scrollable table */
            <div className="overflow-x-auto" data-ocid="admin.table">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-charcoal-700 bg-charcoal-950/50">
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      #
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Order ID
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Customer
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Email
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Phone
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Delivery Address
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Payment
                    </th>
                    <th className="text-center text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Qty
                    </th>
                    <th className="text-right text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Amount
                    </th>
                    <th className="text-left text-silver-400 text-xs uppercase tracking-wider px-5 py-3 font-medium whitespace-nowrap">
                      Date &amp; Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="border-b border-charcoal-800 hover:bg-charcoal-800/50 transition-colors"
                      data-ocid={`admin.row.${index + 1}`}
                    >
                      <td className="px-5 py-4 text-silver-500 text-xs">
                        {index + 1}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gold-400 font-mono text-xs bg-gold-500/10 px-2 py-1 rounded-lg">
                          {order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-medium whitespace-nowrap">
                        {order.customerName}
                      </td>
                      <td className="px-5 py-4 text-silver-300 whitespace-nowrap">
                        {order.email}
                      </td>
                      <td className="px-5 py-4 text-silver-300 whitespace-nowrap">
                        {order.phone}
                      </td>
                      <td className="px-5 py-4 text-silver-300 max-w-[180px]">
                        <span className="line-clamp-2 text-xs">
                          {order.address}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="text-xs bg-charcoal-800 border border-charcoal-600 text-silver-300 px-2 py-1 rounded-lg">
                          {formatPaymentMethod(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-white font-semibold">
                        {Number(order.quantity)}
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="text-gold-400 font-semibold">
                          ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-silver-400 text-xs whitespace-nowrap">
                        {order.createdAt ? formatDate(order.createdAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
