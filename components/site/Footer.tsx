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
        <div className="mx-auto w-full max-w-7xl px-4 py-6 flex justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {renderYear} NaroBlog. All rights reserved.
          </p>
          <nav aria-label="Footer">
            <ul className="flex items-center gap-8">
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
