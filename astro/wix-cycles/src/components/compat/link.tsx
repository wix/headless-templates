import * as React from "react";

// Stand-in for next/link. Astro does full-document navigation, so a plain
// anchor is the whole implementation; next/link's client-side routing and
// prefetching have no equivalent here.
type LinkProps = { href: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>;

export default function Link({ href, children, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
