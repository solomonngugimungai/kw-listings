import { Database, FolderTree, KeyRound, PlayCircle } from "lucide-react";

export function SetupScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 dotted-bg">
      <div className="max-w-2xl w-full bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-lg)] overflow-hidden">
        <div className="px-8 pt-8 pb-6 border-b border-[var(--border)]">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] uppercase tracking-wider font-semibold mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] live-pulse" />
            One-time setup
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Connect your Supabase project
          </h1>
          <p className="text-[15px] text-[var(--foreground-muted)] mt-2 leading-relaxed">
            The board, calendar, and live activity feed all read from Supabase.
            Five minutes of setup gets you a working demo for Alan.
          </p>
        </div>

        <ol className="divide-y divide-[var(--border)]">
          <Step
            num={1}
            icon={Database}
            title="Create a free Supabase project"
            body={
              <>
                Go to{" "}
                <a
                  href="https://supabase.com/dashboard"
                  className="underline text-[var(--accent)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  supabase.com/dashboard
                </a>{" "}
                → <strong>New project</strong>. Pick any name; remember the
                database password.
              </>
            }
          />
          <Step
            num={2}
            icon={FolderTree}
            title="Run the migrations"
            body={
              <>
                In the Supabase dashboard open <strong>SQL Editor</strong>,
                paste{" "}
                <code className="bg-[var(--background)] px-1.5 py-0.5 rounded text-[12.5px] border border-[var(--border)]">
                  supabase/migrations/0001_init.sql
                </code>{" "}
                and run it. Then run{" "}
                <code className="bg-[var(--background)] px-1.5 py-0.5 rounded text-[12.5px] border border-[var(--border)]">
                  0002_seed.sql
                </code>{" "}
                for demo data (including the Ridgeglen listing).
              </>
            }
          />
          <Step
            num={3}
            icon={KeyRound}
            title="Copy your API keys"
            body={
              <>
                In Supabase: <strong>Project Settings → API</strong>. Copy{" "}
                <em>Project URL</em> and the <em>anon</em> key. Then in this
                repo:
                <pre className="mt-2 bg-[var(--foreground)] text-[var(--surface)] text-[12px] rounded-md p-3 overflow-x-auto">
                  {`cp .env.local.example .env.local
# paste your two values into .env.local`}
                </pre>
              </>
            }
          />
          <Step
            num={4}
            icon={PlayCircle}
            title="Restart the dev server"
            body={
              <pre className="bg-[var(--foreground)] text-[var(--surface)] text-[12px] rounded-md p-3 overflow-x-auto">
                {`npm run dev`}
              </pre>
            }
            last
          />
        </ol>

        <div className="px-8 py-4 bg-[var(--background)] text-[12.5px] text-[var(--foreground-muted)]">
          Tip: you can also sign up a few teammates from the Supabase{" "}
          <strong>Authentication</strong> tab so this looks real on demo day.
        </div>
      </div>
    </div>
  );
}

function Step({
  num,
  icon: Icon,
  title,
  body,
  last,
}: {
  num: number;
  icon: typeof Database;
  title: string;
  body: React.ReactNode;
  last?: boolean;
}) {
  return (
    <li className="flex gap-4 px-8 py-5">
      <div className="shrink-0">
        <div className="h-8 w-8 rounded-full bg-[var(--background)] border border-[var(--border)] grid place-items-center text-[12.5px] font-semibold">
          {num}
        </div>
        {!last && (
          <div className="ml-4 mt-1 h-full w-px bg-[var(--border)]" />
        )}
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-[var(--foreground-muted)]" />
          <h3 className="text-[14.5px] font-semibold">{title}</h3>
        </div>
        <div className="text-[13.5px] text-[var(--foreground-muted)] leading-relaxed">
          {body}
        </div>
      </div>
    </li>
  );
}
