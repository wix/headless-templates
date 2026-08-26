import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

// Timing matches the reference site's long-fade: 1s cubic-bezier(0.165, 0.84, 0.44, 1)
const variants: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.165, 0.84, 0.44, 1], delay },
  }),
};

export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  amount?: number;
}) {
  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

/** Letter-by-letter slide-up used on the hero + "features" headings */
export function LetterReveal({
  text,
  className,
  letterClassName,
  stagger = 0.07,
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  letterClassName?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
}) {
  return (
    <motion.span
      className={cn("inline-flex overflow-hidden", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.6 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={cn("inline-block", letterClassName)}
          variants={{
            hidden: { y: "110%" },
            visible: {
              y: 0,
              transition: { duration: 0.8, ease: [0.165, 0.84, 0.44, 1] },
            },
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </motion.span>
  );
}
