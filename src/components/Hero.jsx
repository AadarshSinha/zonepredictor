import { motion } from "framer-motion";

import logo from "../assets/logo.png";

// Keep these verifiable. A number nobody can check is worse than no number.
const STATS = [
  { value: "200+", label: "Tournament matches analysed" },
  { value: "2", label: "Maps fully supported" },
  { value: "7", label: "Zone phases modelled per map" },
];

export function Hero({ backendStatus }) {
  return (
    <section
      id="top"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-28 text-center"
    >
      {/* Soft green wash behind the fold. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500/10 blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative flex flex-col items-center"
      >
        <img
          src={logo}
          alt="ZonePredictor logo"
          className="mb-6 h-24 w-24 object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.5)] md:h-28 md:w-28"
        />

        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full ${
              backendStatus === "offline" ? "bg-red-500" : "bg-green-400"
            }`}
          />
          No account required to try it
        </span>

        <h1 className="max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
          Know where the next zone lands
          <span className="block bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            before it does
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300">
          Upload a BGMI/PUBG minimap screenshot. ZonePredictor finds the current
          safe zone and projects where the next circle is most likely to form,
          learned from hundreds of hours of tournament footage.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <a
            href="#predict"
            className="rounded-lg bg-green-500 px-7 py-3.5 text-base font-semibold text-black shadow-[0_0_30px_rgba(34,197,94,0.35)] transition hover:bg-green-400"
          >
            Predict a zone
          </a>
          <a
            href="#how-it-works"
            className="rounded-lg border border-zinc-700 px-7 py-3.5 text-base font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white"
          >
            See how it works
          </a>
        </div>

        <dl className="mt-16 grid w-full max-w-2xl grid-cols-3 gap-4 border-t border-zinc-800/80 pt-8">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-2xl font-bold text-green-400 md:text-3xl">
                  {stat.value}
                </span>
                <span className="mt-1 block text-xs leading-snug text-zinc-500 md:text-sm">
                  {stat.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}
