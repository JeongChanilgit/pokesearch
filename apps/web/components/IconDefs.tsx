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

        {/* Move category icons — physical = sword, special = wave, status = hexagon */}
        <symbol id="cat-phy" viewBox="0 0 14 14">
          <path
            d="M11.2 2L12 2.8L6.6 8.2L5 9L5.8 7.4L11.2 2Z"
            fill="#D85A30"
            stroke="#712B13"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
          <path
            d="M4.6 8.2L3 9.8L4.2 11L5.8 9.4"
            fill="none"
            stroke="#712B13"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M2.4 10.4L1.6 12.4L3.6 11.6"
            fill="#D85A30"
            stroke="#712B13"
            strokeWidth="0.6"
            strokeLinejoin="round"
          />
        </symbol>
        <symbol id="cat-spe" viewBox="0 0 14 14">
          <path
            d="M2.5 7C3 5.2 4.2 4 6 3.5"
            fill="none"
            stroke="#534AB7"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M4 8.8C4.4 7.4 5.4 6.4 6.8 6"
            fill="none"
            stroke="#534AB7"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M5.5 10.5C5.8 9.6 6.5 8.9 7.4 8.6"
            fill="none"
            stroke="#534AB7"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="8.8" cy="9.8" r="1.3" fill="#534AB7" />
        </symbol>
        <symbol id="cat-sta" viewBox="0 0 14 14">
          <polygon
            points="7,1.5 12,4.5 12,9.5 7,12.5 2,9.5 2,4.5"
            fill="#888780"
            stroke="#444441"
            strokeWidth="0.5"
          />
        </symbol>

        {/* Stat meta icons — shield (physical bulk), barrier (special bulk), shoe (speed) */}
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
          <path
            d="M1.5 9.2H12.5"
            stroke="white"
            strokeWidth="0.6"
            strokeLinecap="round"
            opacity="0.5"
          />
        </symbol>
      </defs>
    </svg>
  );
}
