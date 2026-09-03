"use client";

import { useState } from "react";
import { ContactSuccessModal } from "@/components/sections/contact/ContactSuccessModal";
import { Button } from "@/components/marketing/site-button";
import { Field, Input, Textarea } from "@/components/marketing/Field";
import { Select } from "@/components/marketing/Select";
import { contactSubjects } from "@/lib/contact";

const subjectOptions = contactSubjects.map((value) => ({
  value,
  label: value,
}));

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [successName, setSuccessName] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(payload.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccessName(String(formData.get("fullName") ?? ""));
      setModalOpen(true);
      setFormKey((value) => value + 1);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form
        key={formKey}
        onSubmit={handleSubmit}
        className="rounded-[1.75rem] border border-border bg-white p-6 shadow-card sm:p-7 md:p-8"
      >
        <h2 className="font-display text-2xl font-bold text-foreground sm:text-[2rem]">
          Send a Message
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill out the form below and our team will get back to you within 24
          hours.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Full Name">
            <Input placeholder="Philip" name="fullName" required />
          </Field>
          <Field label="Email Address">
            <Input
              type="email"
              placeholder="philip@gmail.com"
              name="email"
              required
            />
          </Field>
        </div>
        <Field label="Subject" className="mt-4">
          <Select
            name="subject"
            placeholder="Select an inquiry type"
            required
            options={subjectOptions}
          />
        </Field>
        <Field label="Message" className="mt-4">
          <Textarea
            placeholder="How can we help you?"
            name="message"
            required
            minLength={10}
          />
        </Field>

        {error ? (
          <p className="mt-5 rounded-xl bg-orange-soft px-3 py-2 text-sm text-orange">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="mt-6 w-full rounded-xl"
          size="lg"
          disabled={pending}
        >
          {pending ? "Sending..." : "Send Message"}
        </Button>
      </form>

      <ContactSuccessModal
        open={modalOpen}
        name={successName}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
