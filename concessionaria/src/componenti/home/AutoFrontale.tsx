/**
 * Auto sportiva vista di fronte, disegnata a mano in SVG.
 *
 * Una fotografia sarebbe più fedele, ma qui l'auto deve crescere dal fondo
 * dello schermo fino a riempirlo: una fotografia ingrandita venti volte si
 * sgrana, un disegno vettoriale resta nitido a qualsiasi dimensione e pesa
 * pochi chilobyte invece di qualche centinaio.
 *
 * È volutamente una silhouette scura: al buio di un'auto che arriva si vedono
 * i fari e il profilo, non la vernice. Le forme sono quelle di una coupé
 * sportiva moderna — tetto basso, spalle larghe, fari sottili inclinati, presa
 * d'aria centrale grande — senza copiare un modello esistente.
 *
 * Le parti che si illuminano portano una classe (`fanale`, `diurna`,
 * `bagliore`) perché l'accensione è governata dai fogli di stile, non da qui:
 * il disegno resta fermo e cambia solo la luce.
 */
export function AutoFrontale({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 260"
      className={className}
      aria-hidden
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="auto-corpo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#333d4f" />
          <stop offset="38%" stopColor="#1a202b" />
          <stop offset="100%" stopColor="#06080d" />
        </linearGradient>

        <linearGradient id="auto-vetro" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#1b2739" />
          <stop offset="55%" stopColor="#0a0f18" />
          <stop offset="100%" stopColor="#050710" />
        </linearGradient>

        <linearGradient id="auto-cromo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#525d70" />
          <stop offset="100%" stopColor="#1b2028" />
        </linearGradient>

        {/* Filo di luce sul bordo superiore: separa il tetto dal nero del cielo. */}
        <linearGradient id="auto-filo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4d8dff" stopOpacity="0" />
          <stop offset="30%" stopColor="#86b3ff" stopOpacity="0.75" />
          <stop offset="70%" stopColor="#86b3ff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#4d8dff" stopOpacity="0" />
        </linearGradient>

        <radialGradient id="auto-ombra" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <radialGradient id="auto-lente" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#dceaff" />
          <stop offset="100%" stopColor="#8fb8ff" />
        </radialGradient>

        {/* Reticolo della presa d'aria: una piastrella ripetuta costa meno di
            duecento linee disegnate una per una. */}
        <pattern id="auto-reticolo" width="9" height="9" patternUnits="userSpaceOnUse">
          <path d="M0 0L9 9M9 0L0 9" stroke="#39435a" strokeWidth="1.1" fill="none" />
        </pattern>
      </defs>

      {/* Ombra a terra */}
      <ellipse cx="240" cy="212" rx="205" ry="19" fill="url(#auto-ombra)" />

      {/* Ruote: si intravedono appena oltre i parafanghi. */}
      <rect x="92" y="170" width="36" height="44" rx="10" fill="#080a10" />
      <rect x="352" y="170" width="36" height="44" rx="10" fill="#080a10" />

      {/* Scocca */}
      <path
        d="M180 48C200 40 280 40 300 48C316 58 330 76 340 94C356 98 370 106 375 118L382 148C386 166 384 184 379 194L375 204L105 204L101 194C96 184 94 166 98 148L105 118C110 106 124 98 140 94C150 76 164 58 180 48Z"
        fill="url(#auto-corpo)"
      />

      {/* Filo di luce sul tetto */}
      <path
        d="M180 48C200 40 280 40 300 48"
        fill="none"
        stroke="url(#auto-filo)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Specchietti: partono da dentro il profilo della scocca, altrimenti a
          schermo intero si leggono come due barrette staccate a mezz'aria. */}
      <path d="M126 100L96 95L90 108L124 113Z" fill="#151a24" />
      <path d="M354 100L384 95L390 108L356 113Z" fill="#151a24" />

      {/* Parabrezza */}
      <path
        d="M192 55C208 48 272 48 288 55L322 93C292 85 188 85 158 93Z"
        fill="url(#auto-vetro)"
      />
      {/* Riflesso obliquo sul vetro */}
      <path d="M206 52L232 52L188 92L166 92Z" fill="#ffffff" opacity="0.05" />

      {/* Nervature del cofano */}
      <path
        d="M152 102C192 114 288 114 328 102"
        fill="none"
        stroke="#4a5568"
        strokeWidth="1.4"
        opacity="0.5"
      />
      <path
        d="M170 142C202 134 278 134 310 142"
        fill="none"
        stroke="#4a5568"
        strokeWidth="1.2"
        opacity="0.35"
      />

      {/* Prese d'aria laterali */}
      <path d="M116 162L172 162L176 188L122 188Z" fill="#0a0d13" />
      <path d="M116 162L172 162L176 188L122 188Z" fill="url(#auto-reticolo)" opacity="0.55" />
      <path d="M364 162L308 162L304 188L358 188Z" fill="#0a0d13" />
      <path d="M364 162L308 162L304 188L358 188Z" fill="url(#auto-reticolo)" opacity="0.55" />

      {/* Presa d'aria centrale */}
      <path d="M182 158L298 158L288 192L192 192Z" fill="#080a10" />
      <path d="M182 158L298 158L288 192L192 192Z" fill="url(#auto-reticolo)" opacity="0.7" />

      {/* Splitter */}
      <path d="M101 194L379 194L375 206L105 206Z" fill="url(#auto-cromo)" opacity="0.45" />

      {/* Stemma */}
      <circle cx="240" cy="132" r="10" fill="#0d121b" stroke="#5b6a85" strokeWidth="1.4" />
      <circle cx="240" cy="132" r="3.4" fill="#86b3ff" opacity="0.7" />

      {/* ── Gruppi ottici ──────────────────────────────────────────────────
          Scavo scuro, lente che si accende, firma luminosa diurna. */}
      <g>
        <path d="M110 124L176 116L181 130L116 140Z" fill="#05070b" />
        <path
          className="fanale"
          d="M112 126L174 118L179 129L118 138Z"
          fill="url(#auto-lente)"
        />
        <path
          className="diurna"
          d="M117 134L172 125"
          fill="none"
          stroke="#dbe9ff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>

      <g>
        <path d="M370 124L304 116L299 130L364 140Z" fill="#05070b" />
        <path
          className="fanale"
          d="M368 126L306 118L301 129L362 138Z"
          fill="url(#auto-lente)"
        />
        <path
          className="diurna"
          d="M363 134L308 125"
          fill="none"
          stroke="#dbe9ff"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </g>

      {/* Alone attorno ai gruppi ottici: cresce con gli abbaglianti. */}
      <ellipse className="bagliore" cx="146" cy="129" rx="70" ry="30" fill="#9cc4ff" />
      <ellipse className="bagliore" cx="334" cy="129" rx="70" ry="30" fill="#9cc4ff" />
    </svg>
  )
}
