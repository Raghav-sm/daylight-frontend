export function LogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
      <rect x="2" y="6" width="14" height="20" rx="3" fill="var(--stage-todo)" />
      <rect x="10" y="3" width="14" height="20" rx="3" fill="var(--stage-progress)" />
      <rect x="18" y="9" width="14" height="20" rx="3" fill="var(--stage-done)" />
    </svg>
  );
}
