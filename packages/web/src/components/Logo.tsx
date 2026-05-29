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
      {/* Upper receipt body — rounded top corners, flat bottom */}
      <path
        d="M15,13 Q15,5 23,5 L77,5 Q85,5 85,13 L85,55 L15,55 Z"
        fill="#2563eb"
      />
      {/* Lower tear section — scalloped bottom.
          ctrl1 x matches side x so the join tangent is vertical (smooth). */}
      <path
        d="M15,55 L85,55 L85,72
           C85,90 62,90 62,72
           C62,90 38,90 38,72
           C38,90 15,90 15,72
           Z"
        fill="#3b82f6"
      />
      {/* Dashed split line */}
      <line
        x1="15" y1="55" x2="85" y2="55"
        stroke="white" strokeWidth="2.5" strokeDasharray="5 3"
      />
      {/* Line items */}
      <rect x="23" y="18" width="46" height="4" rx="2" fill="white" opacity="0.9" />
      <rect x="23" y="28" width="34" height="4" rx="2" fill="white" opacity="0.9" />
      <rect x="23" y="38" width="40" height="4" rx="2" fill="white" opacity="0.9" />
      {/* Total row on lower section */}
      <rect x="23" y="61" width="50" height="4" rx="2" fill="white" opacity="0.85" />
    </svg>
  );
}
