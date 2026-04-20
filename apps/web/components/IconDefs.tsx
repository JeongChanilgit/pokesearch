// 18 type icons + UI glyphs. Textless, rendered as self-contained SVG symbols
// so they stay legible at small sizes where PokeAPI raster pills blur out.
// Each type symbol is a rounded colored square (20x20) with a white glyph.

const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A',
  fire: '#EE8130',
  water: '#6390F0',
  electric: '#F7D02C',
  grass: '#7AC74C',
  ice: '#96D9D6',
  fighting: '#C22E28',
  poison: '#A33EA1',
  ground: '#E2BF65',
  flying: '#A98FF3',
  psychic: '#F95587',
  bug: '#A6B91A',
  rock: '#B6A136',
  ghost: '#735797',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const TYPE_GLYPHS: Record<string, React.ReactNode> = {
  // normal — horizontal double bar
  normal: (
    <g fill="white">
      <rect x="5" y="8" width="10" height="1.6" rx="0.8" />
      <rect x="5" y="10.4" width="10" height="1.6" rx="0.8" />
    </g>
  ),
  // fire — flame
  fire: (
    <path
      fill="white"
      d="M10 3.5C10.8 5.2 12.5 6 12.8 8.2c0.3 1.9-0.8 3.4-2.4 3.9 0.6-0.8 0.5-2-0.4-2.7-0.3 1.2-1.4 1.5-1.4 2.7 0 0.8 0.5 1.4 1.2 1.7-2.3 0.3-4.4-1.3-4.4-3.6 0-1.6 1.1-2.4 1.8-3.5 0.7-1.1 0.8-2.2 0.5-3.2 1 0.4 1.9 1.2 2.3 2z"
    />
  ),
  // water — droplet
  water: (
    <path
      fill="white"
      d="M10 3.5C10 3.5 5.5 8.2 5.5 11.4c0 2.5 2 4.4 4.5 4.4s4.5-1.9 4.5-4.4C14.5 8.2 10 3.5 10 3.5z"
    />
  ),
  // electric — lightning bolt
  electric: (
    <path
      fill="white"
      d="M11.5 3L6 10.5h3L8 17l6-8h-3l1-6z"
    />
  ),
  // grass — leaf
  grass: (
    <path
      fill="white"
      d="M15 4.5c-0.5 5.5-3 8.5-7.5 9 0.5-1.5 1-2.5 2-3.5-1.8 0.2-2.8 0.5-4 1.5 0.5-4.5 4-7.5 9.5-7z"
    />
  ),
  // ice — 6-point snowflake
  ice: (
    <g stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none">
      <path d="M10 3.5v13" />
      <path d="M4.4 6.75l11.2 6.5" />
      <path d="M4.4 13.25l11.2-6.5" />
      <path d="M10 5l-1.3 1.3M10 5l1.3 1.3M10 15l-1.3-1.3M10 15l1.3-1.3" />
      <path d="M5 7.3l1.8 0.3M5 7.3l0.3 1.8M15 12.7l-1.8-0.3M15 12.7l-0.3-1.8" />
      <path d="M5 12.7l1.8-0.3M5 12.7l0.3-1.8M15 7.3l-1.8 0.3M15 7.3l-0.3 1.8" />
    </g>
  ),
  // fighting — fist (rounded square with knuckles)
  fighting: (
    <g fill="white">
      <rect x="5" y="7" width="10" height="7" rx="1.5" />
      <rect x="5.5" y="6" width="2" height="2" rx="0.5" />
      <rect x="8" y="6" width="2" height="2" rx="0.5" />
      <rect x="10.5" y="6" width="2" height="2" rx="0.5" />
      <rect x="13" y="6" width="2" height="2" rx="0.5" />
    </g>
  ),
  // poison — droplet with dot
  poison: (
    <g fill="white">
      <circle cx="10" cy="10" r="4.5" />
      <circle cx="10" cy="8.5" r="1" fill="#A33EA1" />
      <circle cx="10" cy="11.5" r="1" fill="#A33EA1" />
    </g>
  ),
  // ground — mountains
  ground: (
    <path
      fill="white"
      d="M3 15l4-6 3 4 3-5 4 7H3z"
    />
  ),
  // flying — wing
  flying: (
    <path
      fill="white"
      d="M3 12c3-0.5 5-2 7-4.5 2 2 4 3.5 7 4-3 1-5 2-7 4-2-2-4-3-7-3.5z"
    />
  ),
  // psychic — eye
  psychic: (
    <g>
      <ellipse cx="10" cy="10" rx="6" ry="3.5" fill="white" />
      <circle cx="10" cy="10" r="1.8" fill="#F95587" />
    </g>
  ),
  // bug — oval with antennas
  bug: (
    <g fill="white">
      <ellipse cx="10" cy="11" rx="3.5" ry="4" />
      <path d="M7.5 8l-2-2.5M12.5 8l2-2.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
    </g>
  ),
  // rock — hexagon
  rock: (
    <polygon
      fill="white"
      points="10,4 15,7 15,13 10,16 5,13 5,7"
    />
  ),
  // ghost — ghost shape
  ghost: (
    <path
      fill="white"
      d="M5 10c0-2.8 2.2-5 5-5s5 2.2 5 5v5l-1.5-1-1.5 1-1.5-1-1.5 1-1.5-1-1.5 1V10z"
    />
  ),
  // dragon — flame-spike
  dragon: (
    <path
      fill="white"
      d="M10 3l3 5-2 1 3 3-2.5 0.5 1.5 3.5L10 13l-3 3 1.5-3.5L6 12l3-3-2-1 3-5z"
    />
  ),
  // dark — crescent moon
  dark: (
    <path
      fill="white"
      d="M13 4.5c-3.5 0.5-6 3.5-6 7s2.5 6.5 6 7c-5 0-8-3.2-8-7s3-7 8-7z"
    />
  ),
  // steel — gear
  steel: (
    <g fill="white">
      <polygon points="10,3 11.3,5 13.5,4.5 13,6.7 15,8 13,9.3 13.5,11.5 11.3,11 10,13 8.7,11 6.5,11.5 7,9.3 5,8 7,6.7 6.5,4.5 8.7,5" />
      <circle cx="10" cy="8" r="1.5" fill="#B7B7CE" />
      <rect x="8.5" y="12" width="3" height="5" rx="0.5" />
    </g>
  ),
  // fairy — 4-point star
  fairy: (
    <path
      fill="white"
      d="M10 3l1.5 5 5 1.5-5 1.5-1.5 5-1.5-5-5-1.5 5-1.5z"
    />
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

        {/* Move category — physical: crossed blades, special: starburst, status: hex */}
        <symbol id="cat-phy" viewBox="0 0 16 16">
          <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="#F26B3A" />
          <g stroke="white" strokeWidth="1.8" strokeLinecap="round">
            <path d="M4 4l8 8" />
            <path d="M12 4l-8 8" />
          </g>
          <circle cx="8" cy="8" r="1.2" fill="white" />
        </symbol>
        <symbol id="cat-spe" viewBox="0 0 16 16">
          <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="#6C63D9" />
          <g fill="white">
            <path d="M8 2l1.3 4.3L13.5 8l-4.2 1.7L8 14l-1.3-4.3L2.5 8l4.2-1.7z" />
          </g>
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
