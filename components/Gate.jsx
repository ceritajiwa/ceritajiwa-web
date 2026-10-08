"use client";
import { useState } from "react";
import { api } from "../lib/api";
export default function Gate({ title, subtitle, trainingId, onUnlock }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="card" style={{maxWidth:440, margin:"50px auto", textAlign:"center"}}>
      <div style={{fontSize:40}}>🔒</div>
      <h1 style={{marginTop:8}}>{title}</h1>
      <p className="muted">{subtitle}</p>
      <input type="password" placeholder="Kode akses" value={code} onChange={e => { setCode(e.target.value); setErr(""); }}
        style={{textAlign:"center", letterSpacing:3, marginTop:14}} />
      {err && <p style={{color:"var(--danger)", marginTop:8}}>{err}</p>}
      <button className="btn" style={{width:"100%", marginTop:12}} disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await api("/api/verify-code", { method: "POST", body: { training_id: trainingId, code } });
            onUnlock(code);
          } catch (e) { setErr("Kode akses salah. Coba lagi atau hubungi trainer Anda."); }
          finally { setBusy(false); }
        }}>{busy ? "Memeriksa…" : "Masuk"}</button>
      <p className="muted" style={{marginTop:10, fontSize:12.5}}>Kode akses didapat dari trainer/HR perusahaan Anda.</p>
    </div>
  );
}
