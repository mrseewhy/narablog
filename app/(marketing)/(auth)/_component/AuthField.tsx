"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type AuthFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
  passwordToggle?: boolean;
};

const AuthField = ({ id, label, passwordToggle = false, type, className = "", ...props }: AuthFieldProps) => {
  const [visible, setVisible] = useState(false);
  const canToggle = passwordToggle && type === "password";
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={canToggle && visible ? "text" : type}
          className={`h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring ${canToggle ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {canToggle && (
          <button
            type="button"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-controls={id}
            disabled={props.disabled}
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            {visible ? <EyeOff className="size-5" aria-hidden="true" /> : <Eye className="size-5" aria-hidden="true" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthField;
