import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const countries = [
  {
    code: "MX",
    name: "México",
    flag: "🇲🇽",
    dialCode: "+52",
    placeholder: "55 1234 5678",
    format: (value: string) => {
      // Format: XX XXXX XXXX
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 6)
        return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 6)} ${numbers.slice(6, 10)}`;
    },
    validate: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers.length === 10;
    },
  },
  {
    code: "US",
    name: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    placeholder: "(555) 123-4567",
    format: (value: string) => {
      // Format: (XXX) XXX-XXXX
      const numbers = value.replace(/\D/g, "");
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6)
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;
    },
    validate: (value: string) => {
      const numbers = value.replace(/\D/g, "");
      return numbers.length === 10;
    },
  },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: string) => void;
  defaultCountry?: "MX" | "US";
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  defaultCountry = "MX",
  disabled = false,
  className,
  error,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);

  const country = countries.find((c) => c.code === selectedCountry)!;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = country.format(rawValue);
    onChange(formatted);
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode as "MX" | "US");
    onChange(""); // Clear phone number on country change
    onCountryChange?.(countryCode);
  };

  const isValid = value ? country.validate(value) : true;

  return (
    <div className="space-y-1">
      <div className={cn("flex gap-2", className)}>
        <Select
          value={selectedCountry}
          onValueChange={handleCountryChange}
          disabled={disabled}
        >
          <SelectTrigger className="w-[130px] h-12 bg-muted/50 border-muted">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm font-medium text-foreground">
                  {country.dialCode}
                </span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                <div className="flex items-center gap-3">
                  <span className="text-lg">{c.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.dialCode}
                    </span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 relative">
          <Input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder={country.placeholder}
            disabled={disabled}
            className={cn(
              "h-12 bg-muted/50 border-muted",
              !isValid &&
                value &&
                "border-destructive focus-visible:ring-destructive",
            )}
            maxLength={country.code === "US" ? 14 : 12}
          />
        </div>
      </div>
      {error && <p className="text-xs text-destructive mt-1.5 px-1">{error}</p>}
      {!isValid && value && !error && (
        <p className="text-xs text-muted-foreground mt-1.5 px-1">
          Ingresa un número válido de {country.name}
        </p>
      )}
    </div>
  );
}
