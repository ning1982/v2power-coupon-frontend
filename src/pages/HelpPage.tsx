import { Link } from "react-router-dom";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447000000000";
const PRIVACY = "https://www.v2power.io/v2power/privacy/";

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 bg-surface-lowest/80 backdrop-blur border-b border-outline-variant">
        <div className="max-w-[420px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[8px] bg-primary text-on-primary grid place-items-center text-xs font-bold">V2</div>
            <span className="font-semibold text-on-surface">V2Power</span>
          </Link>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" referrerPolicy="strict-origin-when-cross-origin" className="text-sm text-primary font-medium">WhatsApp</a>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-[420px] mx-auto">
          <h1 className="text-2xl font-semibold text-on-surface">Help</h1>
          <p className="text-sm text-on-surface-variant mt-1">Your voucher code is sent by email after you redeem it.</p>

          <div className="mt-4 bg-surface-lowest rounded-[16px] shadow-m3-1 p-4 space-y-5">
            <section>
              <h2 className="font-medium text-sm text-on-surface">Haven&rsquo;t received the email?</h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Check your spam or junk folder and search for &ldquo;V2Power&rdquo;. Add us to your safe senders list. It can take up to 2 minutes to arrive.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-sm text-on-surface">Code not working?</h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Check for typos and capital letters. If it says the code has already been used, check your inbox &mdash; it may already be there.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-sm text-on-surface">Entered the wrong email?</h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                The voucher is only sent to the email you entered. Message us on WhatsApp and we&rsquo;ll help you fix it.
              </p>
            </section>

            <section>
              <h2 className="font-medium text-sm text-on-surface">Can I use the same card twice?</h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                No &mdash; each voucher code can only be used once, on the first email that claims it.
              </p>
            </section>

            <section className="bg-primary rounded-[12px] text-on-primary p-4">
              <h2 className="font-medium">Privacy</h2>
              <p className="text-sm text-on-primary/80 mt-1 leading-relaxed">
                We only use your email to send the voucher. Data is kept for 2 years as required by UK GDPR.{" "}
                <a href={PRIVACY} target="_blank" rel="noopener noreferrer" referrerPolicy="strict-origin-when-cross-origin" className="underline underline-offset-2 text-on-primary">Read the full policy</a>
              </p>
            </section>
          </div>

          <div className="mt-4 space-y-2">
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" referrerPolicy="strict-origin-when-cross-origin" className="block w-full h-12 rounded-full bg-primary text-on-primary font-medium text-sm leading-[48px] text-center">Chat on WhatsApp</a>
            <Link to="/" className="block w-full h-12 rounded-full border border-outline text-primary font-medium text-sm leading-[48px] text-center">Back to Redeem</Link>
          </div>

          <p className="text-xs text-on-surface-variant text-center mt-4">support@v2power.com</p>
        </div>
      </main>
    </div>
  );
}
