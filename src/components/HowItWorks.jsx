import { Section, SectionHeading } from "./Section";

const STEPS = [
  {
    step: "01",
    title: "Find the circle",
    body: "A YOLO detector locates the safe-zone circle and measures its centre and radius.",
  },
  {
    step: "02",
    title: "Place it on the map",
    body: "Feature matching aligns your screenshot to a reference map, turning the circle into in-game coordinates.",
  },
  {
    step: "03",
    title: "Project the next zone",
    body: "A model trained per map and per phase predicts the next circle, drawn back onto your image.",
  },
];

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeading eyebrow="Under the hood" title="How it works">
        No official API exposes zone data, so ZonePredictor learns from what
        everyone can see: the map itself.
      </SectionHeading>

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {STEPS.map((item) => (
          <li
            key={item.step}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-7 transition hover:border-zinc-700"
          >
            <span className="text-sm font-bold tracking-widest text-green-400">
              {item.step}
            </span>
            <h3 className="mt-3 text-xl font-semibold">{item.title}</h3>
            <p className="mt-3 leading-relaxed text-zinc-400">{item.body}</p>
          </li>
        ))}
      </ol>

      <p className="mx-auto mt-12 max-w-3xl text-center text-sm text-zinc-500">
        Nothing is installed and nothing touches the game client — ZonePredictor
        only ever sees the image you give it.
      </p>
    </Section>
  );
}
