"use client";

import { useEffect, useState } from "react";
import { Input } from "./input";

interface MoneyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

const UNITS = [
  { label: "K", value: 1000 },
  { label: "L", value: 100000 },
  { label: "Cr", value: 10000000 },
];

export function MoneyInput({ id, value, onChange, placeholder, required }: MoneyInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [unitValue, setUnitValue] = useState(100000); // Default to Lakhs

  // Synchronize internal state from raw parent value
  useEffect(() => {
    if (!value || isNaN(Number(value)) || Number(value) === 0) {
      setInputValue("");
      return;
    }

    const num = Number(value);

    // Pick best unit: Crore if >= 10M, else Lakh if >= 100k, else K
    let selectedUnit = UNITS[1]; // default to Lakhs
    if (num >= 10000000) {
      selectedUnit = UNITS[2]; // Crores
    } else if (num >= 100000) {
      selectedUnit = UNITS[1]; // Lakhs
    } else {
      selectedUnit = UNITS[0]; // K
    }

    setUnitValue(selectedUnit.value);
    const converted = num / selectedUnit.value;
    // Format to 2 decimal places max, avoiding trailing zeros
    setInputValue(String(Math.round(converted * 100) / 100));
  }, [value]);

  const handleNumberChange = (newVal: string) => {
    setInputValue(newVal);
    if (!newVal || isNaN(Number(newVal))) {
      onChange("");
      return;
    }
    const rawValue = String(Number(newVal) * unitValue);
    onChange(rawValue);
  };

  const handleUnitChange = (newUnit: number) => {
    setUnitValue(newUnit);
    if (!inputValue || isNaN(Number(inputValue))) {
      return;
    }
    const rawValue = String(Number(inputValue) * newUnit);
    onChange(rawValue);
  };

  return (
    <div className="flex w-full items-stretch rounded-lg shadow-sm">
      <Input
        className="rounded-r-none border-r-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        id={id}
        onChange={(e) => handleNumberChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type="number"
        step="any"
        value={inputValue}
      />
      <select
        className="flex h-11 w-[90px] rounded-r-lg border border-input border-l-0 bg-white/[0.03] px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50"
        onChange={(e) => handleUnitChange(Number(e.target.value))}
        value={unitValue}
      >
        {UNITS.map((u) => (
          <option className="bg-background text-foreground" key={u.value} value={u.value}>
            {u.label}
          </option>
        ))}
      </select>
    </div>
  );
}
