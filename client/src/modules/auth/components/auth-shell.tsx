import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  showcase: ReactNode;
};

function AuthShell({ children, showcase }: AuthShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_55%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl items-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-border/80 bg-white/80 shadow-panel backdrop-blur-xl lg:grid-cols-[1.02fr_0.98fr]">
          {showcase}

          <section className="relative px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 xl:px-12 xl:py-12">
            <div className="dot-grid-light absolute inset-0 opacity-30" />
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-blue-400/10 blur-[100px]" />

            <div className="relative z-10 mx-auto flex h-full max-w-xl flex-col justify-center">
              {children}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default AuthShell;
