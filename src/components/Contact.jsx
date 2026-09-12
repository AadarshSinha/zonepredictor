import { Section, SectionHeading } from "./Section";

const FIELD =
  "w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-600 focus:border-green-400 focus:outline-none";

export function Contact() {
  return (
    <Section id="contact">
      <SectionHeading eyebrow="Contact" title="Get in touch">
        Running a team, building something adjacent, or spotted a prediction that
        was badly wrong? All three are worth an email.
      </SectionHeading>

      <form
        name="contact"
        method="POST"
        data-netlify="true"
        action="/thank-you.html"
        className="mx-auto mt-12 max-w-xl space-y-5"
      >
        <input type="hidden" name="form-name" value="contact" />

        <div>
          <label htmlFor="contact-name" className="sr-only">
            Your name
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            placeholder="Your name"
            required
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="sr-only">
            Your email
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            placeholder="Your email"
            required
            className={FIELD}
          />
        </div>

        <div>
          <label htmlFor="contact-message" className="sr-only">
            Your message
          </label>
          <textarea
            id="contact-message"
            name="message"
            placeholder="What is on your mind?"
            rows="4"
            required
            className={FIELD}
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 px-6 py-3.5 font-semibold text-black shadow-[0_0_20px_rgba(34,197,94,0.3)] transition hover:bg-green-400"
        >
          Send message
        </button>
      </form>
    </Section>
  );
}
