const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const request = async (path, options = {}) => {
  const token = sessionStorage.getItem("token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export const api = {
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  restaurants: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/restaurants${query ? `?${query}` : ""}`);
  },
  restaurant: (id) => request(`/restaurants/${id}`),
  addRestaurantReview: (id, payload) =>
    request(`/restaurants/${id}/reviews`, { method: "POST", body: JSON.stringify(payload) }),
  deleteRestaurantReview: (restaurantId, reviewId) =>
    request(`/restaurants/${restaurantId}/reviews/${reviewId}`, { method: "DELETE" }),
  orders: () => request("/orders"),
  createOrder: (payload) =>
    request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: "PATCH" }),
  rewards: () => request("/rewards"),
  paymentOptions: () => request("/payment-options"),
  notifications: () => request("/notifications"),
  markNotificationsRead: () => request("/notifications/read", { method: "PATCH" }),
  analytics: () => request("/analytics"),
  restaurantOrders: () => request("/restaurant/orders"),
  updateOrderStatus: (id, status) =>
    request(`/restaurant/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    })
};
