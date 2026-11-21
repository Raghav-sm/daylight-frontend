export type LogoSize = 'sidebar' | 'inline' | 'hero' | number;

type LogoProps = {
  size?: LogoSize;
  className?: string;
  variant?: 'wordmark' | 'icon';
  collapsed?: boolean;
};

const WORDMARK_HEIGHT: Record<Exclude<LogoSize, number>, number> = {
  sidebar: 26,
  inline: 17,
  hero: 62,
};

const ICON_SIZE: Record<Exclude<LogoSize, number>, number> = {
  sidebar: 20,
  inline: 16,
  hero: 46,
};

function resolveWordmarkHeight(size: LogoSize): number {
  return typeof size === 'number' ? Math.round((size * 62) / 58) : WORDMARK_HEIGHT[size];
}

function resolveIconSize(size: LogoSize): number {
  return typeof size === 'number' ? size : ICON_SIZE[size];
}

/** Daylight wordmark (full SVG). Uses theme tokens so light/dark modes update automatically. */
export function Logo({ size = 'hero', className, variant = 'wordmark', collapsed = false }: LogoProps) {
  if (variant === 'icon' || collapsed) {
    return <LogoIcon size={size} className={className} />;
  }

  const height = resolveWordmarkHeight(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 10 208 62"
      fill="none"
      role="img"
      aria-label="Daylight"
      style={{ height: `${height}px`, width: 'auto' }}
      className={`block shrink-0 ${className ?? ''}`.trim()}
    >
      <rect x="0" y="12" width="9.05" height="46" fill="var(--foreground)" />
      <path d="M 9.05 12 A 23 23 0 0 1 9.05 58 L 9.05 12 Z" fill="var(--stage-progress)" />
      <g
        fill="var(--foreground)"
        stroke="var(--foreground)"
        strokeWidth="24"
        strokeLinejoin="round"
        paintOrder="stroke fill"
      >
        <path
          transform="translate(32.630 58.000) scale(0.028320313 -0.028320313)"
          d="M471 -26Q365 -26 278.5 14Q192 54 141 131Q90 208 90 318Q90 414 128 474Q166 534 229.5 568.5Q293 603 370 620Q447 637 525 647Q625 660 688 667Q751 674 781.5 691Q812 708 812 749L812 755Q812 825 786 873.5Q760 922 708 948Q656 974 578 974Q498 974 441 949Q384 924 348.5 886.5Q313 849 295 810L122 867Q165 969 238 1026.5Q311 1084 399 1108Q487 1132 573 1132Q629 1132 700.5 1118.5Q772 1105 838.5 1065Q905 1025 948.5 946.5Q992 868 992 737L992 0L815 0L815 152L803 152Q784 113 742 71.5Q700 30 633 2Q566 -26 471 -26ZM502 133Q602 133 671 172Q740 211 776 273.5Q812 336 812 404L812 559Q801 546 764 535.5Q727 525 679.5 517Q632 509 587.5 503.5Q543 498 517 495Q452 487 395.5 467.5Q339 448 305 410.5Q271 373 271 309Q271 251 301 212Q331 173 383 153Q435 133 502 133Z"
        />
        <path
          transform="translate(63.363 58.000) scale(0.028320313 -0.028320313)"
          d="M140 -405L186 -249L205 -254Q260 -268 305 -261.5Q350 -255 386 -217Q422 -179 449 -99L481 -6L54 1118L251 1118L489 455Q527 351 553 249Q579 147 608 51L542 51Q571 147 597.5 249.5Q624 352 661 455L901 1118L1097 1118L606 -167Q572 -256 524.5 -313.5Q477 -371 414 -398.5Q351 -426 272 -426Q224 -426 189 -419Q154 -412 140 -405Z"
        />
        <path
          transform="translate(95.257 58.000) scale(0.028320313 -0.028320313)"
          d="M338 1490L338 0L158 0L158 1490Z"
        />
        <path
          transform="translate(108.318 58.000) scale(0.028320313 -0.028320313)"
          d="M158 0L158 1118L338 1118L338 0ZM249 1301Q198 1301 161 1336Q124 1371 124 1420Q124 1470 161 1504.5Q198 1539 249 1539Q301 1539 338 1504.5Q375 1470 375 1420Q375 1371 338 1336Q301 1301 249 1301Z"
        />
        <path
          transform="translate(121.378 58.000) scale(0.028320313 -0.028320313)"
          d="M611 -442Q487 -442 396.5 -410.5Q306 -379 246 -327Q186 -275 151 -214L297 -120Q321 -152 356.5 -191Q392 -230 452.5 -257.5Q513 -285 611 -285Q745 -285 831.5 -221Q918 -157 918 -19L918 205L901 205Q882 173 847.5 129Q813 85 748.5 51.5Q684 18 576 18Q442 18 335 81.5Q228 145 166 267Q104 389 104 564Q104 737 165 864.5Q226 992 333.5 1062Q441 1132 580 1132Q688 1132 752.5 1096.5Q817 1061 852 1015Q887 969 906 939L923 939L923 1118L1098 1118L1098 -29Q1098 -173 1033 -264.5Q968 -356 857.5 -399Q747 -442 611 -442ZM606 178Q708 178 778 224.5Q848 271 884 358.5Q920 446 920 568Q920 687 884.5 777.5Q849 868 779 919.5Q709 971 606 971Q500 971 429 916.5Q358 862 322.5 771Q287 680 287 568Q287 453 323 365Q359 277 430 227.5Q501 178 606 178Z"
        />
        <path
          transform="translate(155.963 58.000) scale(0.028320313 -0.028320313)"
          d="M338 670L338 0L158 0L158 1490L338 1490L338 847L307 847Q358 1002 452.5 1067Q547 1132 674 1132Q787 1132 872.5 1085.5Q958 1039 1005.5 945.5Q1053 852 1053 710L1053 0L872 0L872 695Q872 824 804.5 897Q737 970 620 970Q540 970 476 935Q412 900 375 833Q338 766 338 670Z"
        />
        <path
          transform="translate(189.273 58.000) scale(0.028320313 -0.028320313)"
          d="M598 1118L598 964L20 964L20 1118ZM188 1384L368 1384L368 290Q368 215 398.5 180.5Q429 146 500 146Q517 146 543.5 150Q570 154 592 158L629 6Q601 -4 565.5 -9Q530 -14 495 -14Q350 -14 269 62.5Q188 139 188 276Z"
        />
      </g>
    </svg>
  );
}

/** The full Daylight D mark (stem + amber sun bowl) as a square SVG icon. */
export function LogoIcon({ size = 24, className }: Pick<LogoProps, 'size' | 'className'>) {
  const px = resolveIconSize(size);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 46 46"
      fill="none"
      role="img"
      aria-label="Daylight"
      width={px}
      height={px}
      className={`block shrink-0 ${className ?? ''}`.trim()}
    >
      <rect x="6.975" y="0" width="9.05" height="46" fill="currentColor" />
      <path d="M 16.025 0 A 23 23 0 0 1 16.025 46 L 16.025 0 Z" fill="var(--stage-progress)" />
    </svg>
  );
}
