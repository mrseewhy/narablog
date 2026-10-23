import { Button } from "@/components/ui/button";

const fieldClass =
  "w-full rounded-lg border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

const ContactForm = () => {
  return (
    <form
      method="post"
      className="space-y-5 rounded-2xl border bg-card p-6 md:p-8"
    >
      {/* Honeypot: hidden from people, bots tend to fill it in. Reject the submission on the server if it has a value. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
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
            className={`${fieldClass} h-11`}
          />
        </div>
        <div className="space-y-2">
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
            className={`${fieldClass} h-11`}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="What is this about?"
          className={`${fieldClass} h-11`}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Write your message here"
          required
          className={`${fieldClass} min-h-40 resize-y py-3`}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        Send message
      </Button>
    </form>
  );
};

export default ContactForm;
