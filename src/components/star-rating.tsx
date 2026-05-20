// Inline star rating display. Pass an integer 0–5, or fractional for averages.
export default function StarRating({
  value,
  size = "sm",
  className = "",
}: {
  value: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim = size === "lg" ? 22 : size === "md" ? 18 : 14;
  const clamped = Math.max(0, Math.min(5, value));
  const fillPercent = (clamped / 5) * 100;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: dim * 5, height: dim }}
      role="img"
      aria-label={`${clamped.toFixed(1)} out of 5 stars`}
    >
      {/* Empty stars */}
      <Stars dim={dim} fill="#e7e5e4" />
      {/* Filled stars on top, clipped to percentage */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${fillPercent}%` }}
      >
        <Stars dim={dim} fill="#f59e0b" />
      </div>
    </div>
  );
}

function Stars({ dim, fill }: { dim: number; fill: string }) {
  return (
    <svg
      width={dim * 5}
      height={dim}
      viewBox="0 0 80 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M ${i * 16 + 8} 1 L ${i * 16 + 10.2} 6.1 L ${i * 16 + 15.5} 6.5 L ${i * 16 + 11.4} 9.9 L ${i * 16 + 12.7} 15 L ${i * 16 + 8} 12.3 L ${i * 16 + 3.3} 15 L ${i * 16 + 4.6} 9.9 L ${i * 16 + 0.5} 6.5 L ${i * 16 + 5.8} 6.1 Z`}
          fill={fill}
        />
      ))}
    </svg>
  );
}
