import Link from "next/link";

import { cacheLife } from "next/cache";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Categories", href: "/categories" },
  { label: "Contact", href: "/contact" },
];

const getFullYear = async () => {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
};

const Footer = async () => {
  const renderYear = await getFullYear();
  return (
    <footer className="mt-20 w-full border-t">
      <div className="border-t">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6">
          <p className="text-sm text-muted-foreground">
            &copy; {renderYear} NaroBlog. All rights reserved.
          </p>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {footerLinks.map((link) => (
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
        </div>
      </div>
    </footer>
  );
};

export default Footer;
