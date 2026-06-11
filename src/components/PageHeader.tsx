import { LiveIndicator } from "./LiveIndicator";

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, right }: Props) {
  return (
    <header className="px-6 pt-6 pb-5 border-b border-[var(--border)] bg-[var(--surface)]/60 backdrop-blur sticky top-0 z-10">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--foreground-subtle)] mb-1">
              {eyebrow}
            </div>
          )}
          <h1 className="text-[26px] font-semibold tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13.5px] text-[var(--foreground-muted)] mt-1 max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <LiveIndicator />
          {right}
        </div>
      </div>
    </header>
  );
}
