import { useEffect, useState } from "react";
import { api } from "../api";
import OrderStatus from "../components/OrderStatus";
import { useCurrency } from "../context/CurrencyContext";

const mapUrl = (details) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${details?.address || ""}, ${details?.city || "Tirana"}, Albania`
  )}`;

export default function RestaurantDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  const loadOrders = () =>
    api
      .restaurantOrders()
      .then(setOrders)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id, status) => {
    await api.updateOrderStatus(id, status);
    loadOrders();
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Restaurant dashboard</h1>
        <p className="text-zinc-600">Manage incoming orders and manually update delivery status.</p>
      </div>

      <section className="grid gap-4">
        {orders.map((order) => (
          <article key={order.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Order #{order.id}</h2>
                <p className="text-sm font-semibold text-zinc-500">
                  {order.restaurant?.name} - {new Date(order.createdAt).toLocaleString()}
                </p>
                {order.scheduledFor && (
                  <p className="mt-1 text-sm font-black text-indigo-700">
                    Scheduled for {new Date(order.scheduledFor).toLocaleString()}
                  </p>
                )}
              </div>
              <OrderStatus status={order.status} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
              <div className="space-y-3">
                <div className="rounded bg-zinc-50 p-3">
                  {order.items.map((item) => (
                    <div key={`${order.id}-${item.menuItemId}`} className="flex justify-between py-1 text-sm">
                      <span>
                        {item.quantity} x {item.name}
                      </span>
                      <strong>{formatCurrency(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
                {order.deliveryDetails && (
                  <div className="rounded bg-limewash p-3 text-sm text-basil">
                    <p className="font-black text-ink">Delivery details</p>
                    <p>
                      {order.deliveryDetails.customerName} - {order.deliveryDetails.phone}
                    </p>
                    <p>
                      {order.deliveryDetails.address}
                      {order.deliveryDetails.building ? `, Building ${order.deliveryDetails.building}` : ""}
                      {order.deliveryDetails.apartment ? `, Apt ${order.deliveryDetails.apartment}` : ""}
                      {order.deliveryDetails.floor ? `, Floor ${order.deliveryDetails.floor}` : ""}
                      {order.deliveryDetails.city ? `, ${order.deliveryDetails.city}` : ""}
                    </p>
                    {order.deliveryDetails.notes && (
                      <p className="mt-2 font-semibold">Notes: {order.deliveryDetails.notes}</p>
                    )}
                    <a
                      href={mapUrl(order.deliveryDetails)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block font-black text-basil"
                    >
                      Open delivery address on map
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {order.status === "cancelled" ? (
                  <p className="rounded bg-red-50 p-3 text-sm font-black text-red-700">
                    This order was cancelled by the customer.
                  </p>
                ) : order.status === "scheduled" ? (
                  <p className="rounded bg-indigo-50 p-3 text-sm font-black text-indigo-700">
                    This order will become pending automatically at the scheduled time.
                  </p>
                ) : (
                  ["pending", "preparing", "delivering", "delivered"].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(order.id, status)}
                      className={`rounded px-3 py-2 text-sm font-black ${
                        order.status === status
                          ? "bg-leaf text-white"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                    >
                      Mark {status}
                    </button>
                  ))
                )}
              </div>
            </div>
          </article>
        ))}

        {orders.length === 0 && (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
            <h2 className="text-xl font-black">No restaurant orders yet</h2>
          </div>
        )}
      </section>
    </div>
  );
}
