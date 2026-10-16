import { useEffect, useState } from "react";
import { api } from "../api";
import CourierMapSimulation from "../components/CourierMapSimulation";
import OrderStatus from "../components/OrderStatus";
import { useCurrency } from "../context/CurrencyContext";

const mapUrl = (details) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(
    `${details?.address || ""}, ${details?.city || "Tirana"}, Albania`
  )}`;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const { formatCurrency } = useCurrency();

  const loadOrders = () =>
    api
      .orders()
      .then(setOrders)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const cancelOrder = async (id) => {
    setActionError("");
    try {
      await api.cancelOrder(id);
      await loadOrders();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (loading) {
    return <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-black">Order history</h1>
        <p className="text-zinc-600">Orders refresh automatically to simulate real-time status notifications.</p>
      </div>
      {actionError && (
        <p className="rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{actionError}</p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-xl font-black">No orders yet</h2>
          <p className="mt-2 text-zinc-600">Complete checkout to create your first simulated transaction.</p>
        </div>
      ) : (
        orders.map((order) => (
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
              <div className="flex flex-wrap items-center gap-2">
                <OrderStatus status={order.status} />
                {["pending", "scheduled"].includes(order.status) && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="rounded-full bg-red-50 px-3 py-1 text-xs font-black uppercase text-red-700 hover:bg-red-100"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 divide-y divide-zinc-100">
              {order.items.map((item) => (
                <div key={`${order.id}-${item.menuItemId}`} className="flex justify-between py-2 text-sm">
                  <span>
                    {item.quantity} x {item.name}
                    {item.calories ? (
                      <span className="ml-2 text-xs font-semibold text-zinc-500">
                        {item.totalCalories} kcal
                      </span>
                    ) : null}
                  </span>
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-2 rounded bg-zinc-50 p-3 font-black sm:grid-cols-2">
              <div className="flex justify-between gap-3">
                <span>Total paid</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Approx. calories</span>
                <span>{order.totalCalories || 0} kcal</span>
              </div>
            </div>
            {(order.reward || order.rewardPointsEarned > 0) && (
              <div className="mt-2 rounded bg-limewash p-3 text-sm font-bold text-basil">
                {order.reward && (
                  <p>
                    Reward used: {order.reward.label} ({order.pointsRedeemed} pts)
                  </p>
                )}
                <p>
                  Points earned: {order.rewardPointsEarned || 0} pts
                  {order.rewardPointsBalance !== undefined ? ` - Balance after order: ${order.rewardPointsBalance} pts` : ""}
                </p>
              </div>
            )}
            <div className="mt-2 flex flex-wrap justify-between gap-2 rounded bg-limewash p-3 text-sm font-bold text-basil">
              <span>
                Payment: {order.paymentMethod === "card"
                  ? `Card ending ${order.paymentDetails?.last4 || "not available"}`
                  : order.paymentMethod === "paypal"
                    ? `PayPal (${order.paymentDetails?.email || "not available"})`
                    : order.paymentMethod === "digital-wallet"
                      ? `Wallet (${order.paymentDetails?.walletProvider || "digital"})`
                      : "Cash on delivery"}
              </span>
              <span>{order.paymentStatus || "paid-simulated"}</span>
            </div>
            {(order.promo || order.cashbackEarned > 0 || order.splitPayment?.enabled) && (
              <div className="mt-2 rounded bg-zinc-50 p-3 text-sm text-zinc-700">
                <p className="font-black text-ink">Advanced payment</p>
                {order.promo && (
                  <p>
                    Promo: {order.promo.code} ({order.promo.label})
                    {order.promoDiscount ? ` - ${formatCurrency(order.promoDiscount)} discount` : ""}
                  </p>
                )}
                {order.cashbackEarned > 0 && <p>Cashback earned: {formatCurrency(order.cashbackEarned)}</p>}
                {order.splitPayment?.enabled && (
                  <div className="mt-2">
                    <p className="font-bold">Split payment:</p>
                    {order.splitPayment.participants.map((participant) => (
                      <p key={`${order.id}-${participant.contact}`}>
                        {participant.name}: {formatCurrency(participant.amount)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
            {order.deliveryDetails && (
              <div className="mt-2 rounded bg-zinc-50 p-3 text-sm text-zinc-700">
                <p className="font-black text-ink">Delivery</p>
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
            {order.status === "delivering" && <CourierMapSimulation order={order} />}
          </article>
        ))
      )}
    </div>
  );
}
