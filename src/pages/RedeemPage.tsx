import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { redeemSchema, type RedeemForm } from "../lib/validation";
import { redeem, normalizeToken } from "../api/coupon";
import { mapApiError, maskEmail } from "../lib/errorMap";
import { parseAmount, formatAmount } from "../lib/amount";
import Turnstile from "../components/Turnstile";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447868288666";

export default function RedeemPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const voucherToken = normalizeToken(params.get("t") || params.get("token") || "");
  const amount = parseAmount(params.get("amt") || params.get("amount"));
  const hasToken = voucherToken.length > 0;

  const [submitting, setSubmitting] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [globalError, setGlobalError] = useState<{ code: string; text: string } | null>(null);
  const captchaRef = useRef<string>("");

  const form = useForm<RedeemForm>({
    resolver: zodResolver(redeemSchema),
    defaultValues: { email: "", confirmedEmail: "", token: voucherToken, captcha_token: "", consent: false },
    mode: "onBlur",
  });

  // Re-validate confirm field when email changes (mismatch must update live)
  const emailValue = form.watch("email");
  useEffect(() => {
    if (form.formState.touchedFields.confirmedEmail) {
      form.trigger("confirmedEmail");
    }
  }, [emailValue, form]);

  // Consent validation failed -> trigger shake (resets onAnimationEnd, no setTimeout)
  const consentError = !!form.formState.errors.consent;
  useEffect(() => {
    if (consentError) setShaking(true);
  }, [consentError]);

  const onSubmit = async (data: RedeemForm) => {
    if (submitting) return;
    setGlobalError(null);
    setSubmitting(true);
    const payload = {
      email: data.email.trim().toLowerCase(),
      confirmed_email: data.confirmedEmail.trim().toLowerCase(),
      token: data.token,
      captcha_token: captchaRef.current || "",
    };
    try {
      const res = await redeem(payload);
      if (res.code === 0) {
        navigate("/success", {
          replace: true,
          state: { email: data.email, masked: maskEmail(res.data?.email ?? data.email) },
        });
      } else {
        const m = mapApiError(res.msg || "");
        setGlobalError({ code: m.code, text: m.text });
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setGlobalError({ code: "E504", text: "Request timed out, but redemption may have succeeded — please check your inbox (including spam) first. If not received within 10 minutes, try again." });
      } else {
        setGlobalError({ code: "E500", text: e instanceof Error ? e.message : "Network error. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const emailError = form.formState.errors.email?.message as string | undefined;
  const confirmedEmailError = form.formState.errors.confirmedEmail?.message as string | undefined;
  const tokenError = form.formState.errors.token?.message as string | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 bg-surface-lowest/80 backdrop-blur border-b border-outline-variant">
        <div className="max-w-[420px] mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-[8px] bg-primary text-on-primary grid place-items-center text-xs font-bold">V2</div>
            <span className="font-semibold text-on-surface">V2Power</span>
          </div>
          <Link to="/help" className="text-sm font-medium text-primary">Help</Link>
        </div>
      </header>

      <main className="flex-1 px-4 pb-6">
        <div className="max-w-[420px] mx-auto pt-2">
          <h1 className="text-[1.5rem] leading-8 text-on-surface">
            Claim your{" "}
            <span className="text-primary font-semibold">
              {amount !== null ? `${formatAmount(amount)} charging` : "exclusive charging"}
            </span>{" "}
            credit
          </h1>
          <p className="text-sm text-on-surface-variant mt-1 text-pretty">
            Enter your email to receive the discount code printed on your card.
          </p>

          <div className="mt-3 bg-surface-lowest rounded-[16px] shadow-m3-1 p-4">
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
              {hasToken ? (
                <span className="inline-flex items-center gap-2 h-10 px-3 rounded-[8px] bg-surface-high text-xs text-on-surface-variant">
                  <span className="text-primary text-[13px]" aria-hidden>&#10003;</span>
                  <span>Voucher</span>
                  <span className="font-mono font-medium text-on-surface">{voucherToken}</span>
                </span>
              ) : (
                <div>
                  <label htmlFor="token" className="text-xs font-medium text-on-surface-variant">Voucher code</label>
                  <input
                    id="token"
                    className="mt-1 w-full h-12 px-3 rounded-[8px] border border-outline bg-transparent text-sm outline-none focus:border-primary focus:border-2"
                    placeholder="e.g. V2P-KHWMYLOQ"
                    aria-invalid={!!tokenError}
                    {...form.register("token")}
                  />
                  {tokenError && <p className="text-xs text-error mt-1">{tokenError}</p>}
                </div>
              )}

              <div className="mt-4">
                <label htmlFor="email" className="text-xs font-medium text-on-surface-variant">Email address *</label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`mt-1 w-full h-14 px-4 rounded-[4px] border bg-transparent text-base outline-none ${emailError ? "border-error border-2" : "border-outline focus:border-primary focus:border-2"}`}
                  placeholder="you@example.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-err" : "email-help"}
                  {...form.register("email")}
                />
                <p id={emailError ? "email-err" : "email-help"} className={`text-xs mt-1 ${emailError ? "text-error" : "text-on-surface-variant"}`}>
                  {emailError || "Double-check it — the code goes here."}
                </p>
              </div>

              <div className="mt-3">
                <label htmlFor="confirmedEmail" className="text-xs font-medium text-on-surface-variant">Confirm email address *</label>
                <input
                  id="confirmedEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className={`mt-1 w-full h-14 px-4 rounded-[4px] border bg-transparent text-base outline-none ${confirmedEmailError ? "border-error border-2" : "border-outline focus:border-primary focus:border-2"}`}
                  placeholder="Re-enter your email"
                  aria-invalid={!!confirmedEmailError}
                  aria-describedby={confirmedEmailError ? "confirm-err" : "confirm-help"}
                  {...form.register("confirmedEmail")}
                />
                <p id={confirmedEmailError ? "confirm-err" : "confirm-help"} className={`text-xs mt-1 ${confirmedEmailError ? "text-error" : "text-on-surface-variant"}`}>
                  {confirmedEmailError || "Must match the email above."}
                </p>
              </div>

              <div
                className={`flex gap-3 mt-4 items-start rounded-[8px] p-2 -mx-2 transition-colors ${shaking ? "animate-shake" : ""} ${consentError ? "bg-error/10" : ""}`}
                onAnimationEnd={() => setShaking(false)}
              >
                <input
                  id="consent"
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 accent-primary"
                  aria-invalid={!!consentError}
                  {...form.register("consent")}
                />
                <label htmlFor="consent" className="text-sm text-on-surface text-pretty cursor-pointer">
                  I agree to the{" "}
                  <Link to="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>. We only use your email to send this voucher and stop the same card being claimed twice.
                </label>
              </div>
              {consentError && <p className="text-xs text-error -mt-1 ml-2">Please tick the box so we can send your voucher code.</p>}

              <Turnstile
                onVerify={(t) => { captchaRef.current = t; form.setValue("captcha_token", t); }}
                onExpire={() => { captchaRef.current = ""; form.setValue("captcha_token", ""); }}
              />

              <button
                type="submit"
                disabled={submitting}
                aria-busy={submitting}
                className="w-full h-14 mt-4 rounded-full bg-primary text-on-primary font-medium text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><span className="h-4 w-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Sending&#8230;</>
                ) : (
                  <>Send my voucher <span aria-hidden>&rarr;</span></>
                )}
              </button>
            </form>

            <p className="text-xs text-center text-on-surface-variant mt-2">&#128274; Instant code delivery &middot; No marketing spam</p>
            <p className="text-[11px] text-center text-on-surface-variant mt-1">Sent by email only &mdash; never shown on this page.</p>

            {globalError && (
              <div role="alert" className="mt-3 bg-error-container text-on-error-container rounded-[8px] p-3 text-sm">
                <div className="font-medium">{globalError.text}</div>
                <div className="text-xs opacity-70 mt-1">Code: {globalError.code}</div>
              </div>
            )}
          </div>

          <p className="text-sm text-center text-on-surface-variant mt-4">
            Need help?{" "}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" referrerPolicy="strict-origin-when-cross-origin" className="text-primary underline underline-offset-2">Chat on WhatsApp</a>
          </p>
        </div>
      </main>
    </div>
  );
}
