import { useEffect, useMemo, useState } from "react";
import { Bike, Home, Store } from "lucide-react";

const DELIVERY_DURATION_MS = 5 * 60 * 1000;
const TIRANA_CENTER = { lat: 41.3275, lng: 19.8189 };

const hashAddressToCoordinate = (address = "") => {
  const text = address || "Tirana delivery address";
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100000;
  }

  const latOffset = ((hash % 360) - 180) / 10000;
  const lngOffset = (((hash / 360) % 360) - 180) / 10000;
  return {
    lat: TIRANA_CENTER.lat + latOffset,
    lng: TIRANA_CENTER.lng + lngOffset
  };
};

const buildMapUrl = (restaurant, customer) => {
  const padding = 0.018;
  const left = Math.min(restaurant.lng, customer.lng) - padding;
  const right = Math.max(restaurant.lng, customer.lng) + padding;
  const bottom = Math.min(restaurant.lat, customer.lat) - padding;
  const top = Math.max(restaurant.lat, customer.lat) + padding;
  const markerLat = (restaurant.lat + customer.lat) / 2;
  const markerLng = (restaurant.lng + customer.lng) / 2;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${markerLat}%2C${markerLng}`;
};

const positionInBounds = (point, bounds) => {
  const x = ((point.lng - bounds.left) / (bounds.right - bounds.left || 1)) * 100;
  const y = ((bounds.top - point.lat) / (bounds.top - bounds.bottom || 1)) * 100;
  return {
    x: Math.min(92, Math.max(8, x)),
    y: Math.min(86, Math.max(14, y))
  };
};

const formatEta = (remainingMs) => {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
};

export default function CourierMapSimulation({ order }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const restaurantPoint = order.restaurant?.coordinates || TIRANA_CENTER;
  const customerPoint = useMemo(
    () => hashAddressToCoordinate(`${order.deliveryDetails?.address || ""} ${order.deliveryDetails?.city || ""}`),
    [order.deliveryDetails?.address, order.deliveryDetails?.city]
  );

  const startedAt = new Date(order.updatedAt || order.createdAt).getTime();
  const elapsed = Math.max(0, now - startedAt);
  const progress = Math.min(1, elapsed / DELIVERY_DURATION_MS);
  const remaining = DELIVERY_DURATION_MS - elapsed;
  const courierPoint = {
    lat: restaurantPoint.lat + (customerPoint.lat - restaurantPoint.lat) * progress,
    lng: restaurantPoint.lng + (customerPoint.lng - restaurantPoint.lng) * progress
  };

  const bounds = {
    left: Math.min(restaurantPoint.lng, customerPoint.lng) - 0.018,
    right: Math.max(restaurantPoint.lng, customerPoint.lng) + 0.018,
    bottom: Math.min(restaurantPoint.lat, customerPoint.lat) - 0.018,
    top: Math.max(restaurantPoint.lat, customerPoint.lat) + 0.018
  };

  const restaurantPosition = positionInBounds(restaurantPoint, bounds);
  const customerPosition = positionInBounds(customerPoint, bounds);
  const courierPosition = positionInBounds(courierPoint, bounds);

  return (
    <section className="mt-3 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-4">
        <div>
          <h3 className="font-black">Courier live simulation</h3>
          <p className="text-sm font-semibold text-zinc-500">
            {progress >= 1
              ? "Courier is arriving now. The system will mark this order delivered."
              : `Estimated arrival in ${formatEta(remaining)}. Auto-delivers after 5 minutes.`}
          </p>
        </div>
        <span className="rounded-full bg-limewash px-3 py-1 text-xs font-black uppercase text-basil">
          5 min route
        </span>
      </div>

      <div className="relative h-72 overflow-hidden bg-zinc-100">
        <iframe
          title={`Courier map for order ${order.id}`}
          src={buildMapUrl(restaurantPoint, customerPoint)}
          className="absolute inset-0 h-full w-full border-0 opacity-75"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-white/20" />

        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          <line
            x1={`${restaurantPosition.x}%`}
            y1={`${restaurantPosition.y}%`}
            x2={`${customerPosition.x}%`}
            y2={`${customerPosition.y}%`}
            stroke="#151515"
            strokeDasharray="8 8"
            strokeWidth="3"
          />
          <line
            x1={`${restaurantPosition.x}%`}
            y1={`${restaurantPosition.y}%`}
            x2={`${courierPosition.x}%`}
            y2={`${courierPosition.y}%`}
            stroke="#06c167"
            strokeLinecap="round"
            strokeWidth="5"
          />
        </svg>

        <div
          className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ink text-white shadow-soft"
          style={{ left: `${restaurantPosition.x}%`, top: `${restaurantPosition.y}%` }}
          title={order.restaurant?.name}
        >
          <Store size={18} />
        </div>
        <div
          className="absolute grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-basil shadow-soft ring-2 ring-leaf"
          style={{ left: `${customerPosition.x}%`, top: `${customerPosition.y}%` }}
          title={order.deliveryDetails?.address}
        >
          <Home size={18} />
        </div>
        <div
          className="absolute grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-leaf text-white shadow-soft transition-all duration-1000"
          style={{ left: `${courierPosition.x}%`, top: `${courierPosition.y}%` }}
          title="Courier"
        >
          <Bike size={21} />
        </div>
      </div>

      <div className="grid gap-3 p-4 text-sm font-semibold text-zinc-600 sm:grid-cols-3">
        <div>
          <p className="font-black text-ink">From</p>
          <p>{order.restaurant?.location || order.restaurant?.name}</p>
        </div>
        <div>
          <p className="font-black text-ink">To</p>
          <p>{order.deliveryDetails?.address || "Customer address"}</p>
        </div>
        <div>
          <p className="font-black text-ink">Progress</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div className="h-full rounded-full bg-leaf" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
