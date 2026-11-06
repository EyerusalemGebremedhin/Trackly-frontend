export default function Logo({ size = 32, reversed = false }: { size?: number; reversed?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" role="img" aria-label="Trackly logo">
      <rect width="32" height="32" rx="8" fill={reversed ? "#FFFFFF" : "#3C050F"} />
      <path
        d="M9 16.5l4.5 4.5L23 11.5"
        fill="none"
        stroke={reversed ? "#3C050F" : "var(--color-paper)"}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}