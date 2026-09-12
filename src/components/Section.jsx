import { motion } from "framer-motion";

/**
 * Shared page section: consistent rhythm, plus the fade-up-on-scroll that every
 * section used to re-declare by hand.
 */
export function Section({ id, className = "", children, tone = "default" }) {
  const background =
    tone === "raised" ? "bg-zinc-950/80" : tone === "flush" ? "" : "bg-black";

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, amount: 0.15 }}
      className={`scroll-mt-20 px-6 py-20 md:py-24 ${background} ${className}`}
    >
      <div className="mx-auto max-w-6xl">{children}</div>
    </motion.section>
  );
}

export function SectionHeading({ eyebrow, title, children }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      {children && (
        <p className="mt-4 text-base leading-relaxed text-zinc-400">{children}</p>
      )}
    </div>
  );
}
