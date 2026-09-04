import { Hexagon } from "lucide-react";
import Reveal from "./Reveal";

const LINKS = [
  { label: "Projects", href: "#projects", sup: "6" },
  { label: "About", href: "#about" },
  { label: "Blog", href: "#blog" },
  { label: "Contact", href: "#contact" },
] as const;

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/15">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-4 sm:px-8 md:px-12">
        <Reveal delay={0} className="justify-self-start">
          <a href="#" className="flex items-center gap-2 text-white">
            <Hexagon size={24} strokeWidth={1.5} />
            <span className="text-lg font-medium tracking-tight sm:text-xl">
              novaai
            </span>
          </a>
        </Reveal>

        <nav className="hidden items-center gap-8 md:flex lg:gap-10">
          {LINKS.map((link, i) => (
            <Reveal key={link.label} delay={100 + i * 100}>
              <a
                href={link.href}
                className="text-sm text-white/85 transition-colors duration-300 hover:text-white"
              >
                {link.label}
                {"sup" in link && link.sup ? (
                  <sup className="ml-0.5 font-mono text-[10px] text-white/60">
                    {link.sup}
                  </sup>
                ) : null}
              </a>
            </Reveal>
          ))}
        </nav>

        <Reveal delay={500} className="justify-self-end">
          <a
            href="#contact"
            className="rounded-md border border-white/20 bg-white/15 px-4 py-2 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/25 sm:px-5 sm:text-sm"
          >
            Get Free Consultation
          </a>
        </Reveal>
      </div>
    </header>
  );
}
