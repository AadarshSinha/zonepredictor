import { Section, SectionHeading } from "./Section";

const TRANSITIONS = [
  { label: "Zone 1 → 2", value: 78, tone: "text-green-400" },
  { label: "Zone 2 → 3", value: 76, tone: "text-green-400" },
  { label: "Zone 3 → 4", value: 65, tone: "text-yellow-400" },
  { label: "Zone 4 → 5", value: 52, tone: "text-yellow-400" },
  { label: "Zone 5 and later", value: null, tone: "text-zinc-400" },
];

const PILLARS = [
  {
    title: "Strongest early",
    body: "The first phases are where a call still changes your rotation.",
  },
  {
    title: "Honest about limits",
    body: "Later circles are harder. We publish those numbers rather than hide them.",
  },
  {
    title: "Improving continuously",
    body: "Every screenshot becomes training data, and the models are retrained as it grows.",
  },
];

export function Performance() {
  return (
    <Section id="performance">
      <SectionHeading eyebrow="Performance" title="Built to be useful early">
        A zone call is worth most while there is still time to rotate — which is
        where the model is strongest.
      </SectionHeading>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7"
          >
            <h3 className="text-lg font-semibold">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {pillar.body}
            </p>
          </div>
        ))}
      </div>

      {/* The raw numbers, one click away rather than in everyone's face. */}
      <details className="group mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 transition hover:bg-zinc-900">
          <span>
            <span className="font-semibold">
              See per-phase accuracy numbers
            </span>
            <span className="mt-1 block text-sm text-zinc-500">
              Measured on held-out tournament matches
            </span>
          </span>
          <span
            aria-hidden="true"
            className="shrink-0 text-green-400 transition-transform duration-300 group-open:rotate-180"
          >
            ▾
          </span>
        </summary>

        <div className="border-t border-zinc-800 px-6 py-6">
          <ul className="space-y-4">
            {TRANSITIONS.map((row) => (
              <li key={row.label}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-zinc-300">{row.label}</span>
                  <span className={`font-semibold ${row.tone}`}>
                    {row.value === null ? "below 50%" : `${row.value}%`}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className={`h-full rounded-full ${
                      row.value === null
                        ? "bg-zinc-600"
                        : row.value >= 70
                          ? "bg-green-400"
                          : "bg-yellow-400"
                    }`}
                    style={{ width: `${row.value ?? 40}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-zinc-500">
            Accuracy falls in later phases because many matches end before those
            circles form, leaving less data to learn from. Trained on roughly 200
            tournament matches so far, and improving as that number grows.
          </p>
        </div>
      </details>
    </Section>
  );
}
