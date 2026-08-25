export function mapApiError(msg: string): { code: string; text: string } {
  if (msg.includes("Token不存在") || msg.includes("不存在")) return { code: "E101", text: "Invalid Token. Please check the code on your card." };
  if (msg.includes("已被兑换")) return { code: "E102", text: "This Token has already been redeemed. Please check your inbox (including spam) or contact WhatsApp support." };
  if (msg.includes("人机验证")) return { code: "E004", text: "Verification failed. Please complete the human verification and try again." };
  if (msg.includes("不一致") || msg.toLowerCase().includes("mismatch") || msg.toLowerCase().includes("confirmed_email")) return { code: "E400", text: "Email confirmation does not match. Please re-enter your email." };
  if (msg.includes("邮件发送失败")) return { code: "E500", text: "Redeemed, but email delivery is delayed. It has been queued and will be retried. Please check your inbox later." };
  if (msg.includes("限流") || msg.includes("频繁")) return { code: "E201", text: "Too many requests. Please try again later." };
  return { code: "E500", text: msg || "Service temporarily unavailable. Please try again later." };
}
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return local[0] + "***@" + domain;
  return local[0] + "***" + local.slice(-1) + "@" + domain;
}
