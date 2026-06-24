type SynaptecMarkProps = {
  size?: number;
  className?: string;
  title?: string;
};

/**
 * Synaptec "synapse burst" mark: a central node with orange spokes radiating
 * out to satellite nodes, evoking a firing synapse / neural hub.
 */
export function SynaptecMark({ size = 40, className, title = "Synaptec" }: SynaptecMarkProps) {
  const spokes = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="synaptec-core" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FBB05A" />
          <stop offset="60%" stopColor="#F0851E" />
          <stop offset="100%" stopColor="#D4730D" />
        </radialGradient>
      </defs>
      {spokes.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 24 + Math.cos(rad) * 16;
        const y = 24 + Math.sin(rad) * 16;
        const isMajor = deg % 90 === 0;
        return (
          <g key={deg}>
            <line
              x1="24"
              y1="24"
              x2={x}
              y2={y}
              stroke="#F0851E"
              strokeWidth={isMajor ? 2.4 : 1.6}
              strokeLinecap="round"
              opacity={isMajor ? 0.95 : 0.55}
            />
            <circle cx={x} cy={y} r={isMajor ? 3 : 2} fill={isMajor ? "#F0851E" : "#E2897C"} />
          </g>
        );
      })}
      <circle cx="24" cy="24" r="8.5" fill="url(#synaptec-core)" />
      <circle cx="24" cy="24" r="3.4" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}
