type HackBannerProps = {
  className?: string
  /** mobile = im Textfluss, desktop = absolut rechts im Hero */
  variant?: 'desktop' | 'mobile'
}

/**
 * "Beweisfoto"-Panel im Hero: sieht aus wie ein Terminal-Fenster,
 * in dem jemand die Startseite übernommen hat.
 */
export function HackBanner({ className = '', variant = 'desktop' }: HackBannerProps) {
  const isDesktop = variant === 'desktop'

  return (
    <div
      className={[
        'hack-wrap',
        isDesktop
          ? 'hidden xl:block absolute bottom-6 right-6 top-auto z-20 w-[400px] rotate-[-1.6deg]'
          : 'mt-10 w-full max-w-xl rotate-[-1deg] xl:hidden',
        className,
      ].join(' ')}
    >
      <style>{`
        .hack-wrap { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
        .hack-frame {
          position: relative;
          background: #04070a;
          border: 1px solid rgba(74, 222, 128, .55);
          border-radius: 10px;
          box-shadow: 0 24px 60px -18px rgba(0,0,0,.85), 0 0 0 1px rgba(0,0,0,.6), 0 0 34px -6px rgba(74,222,128,.45);
          overflow: hidden;
          animation: hack-in .7s cubic-bezier(.2,.8,.2,1) both;
        }
        .hack-scan {
          position: absolute; inset: 0; pointer-events: none;
          background: repeating-linear-gradient(180deg, rgba(0,0,0,.28) 0 1px, rgba(0,0,0,0) 1px 3px);
          mix-blend-mode: multiply;
        }
        .hack-glitch { position: relative; display: inline-block; }
        .hack-glitch::before, .hack-glitch::after {
          content: attr(data-text);
          position: absolute; left: 0; top: 0; width: 100%; overflow: hidden;
        }
        .hack-glitch::before { color: #22d3ee; transform: translateX(-2px); clip-path: inset(0 0 55% 0); animation: hack-shift 3.2s steps(2, end) infinite; }
        .hack-glitch::after  { color: #f472b6; transform: translateX(2px);  clip-path: inset(55% 0 0 0); animation: hack-shift 2.6s steps(2, end) infinite reverse; }
        @keyframes hack-shift { 0%,92%,100% { transform: translateX(-2px); } 93% { transform: translateX(-6px); } 96% { transform: translateX(4px); } }
        @keyframes hack-in { from { opacity: 0; transform: translateY(14px) scale(.97); } to { opacity: 1; transform: none; } }
        .hack-tape {
          position: absolute; top: 9px; right: -38px; z-index: 30;
          transform: rotate(35deg);
          background: #facc15; color: #1a1a1a;
          font-size: 10px; font-weight: 800; letter-spacing: .16em;
          padding: 3px 44px; text-transform: uppercase;
          box-shadow: 0 2px 10px rgba(0,0,0,.5);
        }
        .hack-blink { animation: hack-blink 1.1s steps(1, end) infinite; }
        @keyframes hack-blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          .hack-frame, .hack-glitch::before, .hack-glitch::after, .hack-blink { animation: none; }
        }
      `}</style>

      <div className="hack-frame">
        <span className="hack-tape">kompromittiert</span>

        {/* Terminal-Kopf */}
        <div className="flex items-center gap-2 border-b border-green-400/25 bg-[#07120c] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
          <span className="ml-2 truncate text-[11px] text-green-300/80">
            root@sunds-messebau:~$ ./beweis --foto
          </span>
        </div>

        {/* Beweisfoto */}
        <div className="relative">
          <img
            src="/images/hack-beweis.webp"
            alt="Beweisfoto: die Startseite von S&S Messebau wurde übernommen"
            width={1600}
            height={995}
            loading="eager"
            decoding="async"
            className="block h-[210px] w-full object-cover"
          />
          <span className="hack-scan" aria-hidden="true" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04070a] via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold tracking-widest text-green-400 ring-1 ring-green-400/50">
            BEWEIS&nbsp;#1
          </span>
        </div>

        {/* Meldung */}
        <div className="px-3 pb-3 pt-2">
          <p className="hack-glitch text-lg font-extrabold leading-none tracking-tight text-green-400" data-text="SITE GEHACKT">
            SITE GEHACKT
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-green-200/70">
            <span className="text-green-400">$</span> zugriff erlangt auf <span className="text-white">/index.html</span> · diese Seite gehört jetzt uns
            <span className="hack-blink ml-1 inline-block h-3 w-[7px] translate-y-[1px] bg-green-400 align-baseline" aria-hidden="true" />
          </p>
        </div>
      </div>
    </div>
  )
}
