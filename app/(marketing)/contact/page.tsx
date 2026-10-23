import { Clock, Mail } from "lucide-react";

import ContactForm from "./_component/Contactform";

const ContactPage = () => {
  return (
    <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 pt-12 lg:grid-cols-2 lg:gap-16">
      <div>
        <p className="text-sm font-medium text-primary">Contact</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
          Get in touch
        </h1>
        <p className="mt-4 max-w-md font-serif text-lg text-muted-foreground">
          Have a question, a story idea, or feedback for us? Send a message and
          we will get back to you.
        </p>

        <ul className="mt-10 space-y-6">
          <li className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <Mail className="size-5" />
            </span>
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">hello@naroblog.com</p>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-secondary-foreground">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="font-medium">Response time</p>
              <p className="text-muted-foreground">
                We usually reply within two business days.
              </p>
            </div>
          </li>
        </ul>
      </div>

      <ContactForm />
    </section>
  );
};

export default ContactPage;
