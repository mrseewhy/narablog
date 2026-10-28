"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { contactSchema } from "@/lib/data/validation/contact.validate";
import { createContactAction } from "@/lib/data/actions/contact.actions";
import * as z from "zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const fieldClass =
  "w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

const ContactForm = () => {
  const [errors, setErrors] = React.useState<
    z.inferFlattenedErrors<typeof contactSchema>["fieldErrors"]
  >({});
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const successHeading = React.useRef<HTMLHeadingElement>(null);

  React.useEffect(() => {
    if (submitted) successHeading.current?.focus();
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const form = e.currentTarget;
    const data = new FormData(form);
    const formData = Object.fromEntries(data.entries());
    const result = contactSchema.safeParse(formData);
    setErrors({});
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const data = await createContactAction(result.data);
      if (!data.success) {
        toast.error(data.message);
        if (data.error) {
          setErrors(data.error);
        }
        return;
      }
      form.reset();
      setErrors({});
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };
  if (submitted) {
    return (
      <section
        aria-labelledby="contact-success-heading"
        className="flex min-h-128 flex-col items-center justify-center rounded-2xl border bg-card p-6 text-center md:p-8"
      >
        <span className="mb-6 grid size-16 place-items-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <p className="text-sm font-medium text-primary">Message received</p>
        <h2
          id="contact-success-heading"
          ref={successHeading}
          tabIndex={-1}
          className="mt-2 text-3xl font-bold tracking-tight outline-none md:text-4xl"
        >
          Thank you for reaching out!
        </h2>
        <p className="mt-4 max-w-sm font-serif text-lg text-muted-foreground">
          Your message has been saved. We’ll review it soon.
        </p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-busy={loading}
      className="space-y-5 rounded-2xl border bg-card p-6 md:p-8"
    >
      <fieldset disabled={loading} className="space-y-5">
        {/* Honeypot: hidden from people, bots tend to fill it in. Reject the submission on the server if it has a value. */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label htmlFor="contact_extra_reference">
            Leave this field empty
          </label>
          <input
            id="contact_extra_reference"
            name="contact_extra_reference"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your name"
              autoComplete="name"
              required
              maxLength={70}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name?.length)}
              aria-describedby={
                errors.name?.length ? "contact-name-error" : undefined
              }
              className={`${fieldClass} h-11`}
            />
            {errors.name && (
              <span id="contact-name-error" className="text-xs text-red-500">
                {errors.name[0]}
              </span>
            )}
          </div>
          <div className="">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              maxLength={254}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email?.length)}
              aria-describedby={
                errors.email?.length ? "contact-email-error" : undefined
              }
              className={`${fieldClass} h-11`}
            />
            {errors.email && (
              <span id="contact-email-error" className="text-xs text-red-500">
                {errors.email[0]}
              </span>
            )}
          </div>
        </div>

        <div className="">
          <label htmlFor="subject" className="text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            placeholder="What is this about?"
            required
            maxLength={70}
            onChange={handleChange}
            aria-invalid={Boolean(errors.subject?.length)}
            aria-describedby={
              errors.subject?.length ? "contact-subject-error" : undefined
            }
            className={`${fieldClass} h-11`}
          />
          {errors.subject && (
            <span id="contact-subject-error" className="text-xs text-red-500">
              {errors.subject[0]}
            </span>
          )}
        </div>

        <div className="">
          <label htmlFor="message" className="text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="Write your message here"
            required
            maxLength={5000}
            onChange={handleChange}
            aria-invalid={Boolean(errors.message?.length)}
            aria-describedby={
              errors.message?.length ? "contact-message-error" : undefined
            }
            className={`${fieldClass} min-h-40 resize-none py-3`}
          />
          {errors.message && (
            <span id="contact-message-error" className="text-xs text-red-500">
              {errors.message[0]}
            </span>
          )}
        </div>

        <Button disabled={loading} type="submit" size="lg" className="w-full">
          {loading ? "Sending..." : "Send message"}
        </Button>
      </fieldset>
    </form>
  );
};

export default ContactForm;
