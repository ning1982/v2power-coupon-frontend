import { Link } from "react-router-dom";
const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447000000000";
export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] grid-pattern">
      <header className="bg-white/70 backdrop-blur border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-[var(--v2-navy)] grid place-items-center text-white text-xs font-bold">V2P</div><span className="display font-bold text-[var(--v2-navy)]">V2Power</span></Link>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-sm bg-[#25D366] text-white px-4 py-1.5 rounded-full font-medium">WhatsApp</a>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="display text-2xl font-bold">Help & FAQ</h1>
        <p className="text-sm text-slate-500 mt-1">Voucher redemption - One Token once - GDPR 2-year retention</p>
        <div className="mt-6 bg-white rounded-[24px] shadow border p-6 space-y-6">
          <section className="rounded-2xl bg-slate-50 border p-4"><h2 className="font-semibold text-sm">1. Not receiving the email?</h2><p className="text-sm text-slate-600 mt-1 leading-relaxed">Check spam/junk and search for V2Power. Add noreply to allowlist. Wait 2 minutes. If still not received, contact WhatsApp with last 4 chars of Token and submission time.</p></section>
          <section><h2 className="font-semibold text-sm">2. Invalid / already redeemed Token?</h2><p className="text-sm text-slate-600 mt-1">Check case and separators. If already redeemed you will see E102 - check inbox instead of resubmitting.</p></section>
          <section><h2 className="font-semibold text-sm">3. Entered the wrong email?</h2><p className="text-sm text-slate-600 mt-1">Voucher is only sent to the email you submitted. Contact support to resend or void and reissue.</p></section><section><h2 className="font-semibold text-sm">4. Multiple devices?</h2><p className="text-sm text-slate-600 mt-1">Each Token can be redeemed only once (idempotent). Concurrent requests: only first succeeds.</p></section>
          <section id="privacy" className="rounded-2xl bg-[var(--v2-navy)] text-white p-4"><h2 className="font-semibold">Privacy Policy</h2><p className="text-sm text-white/70 mt-1 leading-relaxed">We only use your email to send the voucher and store hashed email/IP for audit. Data retained 2 years per GDPR. <a href="https://www.v2power.io/v2power/privacy/" target="_blank" rel="noreferrer" className="underline decoration-white/30 underline-offset-2 text-white">Read full policy - </a></p></section>
          <div className="flex gap-3 pt-2">
            <Link to="/" className="flex-1 text-center border rounded-xl py-3 font-medium hover:bg-slate-50">Back to Redeem</Link>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex-1 text-center bg-[#25D366] text-white rounded-xl py-3 font-semibold">Chat on WhatsApp</a>
          </div>
        </div>
        <p className="text-xs text-slate-400 text-center mt-6">Contact: support@v2power.com · WhatsApp wa.me/</p>
      </div>
    </div>
  );
}



