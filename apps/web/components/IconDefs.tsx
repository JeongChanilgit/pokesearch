export function IconDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <symbol id="i-list" viewBox="0 0 24 24">
          <rect
            x="3"
            y="4"
            width="18"
            height="4"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="10"
            width="18"
            height="4"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="16"
            width="18"
            height="4"
            rx="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </symbol>
        <symbol id="i-plus" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M12 8v8M8 12h8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </symbol>

        <symbol id="cat-phy" viewBox="0 0 14 14">
          <rect
            x="2"
            y="3"
            width="10"
            height="8"
            rx="1.5"
            fill="#D85A30"
            stroke="#712B13"
            strokeWidth="0.5"
          />
        </symbol>
        <symbol id="cat-spe" viewBox="0 0 14 14">
          <circle cx="7" cy="7" r="5.5" fill="#534AB7" stroke="#26215C" strokeWidth="0.5" />
          <circle cx="7" cy="7" r="2" fill="#CECBF6" />
        </symbol>
        <symbol id="cat-sta" viewBox="0 0 14 14">
          <polygon
            points="7,1.5 12,4.5 12,9.5 7,12.5 2,9.5 2,4.5"
            fill="#888780"
            stroke="#444441"
            strokeWidth="0.5"
          />
        </symbol>

        {/* Type icons — 16×16 colored rounded square + 2-letter white initial */}
        <symbol id="type-normal" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#a0a09a" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">NO</text>
        </symbol>
        <symbol id="type-fire" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#d85a30" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">FI</text>
        </symbol>
        <symbol id="type-water" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#378add" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">WA</text>
        </symbol>
        <symbol id="type-electric" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#c99a0e" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">EL</text>
        </symbol>
        <symbol id="type-grass" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#3b8a1a" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">GR</text>
        </symbol>
        <symbol id="type-ice" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#185fa5" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">IC</text>
        </symbol>
        <symbol id="type-fighting" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#993c1d" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">FG</text>
        </symbol>
        <symbol id="type-poison" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#993556" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">PO</text>
        </symbol>
        <symbol id="type-ground" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#a07830" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">GD</text>
        </symbol>
        <symbol id="type-flying" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#5580c0" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">FL</text>
        </symbol>
        <symbol id="type-psychic" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#c0306a" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">PS</text>
        </symbol>
        <symbol id="type-bug" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#5a8a10" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">BU</text>
        </symbol>
        <symbol id="type-rock" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#807060" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">RO</text>
        </symbol>
        <symbol id="type-ghost" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#534ab7" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">GH</text>
        </symbol>
        <symbol id="type-dragon" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#26215c" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">DR</text>
        </symbol>
        <symbol id="type-dark" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#3a3832" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">DA</text>
        </symbol>
        <symbol id="type-steel" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#708090" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">ST</text>
        </symbol>
        <symbol id="type-fairy" viewBox="0 0 16 16">
          <rect width="16" height="16" rx="4" fill="#c070a0" />
          <text x="8" y="11.5" textAnchor="middle" fill="white" fontSize="7" fontWeight="700" fontFamily="system-ui,sans-serif">FA</text>
        </symbol>
      </defs>
    </svg>
  );
}
