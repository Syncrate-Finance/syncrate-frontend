"use client";
import Image from "next/image";
import { useState } from "react";
import styles from "./marketing.module.css";

export function SysgldIcon() {
  const [missing, setMissing] = useState(false);
  // The owner will supply public/sySGLD-icon.png. Preserve its space in the meantime.
  return missing ? (
    <span className={styles.pendingProductIcon} aria-hidden="true" />
  ) : (
    <Image
      src="/sySGLD-icon.png"
      width={68}
      height={68}
      alt=""
      unoptimized
      onError={() => setMissing(true)}
    />
  );
}
