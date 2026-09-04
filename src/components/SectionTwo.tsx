import { ChevronRight } from "lucide-react";
import Reveal from "./Reveal";

const CAPABILITIES = [
  {
    index: "01",
    title: "Real-time vision",
    body: "Reads context as it happens and surfaces what matters before you ask.",
  },
  {
    index: "02",
    title: "Layered insight",
    body: "Moves from rough outline to sharp output without losing the thread.",
  },
  {
    index: "03",
    title: "Adaptive speed",
    body: "Learns your cadence and tightens every pass as you work.",
  },
] as const;

export default function SectionTwo() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen flex-col justify-between px-5 pb-12 pt-24 sm:px-8 sm:pt-28 md:px-12 md:pb-16 supports-[height:100svh]:min-h-[100svh]"
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <Reveal delay={120}>
          <div className="inline-block border-l-2 border-white bg-white/15 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-white backdrop-blur-md">
            Insight On Demand
          </div>
        </Reveal>

        <Reveal delay={220}>
          <p className="max-w-sm text-lg leading-relaxed text-white drop-shadow-md sm:text-right sm:text-xl">
            Our AI doesn't just respond — it interprets, sharpens, and delivers
            the signal you need.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-1 flex-col justify-end">
        <div className="flex flex-col gap-12 md:flex-row md:items-end md:justify-between md:gap-16">
          <div className="max-w-xl">
            <Reveal delay={180}>
              <h2 className="text-5xl font-normal leading-[1.05] tracking-tight text-white drop-shadow-lg sm:text-6xl lg:text-7xl">
                Learn to see
                <br />
                brilliantly.
              </h2>
            </Reveal>
            <Reveal delay={320}>
              <p className="mt-6 max-w-md text-sm text-white/80 drop-shadow-md sm:text-base">
                From the first sketch to the final render, Nova turns raw intent
                into decisions your team can act on — quietly, precisely, at
                speed.
              </p>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#demo"
                  className="inline-flex items-center gap-1 rounded-full bg-white px-5 py-2.5 text-xs font-medium text-black transition-colors duration-300 hover:bg-white/85 sm:text-sm"
                >
                  Run the demo
                  <ChevronRight size={14} />
                </a>
                <a
                  href="#contact"
                  className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-xs text-white backdrop-blur-md transition-colors duration-300 hover:bg-white/20 sm:text-sm"
                >
                  Free consultation
                </a>
              </div>
            </Reveal>
          </div>

          <div
            id="projects"
            className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 px-5 backdrop-blur-md sm:px-6"
          >
            {CAPABILITIES.map((item, i) => (
              <Reveal key={item.index} delay={300 + i * 110}>
                <div
                  className={`group flex gap-5 py-5 ${
                    i < CAPABILITIES.length - 1 ? "border-b border-white/15" : ""
                  }`}
                >
                  <span className="font-mono text-[11px] tracking-[0.15em] text-white/55">
                    {item.index}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-white sm:text-lg">
                        {item.title}
                      </p>
                      <ChevronRight
                        size={16}
                        className="text-white/40 transition duration-300 group-hover:translate-x-0.5 group-hover:text-white"
                      />
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                      {item.body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
