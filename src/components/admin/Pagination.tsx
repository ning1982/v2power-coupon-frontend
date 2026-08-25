export default function Pagination({
  page, size, total, onPage,
}: { page: number; size: number; total: number; onPage: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const from = total === 0 ? 0 : (page - 1) * size + 1;
  const to = Math.min(page * size, total);
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm text-on-surface-variant">
      <span>{from}–{to} of {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="w-8 h-8 rounded-full grid place-items-center disabled:opacity-35 hover:bg-surface-high"
        >&#8249;</button>
        <span className="px-2 tabular-nums">{page} / {totalPages}</span>
        <button
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="w-8 h-8 rounded-full grid place-items-center disabled:opacity-35 hover:bg-surface-high"
        >&#8250;</button>
      </div>
    </div>
  );
}
