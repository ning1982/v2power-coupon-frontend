import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBatches, fmtAmount, fmtDate, type Batch } from "../../api/admin";
import StatCard from "../../components/admin/StatCard";

const gbp = (n: number) => "\u00A3" + n.toLocaleString();

export default function BatchesView() {
  const nav = useNavigate();
  const [items, setItems] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let on = true;
    fetchBatches(1, 1000).then((r) => { if (on) { setItems(r.items); setLoading(false); } });
    return () => { on = false; };
  }, []);

  const totalVouchers = items.reduce((s, b) => s + b.voucher_count, 0);
  const redeemed = items.reduce((s, b) => s + b.redeemed_count, 0);
  const totalValue = items.reduce((s, b) => s + (b.amount ?? 0) * b.voucher_count, 0);
  const pct = totalVouchers ? Math.round((redeemed / totalVouchers) * 100) : 0;

  return (
    <div className="p-6 max-w-[1120px]">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-on-surface">Voucher Batches</h1>
        <span className="text-sm text-on-surface-variant">Manage vouchers, amounts and QR codes</span>
        <span className="flex-1" />
        <button onClick={() => nav("/admin/import")} className="h-10 px-5 rounded-full bg-primary text-on-primary text-sm font-medium">Import vouchers</button>
      </div>

      <div className="grid grid-cols-4 gap-3 mt-4">
        <StatCard label="Total vouchers" value={totalVouchers.toLocaleString()} />
        <StatCard label="Redeemed" value={redeemed.toLocaleString()} sub={`(${pct}%)`} />
        <StatCard label="Total value" value={gbp(totalValue)} />
        <StatCard label="Batches" value={String(items.length)} />
      </div>

      <div className="bg-surface-lowest rounded-[16px] shadow-m3-1 mt-4 overflow-hidden">
        <div className="px-5 py-4 border-b border-outline-variant"><h2 className="text-sm font-semibold text-on-surface">Batches</h2></div>
        <table className="w-full" aria-label="Batch list">
          <thead>
            <tr>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Batch</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Imported</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Vouchers</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Redeemed</th>
              <th scope="col" className="text-left px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Amount</th>
              <th scope="col" className="text-right px-5 py-2.5 text-[11px] uppercase tracking-wider text-on-surface-variant font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant">No batches yet. Import your first voucher list.</td></tr>
            ) : items.map((b) => (
              <tr key={b.batch_id} className="hover:bg-surface-low">
                <td className="px-5 py-3">
                  <div className="font-medium text-on-surface">{b.batch_name}</div>
                  <div className="text-xs text-on-surface-variant font-mono">{b.batch_id.slice(0, 10)}…</div>
                </td>
                <td className="px-5 py-3 text-on-surface-variant">{fmtDate(b.created_at)}</td>
                <td className="px-5 py-3 tabular-nums">{b.voucher_count.toLocaleString()}</td>
                <td className="px-5 py-3 tabular-nums">{b.redeemed_count.toLocaleString()}</td>
                <td className="px-5 py-3 font-medium tabular-nums">{fmtAmount(b.amount)}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => nav(`/admin/batch/${b.batch_id}`)} className="text-sm text-primary font-medium">View</button>
                  <button className="text-sm text-primary font-medium ml-3">QR ZIP</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
