import * as React from "react";

import imageLoader from "@/lib/image-loader";

// Stand-in for next/image. Every call site in this project uses the same
// shape — `fill` + `sizes` + `className` — so this covers that surface rather
// than re-implementing all of next/image.
//
// The responsive srcset still comes from lib/image-loader.ts (unchanged), which
// leans on Unsplash's on-the-fly resizing. Local WebP files have no CDN
// resizing, so for those we emit a plain src with no srcset.

// next/image's default deviceSizes.
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

type ImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  /** Absolutely fills the nearest positioned ancestor, as next/image does. */
  fill?: boolean;
  /** Eager-loads and raises fetch priority (above-the-fold images). */
  priority?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

const FILL_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export default function Image({
  src,
  alt,
  className,
  sizes,
  fill,
  priority,
  quality,
  width,
  height,
  style,
}: ImageProps) {
  // Only build a srcset when the loader actually varies output by width;
  // for pass-through local assets every candidate would be identical.
  const resizable =
    imageLoader({ src, width: 640, quality }) !==
    imageLoader({ src, width: 1920, quality });

  const srcSet = resizable
    ? DEVICE_SIZES.map((w) => `${imageLoader({ src, width: w, quality })} ${w}w`).join(", ")
    : undefined;

  return (
    <img
      src={imageLoader({ src, width: width ?? 1920, quality })}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      className={className}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      style={fill ? { ...FILL_STYLE, ...style } : style}
    />
  );
}
