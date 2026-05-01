"use server";

import { Resend } from "resend";
import { z } from "zod";
import { site } from "@/lib/site";

const ContactSchema = z.object({
  name: z.string().min(2, "Please enter your name.").max(120),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().min(7, "Please enter a phone number.").max(40),
  preferredContact: z.enum(["phone", "email", "either"]).default("either"),
  newPatient: z.string().optional(),
  message: z.string().min(5, "A short message helps us prepare.").max(2000),
  // Honeypot
  website: z.string().max(0).optional(),
});

export type ContactState = {
  ok: boolean;
  message: string;
  errors?: Partial<Record<keyof z.infer<typeof ContactSchema>, string>>;
};

export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = ContactSchema.safeParse(raw);

  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof z.infer<typeof ContactSchema>;
      if (!errors[key]) errors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  if (parsed.data.website && parsed.data.website.length > 0) {
    return { ok: true, message: "Thanks — we'll be in touch soon." };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? site.email;
  const from = process.env.CONTACT_FROM_EMAIL ?? `no-reply@${new URL(site.url).hostname}`;

  if (!apiKey) {
    console.error("RESEND_API_KEY is not configured. Contact submission was not sent.", parsed.data);
    return {
      ok: false,
      message: "Email isn't fully configured yet. Please call us at " + site.phone.display + " in the meantime.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const subject = `New appointment request from ${parsed.data.name}`;
    const lines = [
      `Name: ${parsed.data.name}`,
      `Email: ${parsed.data.email}`,
      `Phone: ${parsed.data.phone}`,
      `Preferred contact: ${parsed.data.preferredContact}`,
      `New patient: ${parsed.data.newPatient ? "Yes" : "No"}`,
      "",
      "Message:",
      parsed.data.message,
    ];
    await resend.emails.send({
      from,
      to,
      replyTo: parsed.data.email,
      subject,
      text: lines.join("\n"),
    });
  } catch (err) {
    console.error("Failed to send contact email", err);
    return {
      ok: false,
      message: "Something went wrong sending your message. Please call us at " + site.phone.display + ".",
    };
  }

  return {
    ok: true,
    message: "Thanks! We received your request and will reach out shortly.",
  };
}
