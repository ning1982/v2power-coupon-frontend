export default function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface-lowest rounded-[16px] shadow-m3-1 p-4">
      <div className="text-[11px] uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">
        {value}
        {sub && <small className="text-sm font-normal text-on-surface-variant ml-1">{sub}</small>}
      </div>
    </div>
  );
}
