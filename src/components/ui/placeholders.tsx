/** SVG-based placeholder images for items/lotteries without real photos */

export function ItemPlaceholder({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 56 : size === "md" ? 120 : 200;
  return (
    <svg width={dim} height={dim} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="120" rx="12" fill="url(#item-grad)" />
      <path d="M60 35L75 50H65V70H55V50H45L60 35Z" fill="white" fillOpacity="0.08" />
      <rect x="40" y="72" width="40" height="6" rx="3" fill="white" fillOpacity="0.06" />
      <rect x="48" y="82" width="24" height="4" rx="2" fill="white" fillOpacity="0.04" />
      <defs>
        <linearGradient id="item-grad" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f2847" />
          <stop offset="1" stopColor="#171d36" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function LotteryPlaceholder() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 320 180" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="320" height="180" fill="url(#lot-grad)" />
      {/* Kuji ticket shapes */}
      <rect x="120" y="50" width="80" height="80" rx="8" fill="white" fillOpacity="0.04" transform="rotate(-8 160 90)" />
      <rect x="130" y="55" width="60" height="70" rx="6" fill="white" fillOpacity="0.03" transform="rotate(5 160 90)" />
      <circle cx="160" cy="85" r="12" fill="white" fillOpacity="0.05" />
      <text x="160" y="90" textAnchor="middle" fontSize="14" fill="white" fillOpacity="0.15" fontWeight="bold">KUJI</text>
      <defs>
        <linearGradient id="lot-grad" x1="0" y1="0" x2="320" y2="180" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f2847" />
          <stop offset="1" stopColor="#12162b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function FigurePlaceholder() {
  return (
    <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="200" height="200" fill="url(#fig-grad)" />
      {/* Abstract figure silhouette */}
      <circle cx="100" cy="60" r="18" fill="white" fillOpacity="0.05" />
      <path d="M82 80 Q100 75 118 80 L115 140 H85 Z" fill="white" fillOpacity="0.04" />
      <rect x="80" y="142" width="40" height="8" rx="4" fill="white" fillOpacity="0.03" />
      <defs>
        <linearGradient id="fig-grad" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1f2847" />
          <stop offset="1" stopColor="#171d36" />
        </linearGradient>
      </defs>
    </svg>
  );
}
