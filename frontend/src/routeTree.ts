import { createRootRoute, createRoute } from '@tanstack/react-router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProductLandingPage from './pages/ProductLandingPage';
import FeaturesPage from './pages/FeaturesPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';

const rootRoute = createRootRoute({
  component: Layout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/product',
  component: ProductLandingPage,
});

const featuresRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/features',
  component: FeaturesPage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  validateSearch: (search: Record<string, unknown>) => ({
    quantity: search.quantity ? String(search.quantity) : '1',
  }),
  component: CheckoutPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  validateSearch: (search: Record<string, unknown>) => ({
    quantity: search.quantity ? String(search.quantity) : '1',
  }),
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

export const routeTree = rootRoute.addChildren([
  loginRoute,
  productRoute,
  featuresRoute,
  checkoutRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
]);
