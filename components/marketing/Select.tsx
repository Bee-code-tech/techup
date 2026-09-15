"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { SolarIcon } from "@/components/icons/solar-icon";
import { cn } from "@/lib/cn";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  contentClassName?: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
};

export function Select({
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select an option",
  className,
  contentClassName,
  required,
  id,
  disabled,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      name={name}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      required={required}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-md border border-border bg-white px-3 text-left text-sm text-foreground shadow-xs outline-none transition",
          "hover:bg-surface-blue/40",
          "focus-visible:border-navy/40 focus-visible:ring-2 focus-visible:ring-navy/15",
          "data-placeholder:text-muted-foreground/70",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <SolarIcon
            name="alt-arrow-down"
            className="size-4 shrink-0 text-muted-foreground"
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-[300] origin-top overflow-hidden rounded-md border border-border bg-white text-foreground shadow-[0_8px_30px_rgba(0,32,111,0.12)] data-[state=open]:animate-[select-in_140ms_ease-out]",
            contentClassName,
          )}
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-sm py-2 pr-8 pl-3 text-sm outline-none select-none",
                  "data-[highlighted]:bg-surface-blue/60 data-[highlighted]:text-navy",
                  "data-[state=checked]:font-medium data-[state=checked]:text-navy",
                )}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
                  <SolarIcon name="check-read" className="size-4 text-navy" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
