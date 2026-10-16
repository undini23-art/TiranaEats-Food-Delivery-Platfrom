import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { api } from "../api";
import LoadingGrid from "../components/LoadingGrid";
import RestaurantCard from "../components/RestaurantCard";

export default function HomePage() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      api
        .restaurants({ search, cuisine })
        .then(setRestaurants)
        .catch((err) => {
          setRestaurants([]);
          setError(err.message || "Could not load restaurants from the backend API.");
        })
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [search, cuisine]);

  const cuisines = useMemo(
    () => [
      "",
      "Burgers",
      "Italian",
      "Japanese",
      "Albanian",
      "Healthy",
      "Mexican",
      "Middle Eastern",
      "Desserts",
      "Cafe",
      "Indian",
      "Greek",
      "Thai",
      "Seafood",
      "BBQ",
      "Vegan",
      "Chinese",
      "Turkish",
      "Breakfast",
      "Mediterranean",
      "Pizza"
    ],
    []
  );

  return (
    <div className="space-y-7">
      <section className="grid gap-5 rounded-lg bg-ink p-5 text-white md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <div className="flex flex-col justify-center gap-4">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
            B2C food delivery in Tirana
          </span>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
            Fast food ordering with a real e-commerce transaction flow.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-200">
            Browse restaurants, add menu items to a persistent cart, simulate payment, and watch orders move through live statuses.
          </p>
        </div>
        <img
          src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1000&q=80"
          alt="Food delivery courier"
          className="h-72 w-full rounded object-cover md:h-full"
        />
      </section>

      <section className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-200 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={19} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by restaurant, cuisine, or Tirana area"
            className="w-full rounded border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 outline-none ring-leaf focus:ring-2"
          />
        </div>
        <div className="relative min-w-52">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <select
            value={cuisine}
            onChange={(event) => setCuisine(event.target.value)}
            className="w-full appearance-none rounded border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 font-semibold outline-none ring-leaf focus:ring-2"
          >
            {cuisines.map((item) => (
              <option key={item || "all"} value={item}>
                {item || "All cuisines"}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <LoadingGrid />
      ) : error ? (
        <section className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200">
          <h2 className="text-xl font-black">Backend API is not responding</h2>
          <p className="mt-2 text-zinc-600">
            Start the backend server on port 4000, then refresh this page.
          </p>
          <code className="mt-4 inline-block rounded bg-zinc-100 px-4 py-2 text-sm font-bold text-zinc-700">
            cd backend && npm run dev
          </code>
        </section>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
          {restaurants.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-zinc-200 sm:col-span-2 lg:col-span-3">
              <h2 className="text-xl font-black">No restaurants found</h2>
              <p className="mt-2 text-zinc-600">Try another search or cuisine filter.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
