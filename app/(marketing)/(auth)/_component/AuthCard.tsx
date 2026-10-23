import type { ReactNode } from "react";
import Link from "next/link";

type AuthCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: { text: string; label: string; href: string };
};

const AuthCard = ({
  title,
  description,
  icon,
  children,
  footer,
}: AuthCardProps) => {
  return (
    <div className="w-full max-w-md rounded-2xl border bg-card p-6 md:p-8">
      <div className="text-center">
        {icon && (
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
            {icon}
          </span>
        )}
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>

      {children && <div className="mt-8">{children}</div>}

      {footer && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {footer.text}{" "}
          <Link
            href={footer.href}
            className="font-medium text-primary hover:underline"
          >
            {footer.label}
          </Link>
        </p>
      )}
    </div>
  );
};

export default AuthCard;
