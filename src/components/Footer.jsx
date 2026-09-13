import logo from "../assets/logo.png";
import { EndpointSwitcher } from "./EndpointSwitcher";

const LINKS = [
  { href: "#predict", label: "Predict" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#maps", label: "Maps" },
  { href: "#performance", label: "Performance" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#contact", label: "Contact" },
];

export function Footer({ backendInfo }) {
  return (
    <footer className="border-t border-zinc-900 bg-black px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <img src={logo} alt="" className="h-7 w-7 object-contain" />
              <span className="font-semibold">
                Zone<span className="text-green-400">Predictor</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Zone prediction for BGMI and PUBG, learned from tournament footage.
              Not affiliated with Krafton, Tencent or Level Infinite.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm text-zinc-400">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-900 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} ZonePredictor. Uploaded screenshots are
            retained to improve the models.
          </p>
          {backendInfo?.version && <p>API v{backendInfo.version}</p>}
        </div>

        <EndpointSwitcher />
      </div>
    </footer>
  );
}
