// Side-profile Malinois head + neck. Sharp angular silhouette facing right.
// Ears twitch on a gentle loop (animation lives in globals.css).
export default function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="The Pack"
      className={className}
    >
      {/* Back ear — drawn first so the head partially overlaps it */}
      <g className="logo-ear-l">
        <path d="M 22 14 L 16 0 L 28 12 Z" fill="#3a2615" />
      </g>

      {/* Head + neck silhouette */}
      <path
        d="M 38 8
           L 52 18
           L 54 24
           L 84 32
           L 90 34
           L 88 38
           L 54 42
           L 50 44
           L 48 50
           L 40 78
           L 38 80
           L 6 80
           L 10 65
           L 14 45
           L 20 22
           L 24 14 Z"
        fill="#c89253"
      />

      {/* Front ear — alert, tilted forward */}
      <g className="logo-ear-r">
        <path d="M 38 14 L 44 -2 L 50 12 Z" fill="#5a3a1c" />
        <path d="M 40 12 L 44 4 L 47 11 Z" fill="#a87340" />
      </g>

      {/* Forehead shading toward deeper tan */}
      <path
        d="M 24 14 L 52 18 L 54 24 L 28 24 Z"
        fill="#a87340"
        opacity="0.55"
      />

      {/* Black mask covering muzzle from cheek to chin */}
      <path
        d="M 52 26 L 84 32 L 90 34 L 88 38 L 54 42 L 50 44 L 48 38 Z"
        fill="#1c0f06"
      />

      {/* Eye with a tiny royal-blue glint */}
      <ellipse cx="46" cy="24" rx="2.4" ry="1.8" fill="#fff5dc" />
      <circle cx="47.2" cy="24" r="1.2" fill="#1c0f06" />
      <circle cx="47.5" cy="23.4" r="0.4" fill="#60a5fa" />

      {/* Nose */}
      <ellipse cx="86" cy="34" rx="2.8" ry="1.8" fill="#0a0503" />
      <circle cx="85" cy="33.3" r="0.45" fill="#ffffff" opacity="0.55" />

      {/* Mouth indent */}
      <path
        d="M 56 40 L 76 38"
        stroke="#5a3a1c"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
