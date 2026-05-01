"use client";

import { useFormState, useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/contact/actions";

const initialState: ContactState = { ok: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? "Sending…" : "Send request"}
    </button>
  );
}

export function ContactForm() {
  const [state, formAction] = useFormState(submitContact, initialState);

  if (state.ok) {
    return (
      <div className="card border-l-4 border-l-emerald-500" role="status" aria-live="polite">
        <h3 className="font-display text-xl font-semibold text-ink">Message sent</h3>
        <p className="mt-2 text-sm text-ink-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="card flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Your name"
          name="name"
          autoComplete="name"
          required
          error={state.errors?.name}
        />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          error={state.errors?.phone}
        />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        error={state.errors?.email}
      />

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Preferred way to reach you</legend>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          {(["phone", "email", "either"] as const).map((value) => (
            <label
              key={value}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-100 bg-white px-3 py-1.5 text-ink-muted has-[:checked]:border-brand-600 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700"
            >
              <input type="radio" name="preferredContact" value={value} defaultChecked={value === "either"} className="accent-brand-600" />
              <span className="capitalize">{value}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 text-sm text-ink">
        <input type="checkbox" name="newPatient" value="yes" className="mt-1 accent-brand-600" />
        <span>I'm a new patient.</span>
      </label>

      <div>
        <label htmlFor="message" className="text-sm font-semibold text-ink">
          How can we help?
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          aria-invalid={state.errors?.message ? true : undefined}
          className="mt-2 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          placeholder="Tell us a little about what you're looking for, or any preferred days/times."
        />
        {state.errors?.message && (
          <p className="mt-1 text-xs text-rose-600">{state.errors.message}</p>
        )}
      </div>

      {/* Honeypot — hidden from users, attractive to bots */}
      <div aria-hidden className="hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {state.message && !state.ok && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
          {state.message}
        </p>
      )}

      <SubmitButton />
      <p className="text-xs text-ink-muted">
        We respond during normal business hours. For urgent dental emergencies, please call us directly.
      </p>
    </form>
  );
}

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
};

function Field({ label, name, type = "text", required, autoComplete, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={name} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className="mt-2 w-full rounded-2xl border border-brand-100 bg-white px-4 py-3 text-sm text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
