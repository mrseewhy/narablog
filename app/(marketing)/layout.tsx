import Footer from "@/components/site/Footer";
import Navbar from "@/components/site/Navbar";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="w-full max-w-7xl mx-auto px-4">{children}</main>
      <Footer />
    </div>
  );
}
