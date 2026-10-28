"use client";
import { useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import styles from "./marketing.module.css";

// Retained from Syncrate's existing published partner catalogue and local assets.
const partners = [
  { name: "Alluca Gold", image: "/alluca.png" },
  { name: "Chainlink", image: "/chainlink.PNG" },
  { name: "Amanat Vaults", image: "/amanat.png" },
  { name: "Saffron", image: "/saffron.PNG" },
  { name: "DWF Labs", image: "/dwf.png" },
  { name: "Arrakis", image: "/arrakis.PNG" },
  { name: "RWA.xyz", image: "/rwaxyz.png" },
  { name: "Uniswap", image: "/uniswap.PNG" },
  { name: "Bureau Veritas", image: "/veritas.png" },
];

export function PartnerMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <section
      className={`${styles.container} ${styles.partners}`}
      aria-labelledby="partners-heading"
    >
      <div className={styles.partnersHeader}>
        <h2 id="partners-heading">Building With</h2>
        <button
          type="button"
          className={styles.partnerMotionControl}
          aria-controls="partner-logo-track"
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? (
            <Play size={13} aria-hidden="true" />
          ) : (
            <Pause size={13} aria-hidden="true" />
          )}
          {paused ? "Resume partner scrolling" : "Pause partner scrolling"}
        </button>
      </div>
      <div className={styles.partnerWindow}>
        <div
          id="partner-logo-track"
          className={styles.partnerTrack}
          data-paused={paused}
        >
          {[false, true].map((duplicate) => (
            <ul
              key={String(duplicate)}
              className={styles.partnerGroup}
              aria-label={duplicate ? undefined : "Syncrate partners"}
              aria-hidden={duplicate ? true : undefined}
            >
              {partners.map((partner) => (
                <li key={partner.name} className={styles.partnerItem}>
                  <Image
                    src={partner.image}
                    alt=""
                    loading="eager"
                    width={156}
                    height={64}
                    sizes="156px"
                    className={styles.partnerLogo}
                  />
                  <span>{partner.name}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
