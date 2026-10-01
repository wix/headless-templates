import * as React from "react";
import Link from "@/components/compat/link";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import { ShoppingCart } from "lucide-react";

import { sectionNav } from "@/lib/data";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Sticky product bar that replaces the site header once the reader is past
 * the hero — model name left, section tabs center, BUY right.
 */
export function ProductSubnav() {
  const { count } = useCart();
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const { scrollY } = useScroll();

  React.useEffect(() => {
    return scrollY.on("change", (y) => {
      setVisible(y > window.innerHeight * 0.9);
    });
  }, [scrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.4, ease: [0.165, 0.84, 0.44, 1] }}
          className="fixed inset-x-0 top-0 z-[60] border-b border-black/5 bg-white text-ink shadow-sm"
        >
          <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-10 px-5 lg:px-10">
            <a href="#overview" className="display-heading text-xl tracking-wide">
              WX140
            </a>
            <nav className="hidden items-center gap-8 md:flex">
              {sectionNav.map((tab, i) => (
                <a
                  key={tab.label}
                  href={tab.href}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative py-1 text-[11px] font-bold uppercase tracking-[0.25em] transition-colors hover:text-ink",
                    active === i ? "text-ink" : "text-black/40"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "absolute inset-x-0 -bottom-0.5 h-0.5 bg-ink transition-transform duration-300",
                      active === i ? "scale-x-100" : "scale-x-0"
                    )}
                  />
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-6">
              <Link
                href="/cart"
                aria-label="Cart"
                className="relative text-ink transition-colors hover:text-turq"
              >
                <ShoppingCart className="size-5" />
                <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-turq text-[10px] font-bold text-white">
                  {count}
                </span>
              </Link>
              <Button variant="dark" size="sm" className="px-7" asChild>
                <a href="#kits">Buy</a>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
