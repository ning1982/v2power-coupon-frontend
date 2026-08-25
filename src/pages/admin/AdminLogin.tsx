import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/admin";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const nav = useNavigate();

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (login(pw)) nav("/admin", { replace: true });
          else setErr(true);
        }}
        className="bg-surface-lowest rounded-[16px] shadow-m3-1 border border-outline-variant p-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <div className="h-9 w-9 rounded-[8px] bg-primary text-on-primary grid place-items-center text-sm font-bold">V2</div>
          <div>
            <div className="font-semibold text-on-surface">V2Power</div>
            <div className="text-[11px] uppercase tracking-widest text-on-surface-variant">Admin</div>
          </div>
        </div>
        <label className="text-xs font-medium text-on-surface-variant" htmlFor="pw">Password</label>
        <input
          id="pw"
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setErr(false); }}
          aria-invalid={err}
          className="mt-1 w-full h-12 px-4 rounded-[4px] border border-outline bg-transparent text-base outline-none focus:border-primary focus:border-2"
          placeholder="demo"
        />
        {err && <p className="text-xs text-error mt-2" role="alert">Incorrect password.</p>}
        <button type="submit" className="w-full h-12 mt-4 rounded-full bg-primary text-on-primary font-medium text-sm">Sign in</button>
        <p className="text-[11px] text-on-surface-variant text-center mt-4">Internal tool &mdash; authorized personnel only</p>
      </form>
    </div>
  );
}
