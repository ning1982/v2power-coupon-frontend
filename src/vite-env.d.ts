/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAPTCHA?: string
  readonly VITE_WHATSAPP?: string
  readonly VITE_API_TARGET?: string
  readonly VITE_API_BASE?: string
  readonly VITE_MOCK?: string
  readonly VITE_TURNSTILE_SITEKEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}