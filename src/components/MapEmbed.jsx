import { MapPin } from "lucide-react";

const buildEmbedUrl = (lat, lng, zoom = 15) => {
  const delta = zoom >= 15 ? 0.012 : 0.03;
  const left = lng - delta;
  const right = lng + delta;
  const top = lat + delta;
  const bottom = lat - delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lng}`;
};

const buildSearchUrl = (query) =>
  `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;

export default function MapEmbed({
  title = "Map",
  subtitle,
  lat = 41.3275,
  lng = 19.8189,
  query = "Tirana, Albania",
  className = ""
}) {
  return (
    <section className={`overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 p-4">
        <div>
          <h2 className="font-black">{title}</h2>
          {subtitle && <p className="text-sm font-semibold text-zinc-500">{subtitle}</p>}
        </div>
        <a
          href={buildSearchUrl(query)}
          target="_blank"
          rel="noreferrer"
          className="grid h-10 w-10 place-items-center rounded-full bg-limewash text-basil hover:bg-green-100"
          aria-label="Open map"
          title="Open map"
        >
          <MapPin size={19} />
        </a>
      </div>
      <iframe
        title={title}
        src={buildEmbedUrl(lat, lng)}
        className="h-64 w-full border-0"
        loading="lazy"
      />
    </section>
  );
}
