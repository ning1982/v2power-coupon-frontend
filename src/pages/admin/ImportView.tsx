import { useState } from "react";
import { importVouchers, getQrUrl, downloadBatchZip } from "../../api/admin";

export default function ImportView() {
  const [batchName, setBatchName] = useState("202608-BP Summer Promo");
  const [amount, setAmount] = useState("10");
  const [expiry, setExpiry] = useState(() => { const d = new Date(); d.setFullYear(d.getFullYear()+1); return d.toISOString().slice(0,10); });
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ batchId: string; batchName: string; amount: number | null; expiry: string; imported: number; skipped: number; tokens: string[] } | null>(null);

  const onFile = async (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    setErr(null);
    setLoading(true);
    try {
      const r = await importVouchers(f);
      const amt = amount.trim() === "" ? null : Number(amount);
      setResult({ batchId: r.batch_id, batchName: batchName.trim() || "Untitled batch", amount: amt === null || isNaN(amt) ? null : amt, expiry, imported: r.imported, skipped: r.skipped, tokens: r.tokens });
    } catch (e: any) {
      setErr(e.message || "Import failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const downloadSample = () => {
    const a = document.createElement("a");
    a.href = "/coupon/sample-batch.xlsx";
    a.download = "sample-batch.xlsx";
    a.click();
  };

  return (
    <div className="p-6 max-w-[1120px]">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-on-surface">Import vouchers</h1>
        <span className="text-sm text-on-surface-variant">Upload an Excel list to create vouchers</span>
      </div>

      <div className="mt-4 bg-surface-lowest rounded-[16px] shadow-m3-1 p-6 max-w-[560px]">
        <label className="text-sm font-medium text-on-surface" htmlFor="batchName">Batch name</label>
        <input id="batchName" value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g. 202608-BP summer promo" className="mt-1 w-full h-12 px-4 rounded-[4px] border border-outline bg-transparent text-base outline-none focus:border-primary focus:border-2" />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div><label className="text-sm font-medium text-on-surface" htmlFor="amount">Amount (£)</label><input id="amount" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10" className="mt-1 w-full h-12 px-4 rounded-[4px] border border-outline bg-transparent text-base outline-none focus:border-primary focus:border-2" /></div>
          <div><label className="text-sm font-medium text-on-surface" htmlFor="expiry">Valid until</label><input id="expiry" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="mt-1 w-full h-12 px-4 rounded-[4px] border border-outline bg-transparent text-base outline-none focus:border-primary focus:border-2" /></div>
        </div>

        <div className="mt-4">
          <span className="text-sm font-medium text-on-surface">Excel file</span>
          <label htmlFor="file" className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-outline rounded-[16px] p-10 cursor-pointer text-center hover:border-primary">
            <div className="text-3xl opacity-50" aria-hidden>⬆</div>
            <p className="mt-2 text-sm text-on-surface"><b>{loading ? "Uploading..." : (fileName ?? "Click to upload")}</b></p>
            <p className="text-xs text-on-surface-variant mt-1">.xls / .xlsx · Column 1: voucher code · header required</p>
            <input id="file" type="file" accept=".xls,.xlsx" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} disabled={loading} />
          </label>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={downloadSample} className="text-xs h-8 px-3 rounded-full border border-outline text-on-surface-variant hover:bg-surface-high">Download sample Excel (8 rows)</button>
          <span className="text-xs text-on-surface-variant self-center">Batch name / amount / expiry shown locally only (not yet persisted - backend #1/#5 pending)</span>
        </div>

        <div className="mt-4 rounded-[12px] bg-surface-container p-4">
          <h3 className="text-sm font-medium text-on-surface">Excel format</h3>
          <code className="block mt-2 bg-surface-container-high rounded-[8px] p-3 font-mono text-xs leading-6">
            voucher_code<br />V2P-KHWMYLOQ<br />V2P-FJCMFOBX<br />V2P-86BG1RY
          </code>
          <p className="text-xs text-on-surface-variant mt-2">Column 1 = voucher code (batch name / amount / expiry set above)</p>
        </div>

        {err && <div className="mt-4 rounded-[12px] bg-error-container text-on-error-container p-3 text-sm" role="alert">{err}</div>}

        {result && (
          <div className="mt-4 rounded-[16px] bg-success-container text-on-success-container p-4">
            <div className="flex justify-between text-sm py-0.5"><span>Batch name</span><b className="text-sm">{result.batchName}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Amount</span><b>{result.amount === null ? "—" : `£${result.amount}`}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Valid until</span><b>{result.expiry}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Batch ID</span><b className="font-mono text-xs break-all">{result.batchId}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Imported</span><b>{result.imported}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Skipped</span><b>{result.skipped}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Tokens</span><b>{result.tokens.length}</b></div>
          </div>
        )}

        {result && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => downloadBatchZip(result.batchId)} className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-medium">Download QR ZIP</button>
            <button onClick={() => { navigator.clipboard.writeText(result.batchId); }} className="h-10 px-5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">Copy Batch ID</button>
          </div>
        )}
      </div>

      {result && result.tokens.length > 0 && (
        <div className="mt-6 bg-surface-lowest rounded-[16px] shadow-m3-1 p-6">
          <h3 className="text-sm font-semibold text-on-surface">{result.batchName} — Tokens & QR preview {result.amount !== null ? `(£${result.amount} · until ${result.expiry})` : ""}</h3>
          <p className="text-xs text-on-surface-variant mt-1">QR images from GET /admin/qr?token= · redeem page resolves amount/expiry by token</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.tokens.slice(0, 12).map((tok) => (
              <div key={tok} className="rounded-[12px] border border-outline-variant p-3 text-center">
                <img src={getQrUrl(tok)} alt={tok} className="w-32 h-32 mx-auto object-contain" loading="lazy" />
                <div className="font-mono text-xs mt-2 break-all">{tok}</div>
                <div className="text-xs text-on-surface-variant">{result.amount !== null ? `£${result.amount}` : ""} {result.expiry ? `· ${result.expiry}` : ""}</div>
                <a href={getQrUrl(tok)} target="_blank" rel="noreferrer" className="text-xs text-primary mt-1 inline-block">Open PNG</a>
              </div>
            ))}
          </div>
          {result.tokens.length > 12 && <p className="text-xs text-on-surface-variant mt-3">{result.tokens.length} total, ZIP contains all</p>}
        </div>
      )}
    </div>
  );
}