import { useEffect, useState } from "react";
import { Activity, Banknote, Percent, ReceiptText, ShoppingCart, Users } from "lucide-react";
import { api } from "../api";
import { useCurrency } from "../context/CurrencyContext";

const cards = [
  { key: "numberOfOrders", label: "Orders", icon: ReceiptText },
  { key: "totalRevenue", label: "Commission revenue", icon: Banknote, currency: true },
  { key: "conversionRate", label: "Conversion rate", icon: Percent, suffix: "%" },
  { key: "averageOrderValue", label: "Average order value", icon: ShoppingCart, currency: true },
  { key: "visitors", label: "Website visitors", icon: Users },
  { key: "checkoutStarts", label: "Checkout starts", icon: Activity }
];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const load = () =>
      api
        .analytics()
        .then(setAnalytics)
        .finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analytics) {
    return <div className="h-80 animate-pulse rounded-lg bg-white shadow-sm" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black">Admin dashboard</h1>
        <p className="text-zinc-600">Simulated KPIs for the B2C food delivery business model.</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, label, icon: Icon, suffix = "", currency: isCurrency }) => (
          <article key={key} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <div className="flex items-center justify-between">
              <span className="grid h-11 w-11 place-items-center rounded bg-limewash text-basil">
                <Icon size={21} />
              </span>
              <span className="text-sm font-black text-zinc-500">KPI</span>
            </div>
            <p className="mt-5 text-sm font-bold text-zinc-500">{label}</p>
            <h2 className="mt-1 text-3xl font-black">
              {isCurrency ? formatCurrency(analytics[key]) : `${analytics[key]}${suffix}`}
            </h2>
          </article>
        ))}
      </section>

      <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-xl font-black">Business logic</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <p className="rounded bg-zinc-50 p-4 text-sm">
            Revenue model: platform commission is {Math.round(analytics.commissionRate * 100)}% of every simulated order.
          </p>
          <p className="rounded bg-zinc-50 p-4 text-sm">
            Conversion rate: orders divided by simulated website visitors.
          </p>
          <p className="rounded bg-zinc-50 p-4 text-sm">
            Transaction flow: browsing, selection, checkout confirmation, payment simulation, and status updates.
          </p>
        </div>
      </section>
    </div>
  );
}
