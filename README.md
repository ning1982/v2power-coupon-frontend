# V2Power Coupon Frontend — Voucher Redeem Website

Vite + React + TS + Tailwind + React Router + Hook Form + Zod 静态 SPA，部署到公司 Linux Nginx（dist/）。

## 目录结构（符合开发规范）
`
v2power-coupon-frontend/
  docs/
    specs/  PRD v1.2 + 交互逻辑 IA v1.2（已合入老板9项反馈）
    api/    v2power-coupon-API_SIMPLE_v1/v2.md（Base http://192.168.33.100:8088）
  specs/    兼容旧路径，同 docs/specs
  src/
    api/coupon.ts        兑换接口（POST /api/coupon/redeem，代理到 8088）
    lib/validation.ts    Zod 双邮箱+GDPR+Token 校验
    lib/errorMap.ts      API code 0/1 → 中文 E101/E102 等
    lib/storage.ts       sessionStorage 草稿 + beforeunload 销毁
    components/Turnstile.tsx  Cloudflare Turnstile 无感+降级，dev传 none
    pages/RedeemPage.tsx P0+P1+P3 统一（?t= 预填、15s超时先查邮箱）
    pages/SuccessPage.tsx P2 history.state 传邮箱（不放URL）+ WhatsApp
    pages/HelpPage.tsx   P4 FAQ + WhatsApp
    App.tsx  Router / /success /help
  public/
  vite.config.ts  proxy /api → 192.168.33.100:8088
  .env.example    VITE_CAPTCHA=none 本地跳过验证
`

## 本地开发（Win）
`ash
npm install
npm run dev   # http://localhost:5173/?t=V2P-XXXX 自动预填
`

## 构建部署（Linux Nginx）
`ash
npm run build # → dist/
# scp -r dist/* user@192.168.33.122:/var/www/coupon/
# Nginx: try_files \ /index.html; location /api/ { proxy_pass http://127.0.0.1:8088; }
`

## 9项老板反馈已合入
- 双邮箱确认、GDPR必勾、Turnstile无感+降级、amount占位、邮件面额/有效期、P2/P4 WhatsApp、history.state隐私、超时幂等文案、草稿销毁
