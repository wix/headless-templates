import Link from "@/components/compat/link";
import { Mail } from "lucide-react";

const SOCIAL_ICONS: { label: string; path: string }[] = [
  {
    label: "Facebook",
    path: "M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2.1-.1-2.1 0-3.6 1.3-3.6 3.7V11H8.5v3h2.2v7h2.8Z",
  },
  {
    label: "Instagram",
    path: "M12 8.4a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Zm0 5.9a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6ZM16.9 8.2a.84.84 0 1 1-1.68 0 .84.84 0 0 1 1.68 0ZM12 5.7c1.8 0 2 0 2.7.04.7.03 1.1.14 1.4.24.3.12.6.27.8.52.25.24.4.5.52.8.1.28.2.68.24 1.39.03.7.04.92.04 2.71s0 2-.04 2.7c-.03.7-.14 1.1-.24 1.4a2.3 2.3 0 0 1-.52.8c-.24.25-.5.4-.8.52-.28.1-.68.2-1.39.24-.7.03-.92.04-2.71.04s-2 0-2.7-.04a4.2 4.2 0 0 1-1.4-.24 2.3 2.3 0 0 1-.8-.52 2.3 2.3 0 0 1-.52-.8c-.1-.28-.2-.68-.24-1.39C6.3 14 6.3 13.8 6.3 12s0-2 .04-2.7c.03-.7.14-1.1.24-1.4.12-.3.27-.6.52-.8.24-.25.5-.4.8-.52.28-.1.68-.2 1.39-.24.7-.03.92-.04 2.71-.04ZM12 4.3c-1.83 0-2.06 0-2.78.04-.72.03-1.2.15-1.63.31-.44.17-.82.4-1.19.78-.37.37-.6.75-.78 1.19-.16.42-.28.91-.31 1.63C5.27 9.97 5.26 10.2 5.26 12s0 2.06.05 2.78c.03.72.15 1.2.31 1.63.17.44.4.82.78 1.19.37.37.75.6 1.19.77.42.17.91.29 1.63.32.72.03.95.04 2.78.04s2.06 0 2.78-.04a4.9 4.9 0 0 0 1.63-.32c.44-.16.82-.4 1.19-.77.37-.37.6-.75.77-1.19.17-.42.29-.91.32-1.63.03-.72.04-.95.04-2.78s0-2.06-.04-2.78a4.9 4.9 0 0 0-.32-1.63 3.2 3.2 0 0 0-.77-1.19 3.2 3.2 0 0 0-1.19-.78c-.42-.16-.91-.28-1.63-.31C14.06 4.3 13.83 4.3 12 4.3Z",
  },
  {
    label: "YouTube",
    path: "M21.4 8s-.2-1.3-.8-1.9c-.7-.8-1.5-.8-1.9-.8C16.1 5.1 12 5.1 12 5.1s-4.1 0-6.7.2c-.4.1-1.2.1-1.9.8-.6.6-.8 1.9-.8 1.9S2.4 9.6 2.4 11.2v1.5c0 1.6.2 3.2.2 3.2s.2 1.3.8 1.9c.7.8 1.7.7 2.1.8 1.5.2 6.5.2 6.5.2s4.1 0 6.7-.2c.4-.1 1.2-.1 1.9-.8.6-.6.8-1.9.8-1.9s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2ZM10 14.6V9.4l5.2 2.6-5.2 2.6Z",
  },
];

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Technology", href: "#compare" },
      { label: "Special Projects", href: "#reviews" },
      { label: "Bike Setup", href: "#geometry" },
      { label: "Compare", href: "#compare" },
      { label: "Demo", href: "#kits" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "#support" },
      { label: "Suspension Setup", href: "#geometry" },
      { label: "Manuals", href: "#geometry" },
      { label: "Warranty", href: "#support" },
      { label: "Bike Registration", href: "#support" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Pro Program", href: "#reviews" },
      { label: "Patents", href: "#compare" },
      { label: "Contact Us", href: "#support" },
      { label: "Dealer Locator", href: "#support" },
      { label: "Careers", href: "#support" },
    ],
  },
  {
    title: "History",
    links: [
      { label: "Bike History", href: "#overview" },
      { label: "Bike Archive", href: "#overview" },
      { label: "Shipping / Returns", href: "#support" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer id="support" className="bg-ink text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr]">
          <div>
            <p className="display-heading text-4xl">Wix Cycles</p>
            <p className="tracked-tagline mt-4 text-xs text-white/50">
              Newsletter Sign Up
            </p>
            <form className="mt-4 flex max-w-sm border-b border-white/30 focus-within:border-turq">
              <input
                type="email"
                placeholder="Email address"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
              />
              <button
                type="button"
                aria-label="Subscribe"
                className="px-2 text-white/60 transition-colors hover:text-white"
              >
                <Mail className="size-5" />
              </button>
            </form>
            <div className="mt-8 flex gap-5 text-white/60">
              {SOCIAL_ICONS.map((icon) => (
                <a
                  key={icon.label}
                  href="#overview"
                  aria-label={icon.label}
                  className="transition-colors hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current">
                    <path d={icon.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="tracked-tagline text-xs text-white/50">{col.title}</h4>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-white/80 transition-colors hover:text-white"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-8 text-xs text-white/40">
          <p>© Wix Cycles 2026. A fictional demo brand — all rights reserved anyway.</p>
          {["Privacy Policy", "Terms of Use", "Accessibility", "Legal Notice"].map((label) => (
            <Link key={label} href="#support" className="transition-colors hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
