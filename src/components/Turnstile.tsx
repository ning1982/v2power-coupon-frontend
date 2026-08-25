import { useEffect, useRef, useState } from "react";
import { getCaptchaConfig } from "../api/captcha";
type Props = { onVerify: (token: string) => void; onExpire?: () => void };
declare global {
  interface Window {
    turnstile?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; reset: (id: string) => void };
    grecaptcha?: { render: (el: HTMLElement, opts: Record<string, unknown>) => number; getResponse: (id?: number) => string; reset: (id?: number) => void };
    hcaptcha?: { render: (el: HTMLElement, opts: Record<string, unknown>) => string; getResponse: () => string; reset: () => void };
  }
}
export default function Turnstile({ onVerify, onExpire }: Props) {
  const fallbackMode = (import.meta.env.VITE_CAPTCHA as string) || "none";
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<{ type: string; siteKey?: string; enabled: boolean; testMode?: boolean; testToken?: string; loading: boolean; error?: string }>({ type: fallbackMode, enabled: fallbackMode !== "none", loading: true });
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cfg = await getCaptchaConfig();
        if (cancelled) return;
        setState({ type: cfg.captcha_type || "none", siteKey: cfg.site_key, enabled: cfg.enabled !== false && cfg.captcha_type !== "none", testMode: cfg.test_mode, testToken: cfg.test_token, loading: false });
        if (!cfg.enabled || cfg.captcha_type === "none" || !cfg.site_key) {
          onVerify("");
          setVerified(true);
        }
      } catch {
        if (cancelled) return;
        const isNone = fallbackMode === "none";
        setState({ type: fallbackMode, siteKey: (import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined), enabled: !isNone, loading: false, error: "Failed to load captcha config, fallback to env" });
        if (isNone) { onVerify(""); setVerified(true); }
      }
    })();
    return () => { cancelled = true; };
  }, [fallbackMode, onVerify]);
  useEffect(() => {
    if (state.loading || !state.enabled || !state.siteKey || !containerRef.current) return;
    const type = state.type;
    if (type === "turnstile") {
      const siteKey = state.siteKey;
      let widgetId: string | undefined;
      const existing = document.querySelector('script[data-turnstile]') as HTMLScriptElement | null;
      const render = () => {
        if (!containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current!, {
          sitekey: siteKey,
          callback: (token: string) => { setVerified(true); onVerify(token); },
          "expired-callback": () => { setVerified(false); onVerify(""); onExpire?.(); },
          "error-callback": () => setVerified(false),
        });
      };
      if (window.turnstile) render();
      else if (!existing) {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
        s.async = true; s.defer = true; (s as any).dataset.turnstile = "1";
        s.onload = render;
        document.head.appendChild(s);
      } else existing.addEventListener("load", render, { once: true });
      return () => { if (widgetId && window.turnstile) try { window.turnstile.reset(widgetId); } catch {} };
    }
    if (type === "recaptcha") {
      const siteKey = state.siteKey!;
      let widgetId: number | undefined;
      const render = () => {
        if (!containerRef.current || !window.grecaptcha) return;
        try {
          widgetId = window.grecaptcha.render(containerRef.current!, {
            sitekey: siteKey,
            callback: (token: string) => { setVerified(true); onVerify(token); },
            "expired-callback": () => { setVerified(false); onVerify(""); onExpire?.(); },
            "error-callback": () => setVerified(false),
          });
        } catch {}
      };
      if (window.grecaptcha && (window.grecaptcha as any).render) render();
      else {
        const existing = document.querySelector('script[data-recaptcha]') as HTMLScriptElement | null;
        if (!existing) {
          const s = document.createElement("script");
          s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
          s.async = true; s.defer = true; (s as any).dataset.recaptcha = "1";
          s.onload = render;
          document.head.appendChild(s);
        } else existing.addEventListener("load", render, { once: true });
      }
      return () => { if (widgetId !== undefined && window.grecaptcha) try { window.grecaptcha.reset(widgetId); } catch {} };
    }
    if (type === "hcaptcha") {
      const siteKey = state.siteKey!;
      let widgetId: string | undefined;
      const render = () => {
        if (!containerRef.current || !window.hcaptcha) return;
        try {
          widgetId = window.hcaptcha.render(containerRef.current!, {
            sitekey: siteKey,
            callback: (token: string) => { setVerified(true); onVerify(token); },
            "expired-callback": () => { setVerified(false); onVerify(""); onExpire?.(); },
            "error-callback": () => setVerified(false),
          });
        } catch {}
      };
      if (window.hcaptcha) render();
      else {
        const existing = document.querySelector('script[data-hcaptcha]') as HTMLScriptElement | null;
        if (!existing) {
          const s = document.createElement("script");
          s.src = "https://hcaptcha.com/1/api.js?render=explicit";
          s.async = true; s.defer = true; (s as any).dataset.hcaptcha = "1";
          s.onload = render;
          document.head.appendChild(s);
        } else existing.addEventListener("load", render, { once: true });
      }
      return () => { if (widgetId && window.hcaptcha) try { window.hcaptcha.reset(); } catch {} };
    }
  }, [state, onVerify, onExpire]);
  if (state.loading) {
    return <div className="text-xs text-slate-500 bg-slate-100 rounded p-2">Loading verification...</div>;
  }
  if (!state.enabled || state.type === "none") {
    return <div className="text-xs text-slate-500 bg-slate-100 rounded p-2">Dev mode: human verification bypassed (captcha_token=none)</div>;
  }
  return (
    <div>
      <div ref={containerRef} />
      <p className="text-xs text-slate-500 mt-1">{verified ? "Verified" : "Verifying via " + state.type + "..."}</p>
      {state.error && <p className="text-[11px] text-slate-500 mt-1">{state.error}</p>}
    </div>
  );
}
