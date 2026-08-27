import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";
import { isAuthed, logout } from "../../api/admin";

export default function AdminLayout() {
  const nav = useNavigate();
  if (!isAuthed()) return <Navigate to="/admin/login" replace />;
  return (
    <div className="flex min-h-screen">
      <aside className="w-[256px] flex-none bg-surface-container-low border-r border-outline-variant flex flex-col">
        <div className="flex items-center gap-2.5 px-4 py-4">
          <div className="h-8 w-8 rounded-[8px] bg-primary text-on-primary grid place-items-center text-xs font-bold">V2</div>
          <span className="font-semibold text-on-surface">V2Power</span>
          <span className="ml-auto text-[10px] uppercase tracking-widest text-on-surface-variant border border-outline-variant rounded-full px-2 py-0.5">Admin</span>
        </div>
        <nav aria-label="Main navigation" className="px-2 py-1 flex flex-col gap-0.5">
          <NavLink to="/admin/import" className={({ isActive }) => `flex items-center gap-3 h-11 px-3 rounded-full text-sm font-medium ${isActive ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-high"}`}>Import</NavLink>
          
        </nav>
        <div className="mt-auto p-4 border-t border-outline-variant">
          <div className="text-xs text-on-surface-variant">Internal tool</div>
          <button onClick={() => { logout(); nav("/admin/login", { replace: true }); }} className="text-xs text-primary mt-2">Sign out</button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-14 flex-none flex items-center gap-3 px-6 border-b border-outline-variant bg-surface-lowest">
          <span className="font-medium text-on-surface">Voucher Admin</span>
          
        </header>
        <main className="flex-1 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}