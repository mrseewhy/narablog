import type { ComponentProps } from "react";

type AuthFieldProps = ComponentProps<"input"> & {
  id: string;
  label: string;
};

const AuthField = ({ id, label, ...props }: AuthFieldProps) => {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        {...props}
      />
    </div>
  );
};

export default AuthField;
