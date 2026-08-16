"use client";

import { useState } from "react";
import { BootcampSuccessModal } from "@/components/sections/bootcamp/BootcampSuccessModal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";

export function BootcampForm() {
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
      const response = await fetch("/api/bootcamp", {
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
        className="w-full space-y-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:rounded-3xl sm:p-6 md:p-8"
      >
        <h2 className="font-display text-xl font-bold text-navy sm:text-2xl">
          Reserve Your Spot
        </h2>
        <Field label="Full Name">
          <Input placeholder="John Doe" name="fullName" required />
        </Field>
        <Field label="Email Address">
          <Input
            type="email"
            placeholder="john@example.com"
            name="email"
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Age">
            <Input type="number" placeholder="22" name="age" min={13} max={80} required />
          </Field>
          <Field label="Gender">
            <Select
              name="gender"
              placeholder="Select gender"
              required
              options={[
                { value: "Female", label: "Female" },
                { value: "Male", label: "Male" },
                { value: "Prefer not to say", label: "Prefer not to say" },
              ]}
            />
          </Field>
        </div>
        <Field label="WhatsApp Number" hint="*required">
          <Input placeholder="+234..." name="whatsapp" required />
        </Field>
        <Field label="Educational Level">
          <Select
            name="education"
            defaultValue="Undergraduate"
            required
            options={[
              { value: "SSCE / O'Level", label: "SSCE / O'Level" },
              { value: "Undergraduate", label: "Undergraduate" },
              { value: "Graduate", label: "Graduate" },
            ]}
          />
        </Field>
        <Field label="Laptop Access">
          <Select
            name="laptop"
            defaultValue="yes"
            required
            options={[
              { value: "yes", label: "Yes, I have my own laptop" },
              { value: "no", label: "No, I need support" },
            ]}
          />
        </Field>
        <Field label="Bootcamp Track">
          <Select
            name="track"
            defaultValue="uiux"
            required
            options={[
              { value: "uiux", label: "UI/UX Design" },
              { value: "web", label: "Web Development" },
              { value: "data", label: "Data Analytics" },
            ]}
          />
        </Field>
        {error ? (
          <p className="rounded-xl bg-orange-soft px-3 py-2 text-sm text-orange">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          className="w-full rounded-xl"
          size="lg"
          disabled={pending}
        >
          {pending ? "Sending..." : "Join Free Bootcamp"}
        </Button>
        <p className="text-center text-xs text-muted">
          By clicking, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <BootcampSuccessModal
        open={modalOpen}
        name={successName}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
