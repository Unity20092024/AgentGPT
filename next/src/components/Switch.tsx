import * as SwitchPrimitive from "@radix-ui/react-switch";
import { clsx } from "clsx";
import React, { useEffect, useState } from "react";

interface SwitchProps {
  value: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}

const Switch = ({ value, disabled = false, onChange }: SwitchProps) => {
  const [internalChecked, setInternalChecked] = useState(value);

  useEffect(() => {
    setInternalChecked(value);
  }, [value]);

  const handleChange = (checked: boolean) => {
    if (!disabled) {
      onChange(checked);
    }
  };

  return (
    <SwitchPrimitive.Root
      className={clsx(
        "group",
        "radix-state-checked:bg-sky-600 radix-state-unchecked:bg-zinc-50
