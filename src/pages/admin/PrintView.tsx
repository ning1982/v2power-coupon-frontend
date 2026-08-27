import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { fetchBatchDetail, type BatchDetail } from "../../api/admin";

// Redeem page base for QR: prefers env var, defaults to current origin (dev=tailscale, prod=domain)
const REDEEM_BASE = import.meta.env.VITE_REDEEM_BASE || `${window.location.origin}/coupon/`;

function redeemUrl(token: string, amount: number | null): string {
  const amt = amount != null ? `&amt=${amount}` : "";
  return `${REDEEM_BASE}?t=${encodeURIComponent(token)}${amt}`;
}

type StyleKey = "a" | "b" | "c";

const STYLE_META: Record<StyleKey, { label: string; dot: string }> = {
  a: { label: "Minimal", dot: "#0366BB" },
  b: { label: "Brand blue", dot: "#0366BB" },
  c: { label: "Vibrant", dot: "#FFBE1D" },
};

export default function PrintView() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [qr, setQr] = useState<Record<string, string>>({});
  const [style, setStyle] = useState<StyleKey>("a");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let on = true;
    setLoading(true);
    fetchBatchDetail(id, { page: 1, size: 1000 })
      .then(async (d) => {
        if (!on) return;
        setDetail(d);
        const entries = await Promise.all(
          d.vouchers.map(async (v) =>
            [v.token, await QRCode.toDataURL(redeemUrl(v.token, v.amount), { width: 220, margin: 0, errorCorrectionLevel: "M" })] as const,
          ),
        );
        if (!on) return;
        setQr(Object.fromEntries(entries));
        setLoading(false);
      })
      .catch(() => { if (on) setLoading(false); });
    return () => { on = false; };
  }, [id]);

  if (loading || !detail) {
    return <div className="p-8 text-on-surface-variant">Generating cards…</div>;
  }

  return (
    <div>
      <style>{cardCss}</style>

      <div className="print-toolbar sticky top-0 bg-surface-lowest border-b border-outline-variant px-6 py-4 flex items-center gap-3">
        <button onClick={() => nav(-1)} className="text-sm text-primary font-medium">← Back</button>
        <h1 className="text-lg font-semibold text-on-surface">{detail.batch_name}</h1>
        <span className="text-sm text-on-surface-variant">{detail.vouchers.length} cards</span>
        <span className="flex-1" />
        <div className="flex items-center gap-1" role="group" aria-label="Card style">
          {(Object.keys(STYLE_META) as StyleKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setStyle(k)}
              className={`h-9 px-4 rounded-full text-sm font-medium ${style === k ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-high"}`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ background: STYLE_META[k].dot }} aria-hidden />
              {STYLE_META[k].label}
            </button>
          ))}
        </div>
        <button onClick={() => window.print()} className="h-10 px-6 rounded-full bg-primary text-on-primary text-sm font-medium">Print / Save as PDF</button>
      </div>

      <div className="print-cards">
        {detail.vouchers.map((v) => (
          <div key={v.token} className={`vcard vcard-${style}`}>
            <div className="vcard-left">
              <div>
                <div className="vcard-brand">
                  <span className="vcard-brand-text">V2<span className="vcard-accent">Power</span></span>
                  <span className="vcard-tag">{style === "b" ? "CHARGING PASS" : style === "c" ? "OFFICIAL" : "EV CREDIT"}</span>
                </div>
              </div>
              <div className="vcard-value">
                <span className="vcard-sub">{style === "c" ? "EV CHARGING CREDIT" : "CHARGING VOUCHER"}</span>
                <div className="vcard-amount"><sup>£</sup>{v.amount ?? "\u2014"}</div>
              </div>
              <div>
                <div className="vcard-code">
                  <span className="vcard-code-label">VOUCHER CODE</span>
                  <div className="vcard-code-box">{v.token}</div>
                </div>
                <div className="vcard-foot">Single use voucher · Scan to redeem</div>
              </div>
            </div>
            <div className="vcard-right">
              <div className="vcard-qr">
                {qr[v.token] ? <img src={qr[v.token]} alt={`QR ${v.token}`} className="vcard-qr-img" /> : null}
              </div>
              <div className="vcard-qr-hint">Scan to redeem</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardCss = `
  .vcard { width: 85.6mm; height: 54mm; border-radius: 3.2mm; position: relative; overflow: hidden; display: flex; padding: 4.2mm 4.8mm; box-sizing: border-box; flex-shrink: 0; }
  .vcard-left { flex: 1; display: flex; flex-direction: column; justify-content: space-between; z-index: 2; padding-right: 3mm; }
  .vcard-right { width: 27mm; display: flex; flex-direction: column; align-items: center; justify-content: space-between; z-index: 2; }
  .vcard-brand { display: flex; align-items: center; gap: 1.5mm; line-height: 1; }
  .vcard-brand-text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11pt; font-weight: 800; letter-spacing: -0.03em; }
  .vcard-tag { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 4.8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 0.6mm 1.4mm; border-radius: 0.8mm; line-height: 1; }
  .vcard-value { display: flex; flex-direction: column; margin: 1.2mm 0; }
  .vcard-sub { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.4mm; }
  .vcard-amount { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 26pt; font-weight: 800; line-height: 0.88; letter-spacing: -0.04em; }
  .vcard-amount sup { font-size: 14pt; font-weight: 700; top: -0.4em; margin-right: 0.5mm; position: relative; }
  .vcard-code { display: flex; flex-direction: column; gap: 0.6mm; }
  .vcard-code-label { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 4.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.75; }
  .vcard-code-box { display: inline-flex; white-space: nowrap; word-break: keep-all; align-items: center; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 7.2pt; font-weight: 700; letter-spacing: 0.08em; padding: 1.2mm 2mm; border-radius: 1mm; line-height: 1; width: fit-content; }
  .vcard-foot { font-size: 4pt; font-weight: 500; margin-top: 1.2mm; opacity: 0.7; }
  .vcard-qr { background: #FFFFFF !important; padding: 2.2mm; border-radius: 1.8mm; display: flex; align-items: center; justify-content: center; box-shadow: 0 1mm 2.5mm rgba(0,0,0,0.08); }
  .vcard-qr-img { width: 22.6mm; height: 22.6mm; display: block; }
  .vcard-qr-hint { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 5.2pt; font-weight: 600; text-align: center; margin-top: 1.2mm; }

  /* Style A — Minimal (white + ink + blue) */
  .vcard-a { background: #FFFFFF; color: #1A2332; border: 0.25mm solid #E2E8F0; }
  .vcard-a .vcard-accent { color: #0366BB; }
  .vcard-a .vcard-tag { background: #EDF4FB; color: #0366BB; border: 0.2mm solid #CDE0F3; }
  .vcard-a .vcard-sub { color: #0366BB; }
  .vcard-a .vcard-amount { color: #1A2332; }
  .vcard-a .vcard-code-box { background: #F1F5F9; color: #1A2332; border: 0.2mm solid #CBD5E1; }
  .vcard-a .vcard-qr { border: 0.25mm solid #E2E8F0; }
  .vcard-a .vcard-foot { color: #94A3B8; }

  /* Style B — Brand blue (full #0366BB + white) */
  .vcard-b { background: #0366BB; color: #FFFFFF; }
  .vcard-b .vcard-accent { color: #8CC4F8; }
  .vcard-b .vcard-tag { background: rgba(255,255,255,0.16); color: #FFFFFF; border: 0.2mm solid rgba(255,255,255,0.25); }
  .vcard-b .vcard-sub { color: #BAE0FD; }
  .vcard-b .vcard-amount { color: #FFFFFF; }
  .vcard-b .vcard-code-box { background: #1A2332; color: #FFFFFF; border: 0.2mm solid rgba(255,255,255,0.15); }
  .vcard-b .vcard-foot { color: #8CC4F8; }
  .vcard-b .vcard-qr-hint { color: #FFFFFF; }

  /* Style C — Vibrant (white + yellow/blue accents) */
  .vcard-c { background: #FFFFFF; color: #1A2332; border: 0.25mm solid #E2E8F0; }
  .vcard-c .vcard-accent { color: #0366BB; }
  .vcard-c .vcard-tag { background: #1A2332; color: #FFFFFF; }
  .vcard-c .vcard-sub { color: #1A2332; }
  .vcard-c .vcard-amount { color: #0366BB; }
  .vcard-c .vcard-code-box { background: #F8FAFC; color: #1A2332; border: 0.25mm solid #1A2332; }
  .vcard-c .vcard-qr { border: 0.25mm solid #E2E8F0; }
  .vcard-c .vcard-foot { color: #64748B; }

  .print-cards { display: grid; grid-template-columns: repeat(2, 85.6mm); grid-auto-rows: 54mm; gap: 8mm; justify-content: center; padding: 16px; background: #f1f5f9; }
  @media print {
    @page { size: A4 portrait; margin: 8mm; }
    /* hide Admin chrome for clean print */
    aside, header { display: none !important; }
    main { overflow: visible !important; }
    .print-toolbar { display: none !important; }
    body { background: #fff !important; }
    .print-cards { background: #fff !important; gap: 7mm; padding: 0; }
    .vcard { page-break-inside: avoid; box-shadow: none; }
    .vcard, .vcard * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;
