import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, ShieldCheck, Store, UserRound } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const demoAccounts = [
  "Customer: arta@example.com / password123",
  "Admin: admin@example.com / admin123",
  "Restaurant: manager@example.com / manager123"
];

const loginPresets = [
  {
    id: "customer",
    label: "Login as client",
    icon: UserRound,
    email: "arta@example.com",
    password: "password123"
  },
  {
    id: "restaurant",
    label: "Login as manager",
    icon: Store,
    email: "manager@example.com",
    password: "manager123"
  },
  {
    id: "admin",
    label: "Login as admin",
    icon: BarChart3,
    email: "admin@example.com",
    password: "admin123"
  }
];

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    restaurantId: "1",
    securityCode: ""
  });
  const [selectedPreset, setSelectedPreset] = useState("");
  const [restaurants, setRestaurants] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isManagerLogin = !isRegister && (selectedPreset === "restaurant" || form.email === "manager@example.com");
  const isAdminLogin = !isRegister && (selectedPreset === "admin" || form.email === "admin@example.com");
  const needsSecurityCode = isManagerLogin || isAdminLogin;

  useEffect(() => {
    if (!isRegister) {
      api.restaurants().then(setRestaurants).catch(() => setRestaurants([]));
    }
  }, [isRegister]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const choosePreset = (preset) => {
    setSelectedPreset(preset.id);
    setError("");
    setForm((current) => ({
      ...current,
      email: preset.email,
      password: preset.password,
      restaurantId: preset.id === "restaurant" ? current.restaurantId || "1" : current.restaurantId,
      securityCode: ""
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        await register(form);
      } else {
        await login({
          email: form.email,
          password: form.password,
          ...(isManagerLogin ? { restaurantId: form.restaurantId } : {}),
          ...(needsSecurityCode ? { securityCode: form.securityCode } : {})
        });
      }
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg bg-ink p-6 text-white">
        <h1 className="text-4xl font-black">{isRegister ? "Create account" : "Welcome back"}</h1>
        <p className="mt-3 text-zinc-200">
          Simple JWT-based authentication simulation protects customer orders, admin KPIs, and restaurant operations.
        </p>
        <div className="mt-6 space-y-2">
          {demoAccounts.map((account) => (
            <p key={account} className="rounded bg-white/10 p-3 text-sm font-semibold">
              {account}
            </p>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-zinc-200">
        <h2 className="text-2xl font-black">{isRegister ? "Register" : "Login"}</h2>
        <div className="mt-5 space-y-4">
          {!isRegister && (
            <div>
              <span className="text-sm font-black">Choose demo role</span>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {loginPresets.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => choosePreset(preset)}
                      className={`flex items-center justify-center gap-2 rounded border px-3 py-3 text-sm font-black transition ${
                        selectedPreset === preset.id
                          ? "border-leaf bg-limewash text-basil"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      <Icon size={17} />
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {isRegister && (
            <label className="block">
              <span className="text-sm font-black">Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 outline-none ring-leaf focus:ring-2"
                required
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-black">Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 outline-none ring-leaf focus:ring-2"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-black">Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 outline-none ring-leaf focus:ring-2"
              required
            />
          </label>
          {needsSecurityCode && (
            <label className="block rounded-lg border border-amber-200 bg-amber-50 p-4">
              <span className="flex items-center gap-2 text-sm font-black text-amber-900">
                <ShieldCheck size={17} />
                Security verification code
              </span>
              <input
                name="securityCode"
                value={form.securityCode}
                onChange={handleChange}
                placeholder={isAdminLogin ? "Enter admin code" : "Enter manager code"}
                className="mt-3 w-full rounded border border-amber-200 bg-white p-3 font-semibold outline-none ring-leaf focus:ring-2"
                required
              />
              <p className="mt-2 text-xs font-semibold text-amber-800">
                Required for protected admin and manager access to customer and restaurant data.
              </p>
            </label>
          )}
          {isManagerLogin && (
            <label className="block">
              <span className="text-sm font-black">Manager restaurant</span>
              <select
                name="restaurantId"
                value={form.restaurantId}
                onChange={handleChange}
                className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 font-semibold outline-none ring-leaf focus:ring-2"
              >
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name} - {restaurant.location}
                  </option>
                ))}
              </select>
            </label>
          )}
          {isRegister && (
            <label className="block">
              <span className="text-sm font-black">Address</span>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Tirana area"
                className="mt-2 w-full rounded border border-zinc-200 bg-zinc-50 p-3 outline-none ring-leaf focus:ring-2"
              />
            </label>
          )}
        </div>

        {error && <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-full bg-leaf px-5 py-3 font-black text-white hover:bg-basil disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600">
          {isRegister ? "Already have an account? " : "Need an account? "}
          <Link to={isRegister ? "/login" : "/register"} className="font-black text-basil">
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </form>
    </div>
  );
}
