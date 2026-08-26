import { Link, useLocation } from "react-router-dom";
import { maskEmail } from "../lib/errorMap";

const WHATSAPP = import.meta.env.VITE_WHATSAPP || "https://wa.me/447868288666";

export default function SuccessPage() {
  const loc = useLocation() as { state?: { email?: string; masked?: string } };
  const email = loc.state?.email;
  // 防御性掩码：无论传入什么（后端脱敏值 / 完整邮箱 / 空），都再掩一次
  const masked = maskEmail(loc.state?.masked ?? email ?? "");

  if (!email) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="bg-surface-lowest rounded-[16px] shadow-m3-1 border border-outline-variant p-8 max-w-md w-full text-center">
          <div className="h-12 w-12 rounded-full bg-error-container text-on-error-container grid place-items-center mx-auto">!</div>
          <h1 className="text-lg font-semibold mt-3">Voucher session expired</h1>
          <p className="text-sm text-on-surface-variant mt-2">For your privacy, your email is never stored in the page link. Please scan your card again to redeem.</p>
          <Link to="/" className="inline-block mt-5 bg-primary text-on-primary px-6 py-2.5 rounded-full font-medium">Back to Redeem</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 bg-surface-lowest/80 backdrop-blur border-b border-outline-variant">
        <div className="max-w-[420px] mx-auto px-4 h-14 flex items-center gap-2">
          <div className="h-8 w-8 rounded-[8px] bg-primary text-on-primary grid place-items-center text-xs font-bold">V2</div>
          <span className="font-semibold text-on-surface">V2Power</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-[420px] mx-auto">
          <div className="bg-surface-lowest rounded-[16px] shadow-m3-1 p-6 text-center">
            <div className="h-16 w-16 rounded-full bg-primary-container text-on-primary-container grid place-items-center mx-auto text-2xl" aria-hidden>&#10003;</div>
            <h1 className="text-2xl font-semibold mt-4">Voucher sent</h1>
            <p className="text-sm text-on-surface-variant mt-2">
              We sent your code to <b className="text-on-surface">{masked}</b>
            </p>

            {/* 等待焦虑闭环：明确 ~30s 预期 */}
            <p className="text-sm text-on-surface mt-4 font-medium">Arrives in ~30 seconds.</p>

            <div className="bg-surface-container rounded-[12px] p-4 text-left text-sm text-on-surface-variant mt-3">
              <p className="font-medium text-on-surface">While you wait:</p>
              <ul className="list-disc ml-5 mt-2 space-y-1 text-xs leading-relaxed">
                <li>Check your spam folder if it&rsquo;s not in your inbox.</li>
                <li>Then enter the code on the charger screen to start charging.</li>
                <li>Please don&rsquo;t submit again &mdash; it&rsquo;s already on its way.</li>
              </ul>
            </div>

            {/* 主按钮：WhatsApp（去掉 mailto: 的 "Open email app"——它在手机上打开的是「写新邮件」而非收件箱，行为与文案不符） */}
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" referrerPolicy="strict-origin-when-cross-origin" className="block w-full h-14 mt-4 rounded-full bg-primary text-on-primary font-medium text-sm leading-[56px]">WhatsApp support</a>

            <p className="text-xs text-on-surface-variant mt-3">For security, the code is never shown here.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
