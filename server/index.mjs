// 本地 voucher 邮件后端（开发用）
// 职责：接收 /coupon_api/coupon/redeem，通过 MailHog SMTP（localhost:1025）发 voucher 邮件，
//       返回脱敏邮箱。生产环境应替换为真实后端（192.168.33.100:8088）+ 真实 SMTP。
// 用法：node server/index.mjs   （MailHog 需先跑：mailhog）
import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(express.json());

const PORT = Number(process.env.MAIL_PORT || 8787);

// MailHog SMTP —— 本地捕获，不真发到收件人邮箱
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: false,
});

// 与前端 src/lib/errorMap.ts 的 maskEmail 保持一致
function maskEmail(email) {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return local[0] + "***@" + domain;
  return local[0] + "***" + local.slice(-1) + "@" + domain;
}

function voucherText(token) {
  return [
    "Your V2Power charging voucher",
    "",
    `Your voucher code: ${token}`,
    "",
    "Enter this code on the charger screen to start charging.",
    "",
    "Need help? Message us on WhatsApp.",
    "\u2014 V2Power",
  ].join("\n");
}

function voucherHtml(token) {
  const esc = String(token).replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]));
  return [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a2332;">',
    '  <div style="font-size:20px;font-weight:700;color:#0366BB;">V2Power</div>',
    '  <p style="margin:16px 0 0;">Hi there,</p>',
    '  <p style="margin:8px 0 0;">Here\u2019s your charging voucher code:</p>',
    `  <div style="background:#f0f6fc;border:1px solid #0366BB;border-radius:8px;padding:16px;font-size:24px;font-weight:700;letter-spacing:2px;text-align:center;color:#0366BB;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;margin:16px 0;">${esc}</div>`,
    '  <p style="margin:8px 0 0;">Enter this code on the charger screen to start charging.</p>',
    '  <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">Need help? Message us on WhatsApp.</p>',
    '  <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">\u2014 V2Power</p>',
    "</div>",
  ].join("\n");
}

app.post("/coupon_api/coupon/redeem", async (req, res) => {
  const { email, token } = req.body || {};
  if (!email || !token) {
    return res.status(400).json({ code: 400, msg: "Email and token are required" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ code: 400, msg: "Invalid email address" });
  }

  try {
    await transporter.sendMail({
      from: '"V2Power" <no-reply@v2power.io>',
      to: email,
      subject: "Your V2Power charging voucher",
      text: voucherText(token),
      html: voucherHtml(token),
    });
    console.log(`[mail] sent voucher ${token} -> ${email}`);
    return res.json({
      code: 0,
      data: { email_sent: true, email: maskEmail(email), message: "sent" },
    });
  } catch (err) {
    console.error("[mail] send failed:", err.message);
    return res.status(500).json({ code: 500, msg: "Failed to send email: " + err.message });
  }
});

// captcha 配置 —— 本地开发返回 disabled（对齐 VITE_CAPTCHA=none）
app.get("/coupon_api/captcha/config", (_req, res) => {
  res.json({ code: 0, data: { captcha_type: "none", site_key: "", enabled: false } });
});
app.get("/coupon_api/captcha/test-token", (_req, res) => {
  res.json({ code: 0, data: { token: "" } });
});

app.get("/healthz", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`[mail-server] listening on http://localhost:${PORT}`);
  console.log(`[mail-server] SMTP -> ${transporter.options.host}:${transporter.options.port} (MailHog)`);
});
