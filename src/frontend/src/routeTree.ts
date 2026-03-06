import { createRootRoute, createRoute, redirect } from "@tanstack/react-router";
import AdminLayout from "./components/AdminLayout";
import Layout from "./components/Layout";
import CheckoutPage from "./pages/CheckoutPage";
import FeaturesPage from "./pages/FeaturesPage";
import LoginPage from "./pages/LoginPage";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentSuccess from "./pages/PaymentSuccess";
import ProductLandingPage from "./pages/ProductLandingPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";

// ─── Root (customer layout) ──────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: Layout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LoginPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product",
  component: ProductLandingPage,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/features",
  component: FeaturesPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  validateSearch: (search: Record<string, unknown>) => ({
    quantity: search.quantity ? String(search.quantity) : "1",
  }),
  component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-success",
  validateSearch: (search: Record<string, unknown>) => ({
    quantity: search.quantity ? String(search.quantity) : "1",
  }),
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment-failure",
  component: PaymentFailure,
});

// ─── Admin login (no sidebar — standalone page) ──────────────────────────────

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

// ─── Admin layout parent ─────────────────────────────────────────────────────

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminLayout,
});

// /admin/ index → redirect to /admin/dashboard
const adminIndexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/admin/dashboard" });
  },
  component: () => null,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/dashboard",
  component: AdminDashboardPage,
});

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/orders",
  component: AdminOrdersPage,
});

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/customers",
  component: AdminCustomersPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/settings",
  component: AdminSettingsPage,
});

// Wire admin layout with its children
const adminLayoutWithChildren = adminLayoutRoute.addChildren([
  adminIndexRoute,
  adminDashboardRoute,
  adminOrdersRoute,
  adminCustomersRoute,
  adminSettingsRoute,
]);

// ─── Route tree ──────────────────────────────────────────────────────────────

export const routeTree = rootRoute.addChildren([
  loginRoute,
  productRoute,
  featuresRoute,
  checkoutRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  adminLoginRoute,
  adminLayoutWithChildren,
]);
