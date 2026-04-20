// 18 type icons + UI glyphs. Textless, self-contained SVG symbols so they stay
// legible at small sizes. Each type symbol is a rounded colored square with a
// white glyph modeled on the official Pokémon type chart iconography.

const TYPE_COLORS: Record<string, string> = {
  normal: '#9FA19F',
  fire: '#E62829',
  water: '#2980EF',
  electric: '#FAC000',
  grass: '#3FA129',
  ice: '#3DCEF3',
  fighting: '#FF8000',
  poison: '#9141CB',
  ground: '#915121',
  flying: '#81B9EF',
  psychic: '#EF4179',
  bug: '#91A119',
  rock: '#AFA981',
  ghost: '#704170',
  dragon: '#5060E1',
  dark: '#624D4E',
  steel: '#60A1B8',
  fairy: '#EF70EF',
};

const TYPE_GLYPHS: Record<string, React.ReactNode> = {
  // normal — hollow ring
  normal: (
    <circle cx="10" cy="10" r="3.8" fill="none" stroke="white" strokeWidth="1.6" />
  ),
  // fire — flame
  fire: (
    <path
      fill="white"
      d="M10 3.2c0.2 2 1.3 3.2 2.4 4.5 1.2 1.3 1.9 2.5 1.9 4 0 2.5-2 4.5-4.3 4.5s-4.3-2-4.3-4.5c0-1.2 0.5-2 1.3-2.7-0.1 1.5 0.5 2.4 1.5 2.4-0.1-2 0.6-3.5 1.5-4.7C10.6 5.6 10.2 4.5 10 3.2z"
    />
  ),
  // water — teardrop
  water: (
    <path
      fill="white"
      d="M10 3.5C10 3.5 5.7 8.4 5.7 11.5c0 2.4 1.9 4.3 4.3 4.3s4.3-1.9 4.3-4.3C14.3 8.4 10 3.5 10 3.5z"
    />
  ),
  // grass — three blades
  grass: (
    <g fill="white">
      <path d="M5.8 14.5c-0.3-1.8 0.2-3.5 1.5-4.9-0.2 1-0.1 1.9 0.3 2.7 0.6-2.7 2-4.6 4-6 0 1.2-0.1 2.4-0.3 3.5 0.8-0.8 1.7-1.3 2.7-1.5-0.9 1.7-1.5 3.7-1.7 6.2z" />
    </g>
  ),
  // electric — lightning bolt
  electric: (
    <path
      fill="white"
      d="M11.5 3L5.5 11h3.3L8 17l6.5-8h-3.5L11.5 3z"
    />
  ),
  // ice — radiant snowflake (sun-like burst)
  ice: (
    <g fill="white">
      <circle cx="10" cy="10" r="2" />
      <g stroke="white" strokeWidth="1.3" strokeLinecap="round">
        <path d="M10 4v2.5" />
        <path d="M10 13.5V16" />
        <path d="M4 10h2.5" />
        <path d="M13.5 10H16" />
        <path d="M5.8 5.8l1.8 1.8" />
        <path d="M12.4 12.4l1.8 1.8" />
        <path d="M14.2 5.8l-1.8 1.8" />
        <path d="M7.6 12.4l-1.8 1.8" />
      </g>
    </g>
  ),
  // fighting — fist (knuckles up)
  fighting: (
    <g fill="white">
      <rect x="5.5" y="7.5" width="9" height="6" rx="1.3" />
      <rect x="5.8" y="6" width="1.8" height="2.2" rx="0.6" />
      <rect x="7.9" y="5.5" width="1.8" height="2.7" rx="0.6" />
      <rect x="10.0" y="5.5" width="1.8" height="2.7" rx="0.6" />
      <rect x="12.1" y="6" width="1.8" height="2.2" rx="0.6" />
    </g>
  ),
  // poison — droplet + 3 bubbles
  poison: (
    <g fill="white">
      <ellipse cx="10" cy="11" rx="3.8" ry="3.2" />
      <circle cx="7" cy="7" r="1.1" />
      <circle cx="10" cy="5.5" r="1.1" />
      <circle cx="13" cy="7" r="1.1" />
    </g>
  ),
  // ground — stacked plates
  ground: (
    <g fill="white">
      <ellipse cx="10" cy="6.5" rx="3" ry="1" />
      <ellipse cx="10" cy="10" rx="4.5" ry="1.2" />
      <ellipse cx="10" cy="13.5" rx="6" ry="1.4" />
    </g>
  ),
  // flying — feather/wing
  flying: (
    <path
      fill="white"
      d="M4 15c0.5-4 2-7 5.5-9.5 2 0 4 0.8 5.5 2.5-1 0-2 0.3-3 0.8 1.5 0.2 2.5 0.8 3.5 2-1.2 0-2.3 0.2-3.3 0.7 1.2 0.2 2.2 0.7 3 1.7-2.5 0.5-5 1-7 2-1.5 0-3 0-4.2-0.2z"
    />
  ),
  // psychic — atom / orbit
  psychic: (
    <g stroke="white" strokeWidth="1.1" fill="none">
      <ellipse cx="10" cy="10" rx="5.5" ry="2.2" />
      <ellipse cx="10" cy="10" rx="5.5" ry="2.2" transform="rotate(60 10 10)" />
      <ellipse cx="10" cy="10" rx="5.5" ry="2.2" transform="rotate(-60 10 10)" />
      <circle cx="10" cy="10" r="1.3" fill="white" stroke="none" />
    </g>
  ),
  // bug — antennae + body
  bug: (
    <g fill="white">
      <path
        d="M10 4l-3 4h6z"
        stroke="white"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="12" r="3.5" />
      <rect x="9.5" y="7" width="1" height="2" />
    </g>
  ),
  // rock — boulder
  rock: (
    <path
      fill="white"
      d="M5 13.5l1.5-4 2-2 3-1 3 1.5 1 3-1 2.5-2 1h-7z"
      stroke="white"
      strokeWidth="0.5"
      strokeLinejoin="round"
    />
  ),
  // ghost — classic ghost silhouette
  ghost: (
    <path
      fill="white"
      d="M5.5 10c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v5l-1.3-1-1.3 1-1.3-1-1.3 1-1.3-1-1.3 1-1.1-0.9V10z"
    />
  ),
  // dragon — sharp flame / fang
  dragon: (
    <path
      fill="white"
      d="M10 3c0.5 2 1.5 3.5 2.8 4.5 1.3 1 2 2.3 2 3.8 0 2.6-2.1 4.7-4.8 4.7S5.2 13.9 5.2 11.3c0-1.2 0.5-2.1 1.3-2.7-0.1 1.3 0.4 2 1.3 2 0.2-2 1.2-4.2 2.2-7.6z"
    />
  ),
  // dark — crescent moon (like ember)
  dark: (
    <path
      fill="white"
      d="M13.5 5c-2.5 0-5 2-5 5s2.5 5 5 5c-4 0-7-2.5-7-5s3-5 7-5z"
    />
  ),
  // steel — gear
  steel: (
    <g fill="white">
      <path d="M10 3.3l1.3 1.5 1.9-0.5 0.3 2 1.8 0.9-0.7 1.8 1.3 1.5-1.3 1.5 0.7 1.8-1.8 0.9-0.3 2-1.9-0.5L10 16.7l-1.3-1.5-1.9 0.5-0.3-2-1.8-0.9 0.7-1.8L4.1 9.5l1.3-1.5-0.7-1.8 1.8-0.9 0.3-2 1.9 0.5z" />
      <circle cx="10" cy="10" r="2" fill={TYPE_COLORS.steel} />
    </g>
  ),
  // fairy — butterfly / ribbon
  fairy: (
    <g fill="white">
      <path d="M10 10l-4-3.5c-1.3-1-2-0.3-2 0.8s0.8 3.2 2.5 4.2c-1.5 0.5-2.2 1.5-2.2 2.3s0.7 1.3 1.7 1.3c1.3 0 3.2-1.1 4-2.8" />
      <path d="M10 10l4-3.5c1.3-1 2-0.3 2 0.8s-0.8 3.2-2.5 4.2c1.5 0.5 2.2 1.5 2.2 2.3s-0.7 1.3-1.7 1.3c-1.3 0-3.2-1.1-4-2.8" />
      <circle cx="10" cy="10" r="1.3" />
    </g>
  ),
};

