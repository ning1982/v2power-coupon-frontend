import { Link, useLocation, useNavigate } from "react-router-dom";
import { maskEmail } from "../lib/errorMap";
const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447000000000";
export default function SuccessPage() {
  const nav = useNavigate();
  const loc = useLocation() as { state?: { email?: string; masked?: string } };
  const email = loc.state?.email;
  const masked = loc.state?.masked || (email ? maskEmail(email) : "your inbox");
  if (!email) {
    return (
      <div className="min-h-screen grid place-items-center p-6 grid-pattern">
        <div className="bg-white rounded-[24px] shadow-xl border p-8 max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-700 grid place-items-center mx-auto">!</div>
          <h2 className="display font-bold text-lg mt-3">No email in session</h2>
          <p className="text-sm text-slate-600 mt-2">Please redeem from home to avoid URL privacy leak. We use <code className="mono bg-slate-100 px-1 rounded">history.state</code>, not URL query.</p>
          <Link to="/" className="inline-block mt-5 bg-[#071E33] text-white px-6 py-2.5 rounded-xl font-medium">Go to Redeem</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col grid-pattern">
      <header className="bg-white/70 backdrop-blur border-b"><div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2"><div className="h-7 w-7 rounded-lg bg-[#071E33] grid place-items-center text-white text-xs font-bold">V2P</div><span className="display font-bold text-[#071E33]">V2Power</span></div></header>
      <div className="flex-1 max-w-xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(7,30,51,0.12)] border p-8 text-center overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00E5CC] to-[#FFD23F]"/>
          <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
          <h1 className="display text-2xl font-bold mt-4">Voucher Sent!</h1>
          <p className="text-sm text-slate-600 mt-2">We have sent your voucher code to <b className="text-[#071E33]">{masked}</b></p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left text-sm mt-6">
            <div className="font-semibold">Not received?</div>
            <ul className="list-disc ml-5 mt-2 text-slate-700 space-y-1 text-xs leading-relaxed">
              <li>Check your spam/junk folder and add noreply@… to your allowlist.</li>
              <li>Email may be delayed 1–2 minutes. Please do not resubmit.</li>
              <li>Still not received? Contact WhatsApp with last 4 chars of Token + submission time.</li>
            </ul>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => nav("/", { replace: true })} className="flex-1 bg-white border rounded-xl py-3 font-medium hover:bg-slate-50">Back to Home</button>
            <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex-1 bg-[#25D366] text-white rounded-xl py-3 text-center font-semibold">WhatsApp Support</a>
          </div>
          <p className="text-xs text-slate-400 mt-4">Tip: Voucher code is not shown here for security, only by email.</p>
        </div>
      </div>
    </div>
  );
}
