<script>
  /**
   * Decorative hero: five nested dolls, one per monitoring layer.
   * Purely presentational, so it is hidden from assistive technology.
   */
  const dolls = [
    { scale: 1, color: '#38bdf8', label: 'ОС' },
    { scale: 0.79, color: '#a78bfa', label: 'Метрики' },
    { scale: 0.59, color: '#34d399', label: 'PRAGMA' },
    { scale: 0.4, color: '#fbbf24', label: 'Расширения' },
    { scale: 0.21, color: '#fb7185', label: 'VDBE' }
  ];
</script>

<svg class="mat" viewBox="0 0 420 440" role="img" aria-label="Пять вложенных матрёшек — пять уровней мониторинга SQLite">
  <defs>
    <radialGradient id="mat-glow" cx="50%" cy="46%" r="55%">
      <stop offset="0%" stop-color="#5eead4" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#5eead4" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="mat-floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5eead4" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#5eead4" stop-opacity="0" />
    </linearGradient>
  </defs>

  <circle cx="210" cy="212" r="168" fill="url(#mat-glow)" />
  <ellipse cx="210" cy="392" rx="132" ry="18" fill="url(#mat-floor)" />

  <g class="orbits" fill="none" stroke="#2a3d5c" stroke-width="1" stroke-dasharray="3 7">
    <circle cx="210" cy="212" r="166" />
    <circle cx="210" cy="212" r="132" stroke-dasharray="2 9" />
  </g>

  <g class="sparkles" stroke="#5eead4" stroke-width="1.4" stroke-linecap="round" opacity="0.65">
    <path d="M64 118v10M59 123h10" />
    <path d="M356 296v8M352 300h8" />
    <path d="M330 96v6M327 99h6" />
  </g>

  {#each dolls as doll, i}
    <g
      class="doll"
      style={`--delay: ${i * 0.45}s`}
      transform={`translate(210 224) scale(${doll.scale})`}
    >
      <path
        d="M0 -142c-22 0-37 16-37 37 0 12 5 23 14 30-27 19-42 53-42 88 0 32 22 52 52 52h26c30 0 52-20 52-52 0-35-15-69-42-88 9-7 14-18 14-30 0-21-15-37-37-37z"
        fill="#0b1424"
        stroke={doll.color}
        stroke-width={i === 4 ? 3 : 2}
        stroke-opacity={i === 4 ? 0.95 : 0.55}
      />
      <ellipse cx="0" cy="-118" rx="16" ry="10" fill={doll.color} opacity={i === 4 ? 0.5 : 0.16} />
      <path
        d="M-18 66h36M-14 78h28"
        stroke={doll.color}
        stroke-width="2"
        stroke-linecap="round"
        opacity="0.35"
      />
    </g>
  {/each}

  <circle class="pulse" cx="210" cy="224" r="8" fill="#fb7185" opacity="0.9" />
</svg>

<style>
  .mat {
    width: 100%;
    max-width: 430px;
    height: auto;
    overflow: visible;
  }

  .doll {
    transform-box: fill-box;
    transform-origin: center;
    animation: bob 7s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  .orbits {
    transform-origin: 210px 212px;
    animation: spin 90s linear infinite;
  }

  .pulse {
    animation: core 2.8s ease-in-out infinite;
    transform-origin: 210px 224px;
  }

  @keyframes bob {
    0%,
    100% {
      translate: 0 0;
    }
    50% {
      translate: 0 -5px;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes core {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(0.85);
    }
    50% {
      opacity: 1;
      transform: scale(1.15);
    }
  }
</style>
