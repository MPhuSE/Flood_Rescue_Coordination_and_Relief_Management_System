import type { ReactNode } from "react";
import SectionLabel from "../../../components/common/section-label";
import SurfaceCard from "../../../components/common/surface-card";

type ShowcaseMetric = {
  label: string;
  value: string;
};

type AuthShowcaseProps = {
  badgeLabel: string;
  description: string;
  eyebrow: string;
  highlights: string[];
  metrics: ShowcaseMetric[];
  title: ReactNode;
};

function AuthShowcase({
  badgeLabel,
  description,
  eyebrow,
  highlights,
  metrics,
  title,
}: AuthShowcaseProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-950 via-blue-950 to-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10 xl:px-12 xl:py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_30%)]" />

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="space-y-6">
          <SectionLabel inverse label={badgeLabel} />
          <div className="space-y-4">
            <p className="max-w-fit rounded-full border border-white/10 bg-white/6 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-sky-100/80">
              {eyebrow}
            </p>
            <div className="max-w-2xl space-y-4">
              <h1 className="text-4xl font-semibold leading-tight tracking-[-0.03em] text-white sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-200/85">
                {description}
              </p>
            </div>
          </div>
        </div>

        <SurfaceCard contentClassName="p-6 lg:p-7" variant="dark">
          <div className="space-y-5 rounded-[1.75rem] border border-white/10 bg-slate-950/24 p-5 water-lines">
            <div>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-sky-100/70">
                Điều phối cứu hộ
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                Giao diện đơn giản, dễ nhìn cho người trực hệ thống
              </p>
            </div>

            <div className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/6 px-4 py-3"
                >
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-sky-300" />
                  <p className="text-sm leading-6 text-slate-100/88">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </SurfaceCard>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <SurfaceCard
              key={metric.label}
              contentClassName="p-5"
              variant="dark"
            >
              <p className="text-3xl font-semibold tracking-[-0.02em] text-white">
                {metric.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200/72">
                {metric.label}
              </p>
            </SurfaceCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AuthShowcase;
