import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Collections } from './pages/Collections';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Partner } from './pages/Partner';
import { Checkout } from './pages/Checkout';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { ProductDetail } from './pages/ProductDetail';
import { CartProvider } from './hooks/useCart';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminLayout } from './pages/admin/Layout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { OrderDetail as AdminOrderDetail } from './pages/admin/OrderDetail';
import { Orders as AdminOrders } from './pages/admin/Orders';
import { Users as AdminUsers } from './pages/admin/Users';
import { SettingsPage as AdminSettings } from './pages/admin/Settings';
import { AdminLogin } from './pages/admin/Login';
import { AdminVerifyOtp } from './pages/admin/VerifyOtp';
import { SuperAdminRoute } from './routes/SuperAdminRoute';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="shop" element={<Shop />} />
            <Route path="collections" element={<Collections />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<CheckoutSuccess />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="partner" element={<Partner />} />
            <Route path="product/:id" element={<ProductDetail />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/login/verify" element={<AdminVerifyOtp />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute
                allowedRoles={[
                  'super_admin',
                  'order_manager',
                  'support_agent',
                  'viewer',
                ]}
              />
            }
          >
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route
                path="users"
                element={
                  <SuperAdminRoute>
                    <AdminUsers />
                  </SuperAdminRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <SuperAdminRoute>
                    <AdminSettings />
                  </SuperAdminRoute>
                }
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
