"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/cn";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="size-4 shrink-0 text-muted"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="size-4 text-navy"
    >
      <path
        d="M5 12L10 17L19 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Select({
  name,
  options,
  defaultValue,
  placeholder = "Select an option",
  className,
  required,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      name={name}
      defaultValue={defaultValue}
      required={required}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-white px-3 text-left text-sm text-foreground shadow-xs outline-none transition",
          "hover:bg-surface-blue/40",
          "focus-visible:border-navy/40 focus-visible:ring-2 focus-visible:ring-navy/15",
          "data-placeholder:text-muted/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDownIcon />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className="z-50 origin-top overflow-hidden rounded-md border border-border bg-white text-foreground shadow-[0_8px_30px_rgba(0,32,111,0.12)] data-[state=open]:animate-[select-in_140ms_ease-out]"
        >
          <SelectPrimitive.Viewport
            className="min-w-[var(--radix-select-trigger-width)] p-1"
          >
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex w-full cursor-pointer items-center rounded-sm py-2 pr-3 pl-8 text-sm outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-surface-blue data-highlighted:text-navy"
              >
                <span className="absolute left-2 flex size-4 items-center justify-center">
                  <SelectPrimitive.ItemIndicator>
                    <CheckIcon />
                  </SelectPrimitive.ItemIndicator>
                </span>
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
