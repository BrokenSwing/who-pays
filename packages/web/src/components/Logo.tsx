interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Who Pays logo"
      role="img"
    >
      <defs>
        <clipPath id="who-pays-logo-clip">
          <circle cx="50" cy="50" r="44" />
        </clipPath>
      </defs>

      {/* Three equal pie segments clipped to outer circle */}
      <g clipPath="url(#who-pays-logo-clip)">
        {/* Top segment: -90° → 30° */}
        <path
          d="M50,50 L50,6 A44,44 0 0,1 88.1,72 Z"
          fill="#1d4ed8"
          stroke="white"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Bottom-right segment: 30° → 150° */}
        <path
          d="M50,50 L88.1,72 A44,44 0 0,1 11.9,72 Z"
          fill="#2563eb"
          stroke="white"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Bottom-left segment: 150° → 270° */}
        <path
          d="M50,50 L11.9,72 A44,44 0 0,1 50,6 Z"
          fill="#3b82f6"
          stroke="white"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* Donut hole */}
      <circle cx="50" cy="50" r="15" fill="white" />
    </svg>
  );
}
