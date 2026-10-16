import { useState } from "react";

export default function FoodImage({ src, alt, label, className = "", fallbackClassName = "" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-limewash via-white to-zinc-100 text-center ${className} ${fallbackClassName}`}
        role="img"
        aria-label={alt}
      >
        <span className="px-3 text-sm font-black uppercase tracking-wide text-basil">
          {label || alt || "Food"}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
