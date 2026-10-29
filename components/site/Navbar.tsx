import Link from "next/link";

import { AccountNavigation } from "./account-navigation";

import { ThemeToggle } from "./theme-toggle";
import { Logo } from "./Logo";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-wrap items-center justify-between gap-x-3 px-4 py-3 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:py-0">
        <Link
          href="/"
          aria-label="NaroBlog home"
          className="justify-self-start"
        >
          <Logo />
        </Link>

        <nav aria-label="Main" className="order-3 w-full sm:order-none sm:w-auto">
          <ul className="flex items-center justify-center gap-6 sm:gap-8 md:gap-12">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          <ThemeToggle />
          <AccountNavigation />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
