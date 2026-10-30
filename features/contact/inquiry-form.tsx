"use client";
import { useRef, useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { businessSegments } from "./model";
import styles from "./inquiry.module.css";
export function InquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  const feedback = useRef<HTMLParagraphElement>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/v1/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          company: fields.get("company"),
          segment: fields.get("segment"),
          region: fields.get("region"),
          capacity: fields.get("capacity"),
          message: fields.get("message"),
          consent: fields.get("consent") === "on",
          website: fields.get("website"),
        }),
        signal: AbortSignal.timeout(28000),
      });
      const result = await r.json().catch(() => null);
      if (!r.ok || result?.accepted !== true)
        throw Error(
          r.status === 429
            ? "Please wait a few minutes before sending another inquiry."
            : "Your inquiry could not be sent. Please try again or email team@syncrate.org.",
        );
      setState("sent");
      form.reset();
    } catch (e) {
      setState("error");
      setError(
        e instanceof Error && e.name === "TimeoutError"
          ? "The request took too long. Please retry or email team@syncrate.org."
          : e instanceof Error
            ? e.message
            : "Please try again.",
      );
    }
    requestAnimationFrame(() => feedback.current?.focus());
  }
  if (state === "sent")
    return (
      <div className={styles.success}>
        <span>
          <Check size={27} />
        </span>
        <h3>Thank you for the introduction.</h3>
        <p ref={feedback} tabIndex={-1}>
          Your inquiry has been sent to the Syncrate team. We’ll review the
          details and follow up using the email you provided.
        </p>
        <button type="button" onClick={() => setState("idle")}>
          Send another inquiry
        </button>
      </div>
    );
  return (
    <form
      className={styles.form}
      onSubmit={submit}
      aria-label="sySGLD business inquiry"
      aria-busy={state === "sending"}
    >
      <div className={styles.formHeading}>
        <span>LET’S START WITH YOU</span>
        <h3>Tell us about your business.</h3>
      </div>
      <div className={styles.grid}>
        <label htmlFor="inquiry-name">
          Full name <span>*</span>
          <input
            id="inquiry-name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label htmlFor="inquiry-email">
          Work email <span>*</span>
          <input
            id="inquiry-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
        <label htmlFor="inquiry-company">
          Company <span>*</span>
          <input
            id="inquiry-company"
            name="company"
            autoComplete="organization"
            required
            minLength={2}
            maxLength={160}
          />
        </label>
        <label htmlFor="inquiry-segment">
          Business segment <span>*</span>
          <select id="inquiry-segment" name="segment" required defaultValue="">
            <option value="" disabled>
              Select your business
            </option>
            {businessSegments.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label htmlFor="inquiry-region">
          Region <small>Optional</small>
          <input
            id="inquiry-region"
            name="region"
            autoComplete="country-name"
            maxLength={80}
            placeholder="Where your business operates"
          />
        </label>
        <label htmlFor="inquiry-capacity">
          Gold capacity (kg) <small>Optional</small>
          <input
            id="inquiry-capacity"
            name="capacity"
            inputMode="decimal"
            maxLength={30}
            pattern="(?:[1-9][0-9]{0,6}(?:\.[0-9]{1,2})?|0\.(?:0[1-9]|[1-9][0-9]?))"
            placeholder="Indicative quantity"
            title="A positive quantity in kilograms, up to two decimal places"
          />
        </label>
      </div>
      <label htmlFor="inquiry-message">
        Anything else we should know? <small>Optional</small>
        <textarea
          id="inquiry-message"
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Your business or any question for our team"
        />
      </label>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="inquiry-website">
          Leave this field empty
          <input
            id="inquiry-website"
            name="website"
            autoComplete="off"
            tabIndex={-1}
          />
        </label>
      </div>
      <label className={styles.consent}>
        <input type="checkbox" name="consent" required />
        <span>
          I agree to Syncrate using these details to respond to my inquiry.
          Please do not include passwords, identity documents or wallet recovery
          information.
        </span>
      </label>
      {state === "error" && (
        <p className={styles.error} role="alert" ref={feedback} tabIndex={-1}>
          {error}
        </p>
      )}
      <button
        className={styles.submit}
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending inquiry…" : "Send inquiry"}
        <ArrowUpRight size={16} />
      </button>
    </form>
  );
}
