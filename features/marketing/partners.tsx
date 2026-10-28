import Image from "next/image";
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
  return (
    <section
      className={`${styles.container} ${styles.partners}`}
      aria-labelledby="partners-heading"
    >
      <div className={styles.partnersHeader}>
        <h2 id="partners-heading">Building With</h2>
      </div>
      <div className={styles.partnerWindow}>
        <div id="partner-logo-track" className={styles.partnerTrack}>
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
                    alt={duplicate ? "" : partner.name}
                    loading="eager"
                    width={156}
                    height={64}
                    sizes="156px"
                    className={styles.partnerLogo}
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
