import styles from "./marketing.module.css";

/** Original vector artwork: a conceptual asset illustration, not a reserve statement. */
export function GoldIllustration() {
  return (
    <div className={styles.assetVisual}>
      <div className={styles.visualTop}>
        <span>THE PHYSICAL / DIGITAL CONNECTION</span>
        <span>01 — SGLD</span>
      </div>
      <svg
        className={styles.goldArt}
        viewBox="0 0 600 500"
        fill="none"
        role="img"
        aria-labelledby="gold-art-title gold-art-description"
      >
        <title id="gold-art-title">Gold meets onchain infrastructure</title>
        <desc id="gold-art-description">
          An original conceptual illustration of a gold bar connected to an SGLD
          token. It does not represent live reserves or balances.
        </desc>
        <defs>
          <linearGradient
            id="gold-top"
            x1="150"
            y1="170"
            x2="420"
            y2="310"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F3E2AE" />
            <stop offset=".43" stopColor="#D9B66B" />
            <stop offset="1" stopColor="#F7E5AF" />
          </linearGradient>
          <linearGradient
            id="gold-front"
            x1="165"
            y1="270"
            x2="395"
            y2="390"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#B3863C" />
            <stop offset=".53" stopColor="#D5AE65" />
            <stop offset="1" stopColor="#8F6B31" />
          </linearGradient>
          <linearGradient
            id="gold-edge"
            x1="380"
            y1="220"
            x2="390"
            y2="360"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E5C888" />
            <stop offset="1" stopColor="#9A7434" />
          </linearGradient>
          <linearGradient
            id="token"
            x1="352"
            y1="60"
            x2="500"
            y2="222"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F7E8BB" />
            <stop offset=".5" stopColor="#BD944C" />
            <stop offset="1" stopColor="#EED7A0" />
          </linearGradient>
          <radialGradient id="halo">
            <stop stopColor="#CCCEAF" stopOpacity=".55" />
            <stop offset="1" stopColor="#CCCEAF" stopOpacity="0" />
          </radialGradient>
          <filter id="gold-shadow" x="-.5" y="-1" width="2" height="3">
            <feGaussianBlur stdDeviation="16" />
          </filter>
        </defs>
        <circle cx="300" cy="245" r="230" fill="url(#halo)" />
        <g stroke="#A5B6A4" strokeWidth=".7">
          <ellipse
            cx="300"
            cy="278"
            rx="255"
            ry="147"
            transform="rotate(-22 300 278)"
          />
          <ellipse
            cx="300"
            cy="278"
            rx="220"
            ry="120"
            transform="rotate(-22 300 278)"
            strokeDasharray="2 7"
          />
          <path
            d="M45 360L550 168M88 124L500 410"
            strokeDasharray="3 8"
            opacity=".5"
          />
        </g>
        <ellipse
          cx="288"
          cy="360"
          rx="139"
          ry="28"
          fill="#465C48"
          opacity=".2"
          filter="url(#gold-shadow)"
        />
        <path
          d="M159 254L286 192L418 255L294 325Z"
          fill="url(#gold-top)"
          stroke="#F4E2B1"
        />
        <path
          d="M159 254L294 325L289 372L142 291Z"
          fill="url(#gold-front)"
          stroke="#C9A35F"
        />
        <path
          d="M294 325L418 255L433 291L289 372Z"
          fill="url(#gold-edge)"
          stroke="#B48B48"
        />
        <path
          d="M179 253L286 205L398 256L294 312Z"
          stroke="#AE8748"
          strokeOpacity=".6"
        />
        <g transform="matrix(.87 .45 -.87 .45 285 222)" fill="#7B612F">
          <text
            textAnchor="middle"
            fontFamily="Georgia, serif"
            fontSize="20"
            y="17"
          >
            SYNCRATE
          </text>
          <path d="M-37 29H37" stroke="#9C793B" />
          <text
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="9"
            letterSpacing="3"
            y="45"
          >
            GOLD
          </text>
        </g>
        <path d="M410 242L449 222V195" stroke="#526D57" strokeDasharray="4 5" />
        <circle cx="449" cy="195" r="4" fill="#365D48" />
        <g transform="translate(429 122)">
          <circle r="76" fill="#A7803B" />
          <circle
            cx="-5"
            cy="-5"
            r="76"
            fill="url(#token)"
            stroke="#F5E4B7"
            strokeWidth="2"
          />
          <circle cx="-5" cy="-5" r="64" stroke="#967038" />
          <path
            d="M-26-25H12L28-9H-9L-25 7H12L28 23H-26"
            stroke="#705523"
            strokeWidth="7"
            strokeLinejoin="round"
          />
          <text
            x="-5"
            y="44"
            textAnchor="middle"
            fill="#705523"
            fontFamily="Arial,sans-serif"
            fontSize="10"
            letterSpacing="3"
          >
            SGLD
          </text>
        </g>
        <g fill="#728571">
          <circle cx="105" cy="225" r="3" />
          <circle cx="505" cy="337" r="3" />
          <path
            d="M98 225H111M105 218V232M498 337H512M505 330V344"
            stroke="#728571"
          />
        </g>
      </svg>
      <div className={styles.visualBottom}>
        <span>
          <i />
          Physical gold. Onchain access.
        </span>
        <span>BUILT ON BASE ↗</span>
      </div>
    </div>
  );
}
