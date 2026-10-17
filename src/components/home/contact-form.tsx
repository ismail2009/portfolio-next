"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const intents = ["role", "build", "unsure"] as const;
type Intent = (typeof intents)[number];

const intentKey = { role: "intentRole", build: "intentBuild", unsure: "intentUnsure" } as const;
const messageKey = { role: "messageRole", build: "messageBuild", unsure: "messageUnsure" } as const;

const inputClass =
  "h-[50px] rounded-xl border border-line-strong bg-[#fbfbf9] px-3.5 text-base text-ink focus:border-ink";

export function ContactForm({ action, nextUrl }: { action: string; nextUrl: string }) {
  const t = useTranslations("Contact.form");
  const [intent, setIntent] = useState<Intent>("role");
  const [sending, setSending] = useState(false);

  // Back from the form service restores this page from the bfcache with the button still disabled.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setSending(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <form
      action={action}
      method="POST"
      onSubmit={() => setSending(true)}
      className="flex min-w-0 flex-[999_1_480px] flex-col gap-5"
    >
      <input type="hidden" name="_next" value={nextUrl} />
      <input type="hidden" name="_subject" value={t("subject")} />
      <input type="hidden" name="_template" value="table" />
      <input
        type="text"
        name="_honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
        <legend className="mb-2.5 p-0 text-[15px] font-semibold">{t("intent")}</legend>
        <div className="flex flex-wrap gap-2.5">
          {intents.map((value) => (
            <label
              key={value}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 rounded-full border border-line-strong bg-[#fbfbf9] px-4 text-[15px] font-medium transition-colors has-checked:border-ink has-checked:bg-ink has-checked:text-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="intent"
                value={t(intentKey[value])}
                checked={intent === value}
                onChange={() => setIntent(value)}
                className="m-0 accent-white"
              />
              {t(intentKey[value])}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-5">
        <Field id="contact-name" label={t("name")}>
          <input id="contact-name" name="name" required autoComplete="name" className={inputClass} />
        </Field>
        <Field id="contact-email" label={t("email")}>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            dir="ltr"
            className={`${inputClass} rtl:text-end`}
          />
        </Field>
      </div>

      <Field
        id="contact-company"
        label={
          <>
            {t("company")} <span className="font-normal text-muted">{t("optional")}</span>
          </>
        }
      >
        <input id="contact-company" name="company" autoComplete="organization" className={inputClass} />
      </Field>

      <Field id="contact-message" label={t(messageKey[intent])}>
        <textarea
          id="contact-message"
          name="message"
          rows={5}
          required
          className="resize-y rounded-xl border border-line-strong bg-[#fbfbf9] px-3.5 py-3 text-base text-ink focus:border-ink"
        />
      </Field>

      <button
        type="submit"
        disabled={sending}
        className="h-13 cursor-pointer self-start rounded-xl border-0 bg-accent px-7 font-semibold text-white hover:bg-ink disabled:cursor-wait disabled:opacity-70"
      >
        {sending ? t("sending") : t("submit")}
      </button>
    </form>
  );
}

function Field({ id, label, children }: { id: string; label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
