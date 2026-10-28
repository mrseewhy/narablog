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
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Link
          href="/"
          aria-label="NaroBlog home"
          className="justify-self-start"
        >
          <Logo />
        </Link>

        <nav aria-label="Main">
          <ul className="flex items-center gap-8 md:gap-12">
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

        <div className="flex items-center gap-3 justify-self-end">
          <ThemeToggle />
          <AccountNavigation />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
