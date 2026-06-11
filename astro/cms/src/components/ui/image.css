@keyframes scanMask {
  0% {
      mask-position: 0% 200%;
  }
  100% {
      mask-position: 0% -100%;
  }
}

img[src*='12d367_71ebdd7141d041e4be3d91d80d4578dd'] {
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 1) 50%, transparent 100%);
  mask-size: 100% 200%;
  mask-repeat: no-repeat;
  animation: scanMask 2s linear infinite;
}

/*
 * Default aspect-ratio for Image component wrapper.
 * Uses :where() for zero specificity so any CSS class (e.g., Tailwind's aspect-square)
 * can easily override it. This prevents zero-height issues when height: auto is used.
 */
:where([style*="--img-aspect-ratio"]) {
  aspect-ratio: var(--img-aspect-ratio);
}

/*
 * Default width for Image component when no explicit dimensions are set.
 * Uses :where() for zero specificity so any CSS class can override it.
 * This ensures intrinsic sizing works by providing a base width from the original image.
 */
:where([style*="--img-default-width"]) {
  width: var(--img-default-width);
  max-width: 100%;
}
