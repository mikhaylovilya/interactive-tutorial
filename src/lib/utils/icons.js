let uid = 0;

const PATHS = {
  cpu: [
    'M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2',
    'M6 6h12v12H6z',
    'M10 10h4v4h-4z'
  ],
  activity: ['M3 12h4l3 8 4-16 3 8h4'],
  wrench: [
    'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-2.1-2.1 2.3-2.1z'
  ],
  plug: ['M9 3v6M15 3v6', 'M6 9h12v3a6 6 0 0 1-12 0V9z', 'M12 18v3'],
  layers: ['M12 3 3 8l9 5 9-5-9-5z', 'M3 12l9 5 9-5', 'M3 16l9 5 9-5'],
  search: ['M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M16 16l5 5'],
  check: ['M4 12.5 9 17.5 20 6.5'],
  x: ['M6 6l12 12M18 6L6 18'],
  copy: [
    'M9 9h11v11H9z',
    'M15 5H5a1 1 0 0 0-1 1v10h2'
  ],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  sun: ['M12 4V2M12 22v-2M4 12H2M22 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4', 'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z'],
  moon: ['M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z'],
  book: ['M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z', 'M4 19a2 2 0 0 1 2-2h14'],
  chart: ['M4 20V4', 'M4 20h16', 'M8 16v-5M12 16V8M16 16v-3M20 16V6'],
  code: ['M8 6l-5 6 5 6M16 6l5 6-5 6M13 4l-2 16'],
  terminal: ['M4 5h16v14H4z', 'M7 10l2.5 2L7 14M12 15h5'],
  chevron: ['M9 6l6 6-6 6'],
  arrow: ['M4 12h15M13 6l6 6-6 6'],
  reset: ['M4 4v6h6', 'M4.5 14a8 8 0 1 0 2-8.5L4 10'],
  external: ['M14 4h6v6M20 4l-9 9', 'M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5'],
  alert: ['M12 3 2 20h20L12 3z', 'M12 9v5M12 17v.5'],
  info: ['M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z', 'M12 11v5M12 8v.5'],
  stop: ['M6 6h12v12H6z'],
  play: ['M7 4l13 8-13 8V4z'],
  grid: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
  db: ['M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3z', 'M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6', 'M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6']
};

export function iconPath(name) {
  return PATHS[name] ?? PATHS.info;
}

export function nextUid() {
  uid += 1;
  return `u${uid}`;
}
