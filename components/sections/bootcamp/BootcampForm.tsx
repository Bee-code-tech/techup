"use client";

import { useState } from "react";
import { BootcampSuccessModal } from "@/components/sections/bootcamp/BootcampSuccessModal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { bootcampTracks } from "@/lib/bootcamp";

const trackOptions = Object.entries(bootcampTracks).map(([value, label]) => ({
  value,
  label,
}));

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
        className="rounded-2xl border border-border bg-white p-5 shadow-card sm:rounded-3xl sm:p-8 md:p-10"
      >
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-navy sm:text-3xl">
              Reserve Your Spot
            </h2>
            <p className="mt-2 text-sm text-muted sm:text-base">
              Fill in your details to join the next free bootcamp cohort.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5">
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
            <Field label="Age">
              <Input
                type="number"
                placeholder="22"
                name="age"
                min={13}
                max={80}
                required
              />
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
                defaultValue="frontend"
                required
                options={trackOptions}
              />
            </Field>
          </div>

          {error ? (
            <p className="mt-5 rounded-xl bg-orange-soft px-3 py-2 text-sm text-orange">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted sm:max-w-sm">
              By clicking, you agree to our Terms of Service and Privacy Policy.
            </p>
            <Button
              type="submit"
              className="w-full rounded-xl sm:w-auto"
              size="lg"
              disabled={pending}
            >
              {pending ? "Sending..." : "Join Free Bootcamp"}
            </Button>
          </div>
      </form>

      <BootcampSuccessModal
        open={modalOpen}
        name={successName}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
