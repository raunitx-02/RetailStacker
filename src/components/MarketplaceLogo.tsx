/**
 * MarketplaceLogo — renders real brand logo for Amazon, Flipkart, Meesho, Shopify.
 * Uses next/image for optimized delivery.
 */
import Image from "next/image";

export type MarketplaceId = "amazon" | "flipkart" | "meesho" | "shopify";

interface MarketplaceInfo {
  name: string;
  logoSrc: string;
  color: string;
  bg: string;
}

export const MARKETPLACE_META: Record<MarketplaceId, MarketplaceInfo> = {
  amazon: {
    name: "Amazon India",
    logoSrc: "/amazon-logo.svg",
    color: "#FF9900",
    bg: "rgba(255,153,0,0.12)",
  },
  flipkart: {
    name: "Flipkart",
    logoSrc: "/flipkart-logo.svg",
    color: "#047BD5",
    bg: "rgba(4,123,213,0.12)",
  },
  meesho: {
    name: "Meesho",
    logoSrc: "/meesho-logo.svg",
    color: "#9B30FF",
    bg: "rgba(155,48,255,0.12)",
  },
  shopify: {
    name: "Shopify",
    logoSrc: "/shopify-logo.svg",
    color: "#5E8E3E",
    bg: "rgba(94,142,62,0.12)",
  },
};

interface MarketplaceLogoProps {
  id: MarketplaceId;
  size?: number;
  showName?: boolean;
  nameStyle?: React.CSSProperties;
  className?: string;
}

export function MarketplaceLogo({
  id,
  size = 24,
  showName = false,
  nameStyle,
  className,
}: MarketplaceLogoProps) {
  const meta = MARKETPLACE_META[id];
  if (!meta) return null;

  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
    >
      <Image
        src={meta.logoSrc}
        alt={meta.name}
        width={size}
        height={size}
        style={{ objectFit: "contain", flexShrink: 0 }}
        unoptimized
      />
      {showName && (
        <span
          style={{
            fontWeight: 700,
            color: meta.color,
            ...nameStyle,
          }}
        >
          {meta.name}
        </span>
      )}
    </span>
  );
}

/** Pill badge with logo + name — used in topbar switcher */
export function MarketplacePill({
  id,
  active,
  onClick,
}: {
  id: MarketplaceId;
  active: boolean;
  onClick: () => void;
}) {
  const meta = MARKETPLACE_META[id];
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        borderRadius: 7,
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 700,
        background: active ? meta.color : "transparent",
        color: active ? "white" : "var(--text-muted)",
        transition: "all 0.15s",
      }}
    >
      <Image
        src={meta.logoSrc}
        alt={meta.name}
        width={16}
        height={16}
        style={{ objectFit: "contain", filter: active ? "brightness(0) invert(1)" : "none" }}
        unoptimized
      />
      {id === "amazon" ? "Amazon" : id === "flipkart" ? "Flipkart" : id === "meesho" ? "Meesho" : "Shopify"}
    </button>
  );
}
