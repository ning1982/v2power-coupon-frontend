export default function StatusChip({ status }: { status: "pending" | "redeemed" }) {
  if (status === "redeemed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-success-container text-on-success-container px-2.5 py-0.5 text-[11px] font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />Redeemed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-high text-on-surface-variant px-2.5 py-0.5 text-[11px] font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden />Pending
    </span>
  );
}
