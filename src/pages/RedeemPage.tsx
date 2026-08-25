import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { redeemSchema, type RedeemForm } from "../lib/validation";
import { redeem } from "../api/coupon";
import { mapApiError, maskEmail } from "../lib/errorMap";
import { saveDraft, loadDraft, clearDraft } from "../lib/storage";
import Turnstile from "../components/Turnstile";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447000000000";

export default function RedeemPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [globalError, setGlobalError] = useState<{ code: string; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const captchaRef = useRef<string>("");

  const form = useForm<RedeemForm>({
    resolver: zodResolver(redeemSchema),
    defaultValues: { email: "", token: params.get("t") || params.get("token") || "", captcha_token: "", consent: false },
    mode: "onBlur",
  });

  useEffect(() => {
    const draft = loadDraft<RedeemForm>();
    if (draft) {
      if (!params.get("t") && !params.get("token")) form.reset(draft);
      else form.reset({ ...draft, token: params.get("t") || params.get("token") || draft.token });
    }
  }, []);

  const values = form.watch();
  useEffect(() => {
    const id = setTimeout(() => saveDraft(values as unknown as Record<string, unknown>), 500);
    return () => clearTimeout(id);
  }, [values]);

  const onSubmit = async (data: RedeemForm) => {
    setGlobalError(null);
    setSubmitting(true);
    const payload = {
      email: data.email.trim().toLowerCase(),
      confirmed_email: data.email.trim().toLowerCase(),
      token: data.token,
      captcha_token: captchaRef.current || "",
    };
    try {
      const res = await redeem(payload);
      if (res.code === 0) {
        clearDraft();
        navigate("/success", { replace: true, state: { email: data.email, masked: res.data?.email || maskEmail(data.email) } });
      } else {
        const mapped = mapApiError(res.msg || "");
        setGlobalError({ code: mapped.code, text: mapped.text });
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setGlobalError({ code: "E504", text: "Request timed out, but redemption may have succeeded -please check your inbox (including spam) first. If not received within 10 minutes, try again." });
      } else {
        const msg = e instanceof Error ? e.message : "Network error";
        setGlobalError({ code: "E500", text: msg });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const tokenError = form.formState.errors.token?.message;
  const emailError = form.formState.errors.email?.message as string | undefined;
  const consentError = form.formState.errors.consent?.message;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-[640px] mx-auto px-4 h-[52px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#071E33] flex items-center justify-center text-white font-bold text-[12px] tracking-widest">V2P</div>
            <span className="display font-bold text-[15px] text-[#071E33]">V2Power</span>
            <span className="hidden sm:inline text-xs text-slate-400 border-l pl-2.5 ml-1">Voucher Redemption</span>
          </div>
          <Link to="/help" className="text-sm font-medium text-slate-600 hover:text-[#071E33]">Help</Link>
        </div>
      </header>

      <div className="flex-1 py-8 md:py-10 px-4">
        <div className="max-w-[520px] mx-auto">
          <div className="rounded-[20px] bg-[#071E33] text-white p-5 md:p-6 flex gap-4 items-center overflow-hidden relative">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#00E5CC] blur-[50px] opacity-15"/>
            <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/15 grid place-items-center flex-shrink-0">
              <span className="text-lg">#</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] tracking-[0.16em] text-[#00E5CC] font-semibold">V2POWER - CHARGING VOUCHER</div>
              <h1 className="display text-[20px] font-bold leading-none mt-1">Redeem Your Voucher</h1>
              <p className="text-xs text-white/65 mt-1.5 leading-relaxed">Scan the QR on your card or enter the code below. One Token, one redemption -code sent by email.</p>
            </div>
          </div>

          <div className="mt-4 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(7,30,51,0.08)] border border-slate-200/70 p-5 md:p-6">
            <div className="flex items-center justify-between">
              <h2 className="display font-bold text-[15px]">Enter your details</h2>
              <span className="text-[11px] font-semibold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1 flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>SECURE</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Tip: Paste your code or scan the QR -it fills automatically</p>

            {globalError && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm flex gap-2">
                <span className="h-5 w-5 rounded-full bg-red-600 text-white grid place-items-center text-xs flex-shrink-0 mt-0.5">!</span>
                <div><div className="font-medium text-xs leading-none">{globalError.text}</div><div className="text-[11px] opacity-60 mt-1">Code: {globalError.code}</div></div>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
              <div>
                <label className="text-xs font-semibold tracking-widest text-slate-600">EMAIL *</label>
                <input className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00E5CC]/30 focus:border-[#00E5CC] bg-[#F8FAFC]" placeholder="you@example.com" {...form.register("email")} />
                {emailError && <p className="text-xs text-red-600 mt-1.5">{emailError}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between"><label className="text-xs font-semibold tracking-widest text-slate-600">TOKEN *</label><span className="text-[11px] mono text-slate-400">{(form.watch("token")||"").replace(/[^A-Z0-9]/gi,"").length}/64</span></div>
                <input className="mt-1.5 w-full border border-slate-200 rounded-xl px-3 py-3 mono text-sm tracking-[0.14em] focus:outline-none focus:ring-2 focus:ring-[#00E5CC]/30 focus:border-[#00E5CC] bg-[#F8FAFC]" placeholder="e.g. V2P-KHWMYLOQ" {...form.register("token")} />
                {tokenError ? <p className="text-xs text-red-600 mt-1.5">{tokenError}</p> : <p className="text-xs text-slate-500 mt-1.5">Tip: Paste your code or scan the QR -it fills automatically</p>}
              </div>

              <Turnstile onVerify={(t) => { captchaRef.current = t; form.setValue("captcha_token", t); }} onExpire={() => { captchaRef.current = ""; form.setValue("captcha_token", ""); }} />

              <label className="flex items-start gap-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#071E33]" {...form.register("consent")} />
                <span className="text-slate-700">I agree to the <a href="https://www.v2power.io/v2power/privacy/" target="_blank" rel="noreferrer" className="underline decoration-[#00E5CC] underline-offset-2">Privacy Policy</a> * <span className="text-slate-500 text-xs">-hashed email/IP retained 2 years per GDPR.</span></span>
              </label>
              {consentError && <p className="text-xs text-red-600 -mt-2">{consentError}</p>}

              <button type="submit" disabled={submitting} className="w-full rounded-xl py-3.5 font-semibold text-white bg-[#071E33] hover:bg-[#0c2540] disabled:opacity-50 transition flex items-center justify-center gap-2">
                {submitting ? (<><span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Submitting...</>) : (<>Send My Voucher <span className="h-6 w-6 rounded-full bg-white/15 grid place-items-center text-sm">-</span></>)}
              </button>
              <p className="text-[11px] text-center text-slate-400">Voucher code will be sent by email only, not shown on site.</p>
            </form>
          </div>

          <p className="text-xs text-center text-slate-400 mt-4">Need help? <Link to="/help" className="underline decoration-dotted hover:text-slate-600">Visit Help</Link> · <a href={WHATSAPP} target="_blank" rel="noreferrer" className="underline decoration-dotted hover:text-slate-600">Chat on WhatsApp</a> · <a href="mailto:support@v2power.com" className="underline decoration-dotted">support@v2power.com</a></p>
        </div>
      </div>
    </div>
  );
}

