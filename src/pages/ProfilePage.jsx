import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  Flame,
  LogOut,
  Mail,
  MapPin,
  ReceiptText,
  Shield,
  Store,
  UserRound,
  WalletCards
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { currency, formatCurrency } = useCurrency();
  const [personalOrders, setPersonalOrders] = useState([]);
  const [rewards, setRewards] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const stored = localStorage.getItem(`foodBudget-${user.id}`);
    return stored || "25000";
  });

  useEffect(() => {
    if (user.role !== "customer") {
      return;
    }

    setOrdersLoading(true);
    api
      .orders()
      .then(setPersonalOrders)
      .catch(() => setPersonalOrders([]))
      .finally(() => setOrdersLoading(false));
    api
      .rewards()
      .then(setRewards)
      .catch(() => setRewards(null));
  }, [user.role]);

  const totalSpent = personalOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const latestOrder = personalOrders[0];
  const now = new Date();
  const currentMonthOrders = personalOrders.filter((order) => {
    const createdAt = new Date(order.createdAt);
    return (
      createdAt.getFullYear() === now.getFullYear() &&
      createdAt.getMonth() === now.getMonth() &&
      order.status !== "cancelled"
    );
  });
  const monthlySpent = currentMonthOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const monthlyCalories = currentMonthOrders.reduce((sum, order) => sum + Number(order.totalCalories || 0), 0);
  const budgetValue = Number(monthlyBudget) || 0;
  const budgetUsed = budgetValue ? Math.min(100, Math.round((monthlySpent / budgetValue) * 100)) : 0;
  const averageOrderCalories = currentMonthOrders.length
    ? Math.round(monthlyCalories / currentMonthOrders.length)
    : 0;

  const updateMonthlyBudget = (event) => {
    const nextBudget = event.target.value;
    setMonthlyBudget(nextBudget);
    localStorage.setItem(`foodBudget-${user.id}`, nextBudget);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-limewash text-basil">
              <UserRound size={30} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-basil">Profile</p>
              <h1 className="text-3xl font-black">{user.name}</h1>
              <p className="text-sm font-semibold capitalize text-zinc-500">{user.role} account</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 text-sm font-black text-zinc-700 hover:bg-zinc-200"
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <Mail className="text-basil" size={22} />
          <p className="mt-3 text-sm font-bold text-zinc-500">Email</p>
          <h2 className="break-words font-black">{user.email}</h2>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <MapPin className="text-basil" size={22} />
          <p className="mt-3 text-sm font-bold text-zinc-500">Address</p>
          <h2 className="font-black">{user.address || "Tirana"}</h2>
        </article>
        <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <Shield className="text-basil" size={22} />
          <p className="mt-3 text-sm font-bold text-zinc-500">Access role</p>
          <h2 className="font-black capitalize">{user.role}</h2>
        </article>
      </section>

      {user.role === "customer" && (
        <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-basil">Personal orders</p>
              <h2 className="text-2xl font-black">Your order history</h2>
              <p className="mt-1 text-sm text-zinc-600">
                View every order made from this client account, including status, payment, address, and delivery updates.
              </p>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-black text-white hover:bg-zinc-800"
            >
              <ReceiptText size={18} />
              Open order history
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded bg-zinc-50 p-4">
              <p className="text-sm font-bold text-zinc-500">Total orders</p>
              <h3 className="text-2xl font-black">{ordersLoading ? "..." : personalOrders.length}</h3>
            </div>
            <div className="rounded bg-zinc-50 p-4">
              <p className="text-sm font-bold text-zinc-500">Total spent</p>
              <h3 className="text-2xl font-black">{ordersLoading ? "..." : formatCurrency(totalSpent)}</h3>
            </div>
            <div className="rounded bg-zinc-50 p-4">
              <p className="text-sm font-bold text-zinc-500">Latest order</p>
              <h3 className="text-2xl font-black capitalize">
                {ordersLoading ? "..." : latestOrder?.status || "None yet"}
              </h3>
            </div>
          </div>
          <div className="mt-3 rounded bg-limewash p-4 text-basil">
            <p className="text-sm font-bold">Reward points</p>
            <h3 className="text-2xl font-black">{rewards ? `${rewards.points} pts` : "Loading..."}</h3>
            <p className="mt-1 text-sm font-black">
              Cashback balance: {rewards ? formatCurrency(rewards.cashbackBalance || 0) : "..."}
            </p>
            <p className="mt-1 text-sm font-semibold">
              Earn points on every order and redeem them at checkout for discounts, free delivery, or a free meal reward.
            </p>
          </div>
        </section>
      )}

      {user.role === "customer" && (
        <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-basil">Budget & nutrition</p>
              <h2 className="text-2xl font-black">Monthly food tracking</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Track spending for this month and estimate calories from completed food orders.
              </p>
            </div>
            <label className="block w-full sm:w-56">
              <span className="text-xs font-black uppercase text-zinc-500">
                Monthly budget in ALL ({currency} shown below)
              </span>
              <input
                type="number"
                min="0"
                value={monthlyBudget}
                onChange={updateMonthlyBudget}
                className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 font-black outline-none ring-leaf focus:ring-2"
              />
            </label>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded bg-zinc-50 p-4">
              <WalletCards className="text-basil" size={21} />
              <p className="mt-2 text-sm font-bold text-zinc-500">Spent this month</p>
              <h3 className="text-2xl font-black">{formatCurrency(monthlySpent)}</h3>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                <div className="h-full bg-leaf" style={{ width: `${budgetUsed}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-zinc-500">
                {budgetValue
                  ? `${formatCurrency(Math.max(0, budgetValue - monthlySpent))} remaining`
                  : "Set a budget to track progress"}
              </p>
            </div>
            <div className="rounded bg-zinc-50 p-4">
              <Flame className="text-basil" size={21} />
              <p className="mt-2 text-sm font-bold text-zinc-500">Monthly calories</p>
              <h3 className="text-2xl font-black">{monthlyCalories} kcal</h3>
              <p className="mt-2 text-xs font-semibold text-zinc-500">Approximate nutrition from this month orders.</p>
            </div>
            <div className="rounded bg-zinc-50 p-4">
              <ReceiptText className="text-basil" size={21} />
              <p className="mt-2 text-sm font-bold text-zinc-500">Average per order</p>
              <h3 className="text-2xl font-black">{averageOrderCalories} kcal</h3>
              <p className="mt-2 text-xs font-semibold text-zinc-500">{currentMonthOrders.length} orders this month.</p>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-xl font-black">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {user.role === "customer" && (
            <Link
              to="/orders"
              className="flex items-center gap-3 rounded bg-zinc-50 p-4 font-black text-zinc-800 hover:bg-limewash hover:text-basil"
            >
              <ClipboardList size={20} />
              Personal order history
            </Link>
          )}
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded bg-zinc-50 p-4 font-black text-zinc-800 hover:bg-limewash hover:text-basil"
            >
              <BarChart3 size={20} />
              Admin dashboard
            </Link>
          )}
          {(user.role === "restaurant" || user.role === "admin") && (
            <Link
              to="/restaurant-dashboard"
              className="flex items-center gap-3 rounded bg-zinc-50 p-4 font-black text-zinc-800 hover:bg-limewash hover:text-basil"
            >
              <Store size={20} />
              Restaurant dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
