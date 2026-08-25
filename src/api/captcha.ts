export type CaptchaConfig = {
  captcha_type: "none" | "recaptcha" | "hcaptcha" | "turnstile";
  site_key: string;
  enabled: boolean;
  test_mode?: boolean;
  test_token?: string;
  test_hint?: string;
};

export async function getCaptchaConfig(): Promise<CaptchaConfig> {
  // 本地开发 mock：不连内网后端，避免代理打到 192.168.33.100 ETIMEDOUT 卡死加载条
  if (import.meta.env.DEV && import.meta.env.VITE_MOCK === "1") {
    return { captcha_type: "none", site_key: "", enabled: false };
  }
  const res = await fetch("/coupon_api/captcha/config", { headers: { Accept: "application/json" } });
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { code: number; data: CaptchaConfig; msg?: string };
    if (json.code === 0 && json.data) return json.data;
    throw new Error(json.msg || "captcha config failed");
  } catch (e) {
    throw e;
  }
}

export async function getCaptchaTestToken(): Promise<string> {
  const res = await fetch("/coupon_api/captcha/test-token");
  const text = await res.text();
  try {
    const json = JSON.parse(text) as { code: number; data: { token?: string; captcha_token?: string } | string; msg?: string };
    if (typeof json.data === "string") return json.data;
    if (json.data && typeof json.data === "object") return (json.data as any).token || (json.data as any).captcha_token || "";
    return text.slice(0, 500);
  } catch {
    return text.slice(0, 500);
  }
}
