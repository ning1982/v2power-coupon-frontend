import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ImportView() {
  const nav = useNavigate();
  const [batchName, setBatchName] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<{ batchId: string; imported: number; skipped: number } | null>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    setFileName(f.name);
    // mock：模拟导入成功（生产接 POST /coupon_api/admin/import）
    setResult({ batchId: "a6b47e1f860e488480618696bc84687c", imported: 500, skipped: 2 });
  };

  return (
    <div className="p-6 max-w-[1120px]">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-on-surface">Import vouchers</h1>
        <span className="text-sm text-on-surface-variant">Upload an Excel list to create vouchers</span>
      </div>

      <div className="mt-4 bg-surface-lowest rounded-[16px] shadow-m3-1 p-6 max-w-[560px]">
        <label className="text-sm font-medium text-on-surface" htmlFor="batchName">Batch name</label>
        <input
          id="batchName"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          placeholder="e.g. 202608-BP summer promo"
          className="mt-1 w-full h-12 px-4 rounded-[4px] border border-outline bg-transparent text-base outline-none focus:border-primary focus:border-2"
        />

        <div className="mt-4">
          <span className="text-sm font-medium text-on-surface">Excel file</span>
          <label
            htmlFor="file"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); document.getElementById("file")?.click(); } }}
            className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-outline rounded-[16px] p-10 cursor-pointer text-center hover:border-primary"
          >
            <div className="text-3xl opacity-50" aria-hidden>⬆</div>
            <p className="mt-2 text-sm text-on-surface"><b>{fileName ?? "Click to upload"}</b></p>
            <p className="text-xs text-on-surface-variant mt-1">.xls / .xlsx · up to 10,000 rows</p>
            <input id="file" type="file" accept=".xls,.xlsx" className="sr-only" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>

        <div className="mt-4 rounded-[12px] bg-surface-container p-4">
          <h3 className="text-sm font-medium text-on-surface">Excel format</h3>
          <code className="block mt-2 bg-surface-container-high rounded-[8px] p-3 font-mono text-xs leading-6">
            兑换编码&nbsp;&nbsp;&nbsp;&nbsp;面额<br />V2P-KHWMYLOQ&nbsp;&nbsp;10<br />V2P-FJCMFOBX&nbsp;&nbsp;10<br />V2P-86BG1RY&nbsp;&nbsp;5.5
          </code>
          <p className="text-xs text-on-surface-variant mt-2">Column 1 = voucher code · Column 2 = amount (optional, £)</p>
        </div>

        {result && (
          <div className="mt-4 rounded-[16px] bg-success-container text-on-success-container p-4">
            <div className="flex justify-between text-sm py-0.5"><span>Batch ID</span><b className="font-mono">{result.batchId}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Imported</span><b>{result.imported}</b></div>
            <div className="flex justify-between text-sm py-0.5"><span>Skipped (duplicates)</span><b>{result.skipped}</b></div>
          </div>
        )}

        {result && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => nav(`/admin/batch/${result.batchId}`)} className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-medium">View batch</button>
            <button className="h-10 px-5 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">Download QR ZIP</button>
          </div>
        )}
      </div>
    </div>
  );
}
