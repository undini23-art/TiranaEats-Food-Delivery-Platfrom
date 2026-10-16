import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import NotificationsPage from "./pages/NotificationsPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import RestaurantPage from "./pages/RestaurantPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/restaurant-dashboard"
          element={
            <ProtectedRoute roles={["restaurant", "admin"]}>
              <RestaurantDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
