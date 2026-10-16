import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, ClipboardList, LogOut, ShoppingBag, Store, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useCurrency } from "../context/CurrencyContext";

const navClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-ink text-white" : "text-zinc-700 hover:bg-zinc-100"
  }`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { currency, currencies, setCurrency } = useCurrency();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return undefined;
    }

    const loadNotifications = () => {
      api
        .notifications()
        .then((items) => setUnreadNotifications(items.filter((item) => !item.read).length))
        .catch(() => setUnreadNotifications(0));
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#f8faf8]">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded bg-leaf text-white">
              <Store size={20} />
            </span>
            TiranaEats
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navClass}>
              Restaurants
            </NavLink>
            <NavLink to="/orders" className={navClass}>
              Orders
            </NavLink>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
            {(user?.role === "restaurant" || user?.role === "admin") && (
              <NavLink to="/restaurant-dashboard" className={navClass}>
                Restaurant
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="currency">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-10 rounded-full border border-zinc-200 bg-zinc-100 px-3 text-sm font-black text-ink outline-none ring-leaf focus:ring-2"
              title="Currency"
            >
              {Object.entries(currencies).map(([code, details]) => (
                <option key={code} value={code}>
                  {code} - {details.label}
                </option>
              ))}
            </select>
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-ink hover:bg-zinc-200"
              aria-label="Shopping cart"
              title="Shopping cart"
            >
              <ShoppingBag size={20} />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-leaf px-1 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                <Link
                  to="/notifications"
                  className="relative grid h-10 w-10 place-items-center rounded-full bg-zinc-100 text-ink hover:bg-zinc-200"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Bell size={19} />
                  {unreadNotifications > 0 && (
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  className="hidden items-center gap-2 rounded-full bg-limewash px-3 py-2 text-sm font-semibold text-basil hover:bg-green-100 sm:flex"
                  title="Profile"
                >
                  <UserRound size={16} />
                  {user.name}
                </Link>
                <Link
                  to="/profile"
                  className="grid h-10 w-10 place-items-center rounded-full bg-limewash text-basil hover:bg-green-100 sm:hidden"
                  aria-label="Profile"
                  title="Profile"
                >
                  <UserRound size={18} />
                </Link>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="grid h-10 w-10 place-items-center rounded-full bg-zinc-100 hover:bg-zinc-200"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
          <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-limewash text-basil">
              <LogOut size={22} />
            </div>
            <h2 className="mt-4 text-2xl font-black">Are you sure you want to log out?</h2>
            <p className="mt-2 text-zinc-600">
              We will keep your demo ready for next time. See you later, {user?.name || "friend"}.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-full bg-zinc-100 px-5 py-3 text-sm font-black text-zinc-700 hover:bg-zinc-200"
              >
                Stay logged in
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-ink px-5 py-3 text-sm font-black text-white hover:bg-zinc-800"
              >
                Yes, log out
              </button>
            </div>
          </section>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-zinc-600 sm:px-6">
          <p>TiranaEats university prototype. Commission revenue model: 15% per simulated order.</p>
          <div className="flex items-center gap-2 font-semibold text-zinc-800">
            <ClipboardList size={16} />
            Browsing {"->"} Cart {"->"} Checkout {"->"} Live Status
          </div>
        </div>
      </footer>
    </div>
  );
}
