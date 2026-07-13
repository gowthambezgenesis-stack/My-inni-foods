import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { Offers } from './pages/Offers';
import { Contact } from './pages/Contact';
import { Cart } from './pages/Cart';
import { Partner } from './pages/Partner';
import { Checkout } from './pages/Checkout';
import { CheckoutSuccess } from './pages/CheckoutSuccess';
import { TrackOrder } from './pages/TrackOrder';
import { ProductDetail } from './pages/ProductDetail';
import { ComboOfferDetail } from './pages/ComboOfferDetail';
import { Legal } from './pages/Legal';
import { CartProvider } from './hooks/useCart';

import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminLayout } from './pages/admin/Layout';
import { Dashboard as AdminDashboard } from './pages/admin/Dashboard';
import { OrderDetail as AdminOrderDetail } from './pages/admin/OrderDetail';
import { Orders as AdminOrders } from './pages/admin/Orders';
import { AllOrders as AdminAllOrders } from './pages/admin/AllOrders';
import { Users as AdminUsers } from './pages/admin/Users';
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
            <Route path="offers" element={<Offers />} />
            <Route path="offers/:id" element={<ComboOfferDetail />} />
            <Route path="collections" element={<Navigate to="/offers" replace />} />
            <Route path="contact" element={<Contact />} />
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="success" element={<CheckoutSuccess />} />
            <Route path="track-order" element={<TrackOrder />} />
            <Route path="partner" element={<Partner />} />
            <Route path="legal" element={<Legal />} />
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
                ]}
              />
            }
          >
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="orders/all" element={<AdminAllOrders />} />
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
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}
