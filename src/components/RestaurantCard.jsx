import { Link } from "react-router-dom";
import { Clock, MapPin, Star } from "lucide-react";
import FoodImage from "./FoodImage";

export default function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="aspect-[16/9] overflow-hidden bg-zinc-200">
        <FoodImage
          src={restaurant.image}
          alt={restaurant.name}
          label={restaurant.cuisine}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">{restaurant.name}</h3>
            <p className="text-sm font-semibold text-zinc-500">{restaurant.cuisine}</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-limewash px-2 py-1 text-sm font-bold text-basil">
            <Star size={15} fill="currentColor" />
            {restaurant.rating}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-zinc-600">{restaurant.description}</p>
        <div className="flex flex-wrap gap-2 text-sm font-semibold text-zinc-700">
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
            <Clock size={15} />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1">
            <MapPin size={15} />
            {restaurant.location}
          </span>
        </div>
      </div>
    </Link>
  );
}
