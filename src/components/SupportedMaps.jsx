import { Section, SectionHeading } from "./Section";

const SUPPORTED = [
  {
    name: "Erangel",
    note: "The deepest dataset — most tournament footage is played here.",
  },
  {
    name: "Miramar",
    note: "Its own per-phase models, trained on Miramar matches.",
  },
];

const RETIRED = ["Vikendi", "Sanhok"];

export function SupportedMaps({ backendMaps }) {
  // Trust the running backend when it tells us what it supports; fall back to
  // the built-in list when it is unreachable.
  const live = Array.isArray(backendMaps) && backendMaps.length ? backendMaps : null;
  const maps = live
    ? SUPPORTED.filter((map) => live.includes(map.name))
    : SUPPORTED;

  return (
    <Section id="maps" tone="raised">
      <SectionHeading eyebrow="Coverage" title="Maps we support">
        Two maps done well, each with its own models.
      </SectionHeading>

      <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
        {maps.map((map) => (
          <div
            key={map.name}
            className="rounded-2xl border border-green-500/30 bg-green-500/5 p-7"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-green-400"
              />
              <h3 className="text-xl font-semibold">{map.name}</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              {map.note}
            </p>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          No longer supported
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          <span className="text-zinc-300">{RETIRED.join(" and ")}</span> were
          removed — too few matches to be trustworthy. Screenshots from either
          map now return a clear message instead of a bad guess.
        </p>
      </div>
    </Section>
  );
}