const TYPE_NAMES = Object.keys(TYPE_COLORS);

export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-list" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="10" width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3" y="16" width="18" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>

        {/* Move category — physical: single sword, special: starburst, status: hex */}
        <symbol id="cat-phy" viewBox="0 0 16 16">
          <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="#F26B3A" />
          {/* Sword — diagonal blade with crossguard + pommel */}
          <g stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="white">
            <path d="M12 4l-6.2 6.2" strokeWidth="2" />
            <path d="M11.2 4.8L13 3" strokeWidth="2" />
            <path d="M4.4 10.4l1.8 1.8" strokeWidth="1.6" />
            <path d="M3.4 11.4l1 2.2 2.2 1-0.8-1.4-1.4-0.8z" fill="white" stroke="none" />
          </g>
        </symbol>
        <symbol id="cat-spe" viewBox="0 0 16 16">
          <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="#6C63D9" />
          <path
            d="M8 2l1.3 4.3L13.5 8l-4.2 1.7L8 14l-1.3-4.3L2.5 8l4.2-1.7z"
            fill="white"
          />
        </symbol>
        <symbol id="cat-sta" viewBox="0 0 16 16">
          <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="#8A8880" />
          <polygon points="8,3 12,5.5 12,10.5 8,13 4,10.5 4,5.5" fill="white" />
        </symbol>

        {/* Stat meta icons — shield, barrier, shoe */}
        <symbol id="i-shield" viewBox="0 0 14 14">
          <path
            d="M7 1.5L11.5 3V7.2C11.5 9.6 9.6 11.6 7 12.5C4.4 11.6 2.5 9.6 2.5 7.2V3L7 1.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="i-barrier" viewBox="0 0 14 14">
          <path
            d="M7 1.5L11.8 4V9L7 12.5L2.2 9V4L7 1.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinejoin="round"
          />
          <path
            d="M4.6 2.8V11.2M9.4 2.8V11.2M2.2 6.5H11.8"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeLinecap="round"
            opacity="0.7"
          />
        </symbol>
        <symbol id="i-shoe" viewBox="0 0 14 14">
          <path
            d="M1.5 9.5V7.5C1.5 7 1.9 6.6 2.4 6.6H5.2L7.8 4.5C8.3 4.1 9 4 9.6 4.3L11.4 5.2C12.1 5.6 12.5 6.3 12.5 7.1V9.5C12.5 10 12.1 10.4 11.6 10.4H2.4C1.9 10.4 1.5 10 1.5 9.5Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.4"
            strokeLinejoin="round"
          />
        </symbol>

        {/* 18 type badges — each a colored rounded square with a white glyph. */}
        {TYPE_NAMES.map((name) => (
          <symbol key={name} id={`type-${name}`} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" rx="4" fill={TYPE_COLORS[name]} />
            {TYPE_GLYPHS[name]}
          </symbol>
        ))}
      </defs>
    </svg>
  );
}
