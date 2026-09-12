import { Section, SectionHeading } from "./Section";

const ITEMS = [
  {
    status: "live",
    title: "Single-screenshot prediction",
    body: "Upload a minimap, get the projected next circle drawn back onto it.",
  },
  {
    status: "live",
    title: "Erangel and Miramar models",
    body: "A separate model per map and per phase, not one model covering everything.",
  },
  {
    status: "next",
    title: "A far larger training set",
    body: "Every prediction feeds the dataset. Target: 10,000+ matches.",
  },
  {
    status: "next",
    title: "Prediction history",
    body: "Sign in and your past predictions follow you across devices.",
  },
];

const BADGES = {
  live: { label: "Live", className: "border-green-500/40 bg-green-500/10 text-green-300" },
  next: { label: "In progress", className: "border-blue-500/40 bg-blue-500/10 text-blue-300" },
  planned: { label: "Planned", className: "border-zinc-700 bg-zinc-800/60 text-zinc-400" },
};

export function Roadmap() {
  return (
    <Section id="roadmap" tone="raised">
      <SectionHeading eyebrow="Where this is going" title="What we are building">
        What works today, and what is actually next in the queue.
      </SectionHeading>

      <ul className="mx-auto mt-14 max-w-3xl space-y-4">
        {ITEMS.map((item) => {
          const badge = BADGES[item.status];
          return (
            <li
              key={item.title}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 sm:flex-row sm:items-start sm:gap-6"
            >
              <span
                className={`inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
              >
                {badge.label}
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
