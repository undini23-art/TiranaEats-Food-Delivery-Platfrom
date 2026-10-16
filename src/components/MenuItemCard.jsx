import { Plus } from "lucide-react";
import FoodImage from "./FoodImage";
import { useCurrency } from "../context/CurrencyContext";

export default function MenuItemCard({ item, restaurant, onAdd }) {
  const { formatCurrency } = useCurrency();

  return (
    <article className="grid grid-cols-[1fr_112px] gap-4 rounded-lg bg-white p-4 shadow-sm ring-1 ring-zinc-200 sm:grid-cols-[1fr_150px]">
      <div className="flex flex-col justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-basil">{item.category}</p>
          <h3 className="mt-1 text-lg font-black">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{item.description}</p>
          <p className="mt-2 text-xs font-bold text-zinc-500">Approx. {item.calories} kcal</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="font-black">{formatCurrency(item.price)}</span>
          <button
            onClick={() => onAdd(item, restaurant)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800"
          >
            <Plus size={16} />
            Add
          </button>
        </div>
      </div>
      <FoodImage
        src={item.image}
        alt={item.name}
        label={item.category}
        className="h-full min-h-32 w-full rounded object-cover"
      />
    </article>
  );
}
