import ContactForm from "./_component/Contactform";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Send a question, story idea, or feedback to NaroBlog.",
  alternates: { canonical: "/contact" },
};

const ContactPage = () => {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="text-sm font-medium text-primary">Contact</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-muted-foreground">
          Have a question, a story idea, or feedback for us? Send a message to
          the NaroBlog team.
        </p>
      </div>

      <ContactForm />
    </section>
  );
};

export default ContactPage;
