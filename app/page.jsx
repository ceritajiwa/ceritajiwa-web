"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useRouter } from "next/navigation";

export default function Home() {
  const [trainings, setTrainings] = useState([]);
  const [err, setErr] = useState("");
  const router = useRouter();
  useEffect(() => { api("/api/trainings").then(setTrainings).catch(e => setErr(e.message)); }, []);
  return (
    <>
      <div className="card">
        <h1>Selamat datang 👋</h1>
        <p className="muted">Pilih perusahaan / training Anda di bawah, lalu lanjutkan ke Asesmen atau Ujian Sertifikasi. Isi dengan jujur — tidak ada jawaban benar atau salah.</p>
      </div>
      {err && <div className="card"><b style={{color:"var(--danger)"}}>Gagal memuat:</b> {err}<br/><span className="muted">Periksa koneksi API (NEXT_PUBLIC_API_URL) atau tunggu server bangun ±30 detik lalu refresh.</span></div>}
      {trainings.map(t => <TrainingCard key={t.id} t={t} go={(page, code) => router.push(`/${page}?t=${t.id}&code=${encodeURIComponent(code)}`)} />)}
      <p className="muted center" style={{marginTop:22}}>
        <a href="/admin" style={{color:"var(--navy)", marginRight:16}}>🔐 Admin</a>
        <a href="/bei" style={{color:"var(--navy)"}}>👨‍⚕️ Menu Trainer (BEI)</a>
      </p>
    </>
  );
}

function TrainingCard({ t, go }) {
  const [code, setCode] = useState("");
  const [open, setOpen] = useState(false);
  const need = !!t.access_code;
  const n_inst = (t.enabled || []).length;
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>{t.name}</h2>
      <div className="muted" style={{marginBottom:12}}>
        <span className="badge">{n_inst} asesmen tersedia</span>
        <span className="badge">{need ? "butuh kode akses" : "publik"}</span>
      </div>
      {need && !open && (
        <div style={{maxWidth:340}}>
          <label className="muted">Kode akses</label>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="Masukkan kode akses" />
        </div>
      )}
      <div style={{marginTop:14, display:"flex", gap:10, flexWrap:"wrap"}}>
        <button className="btn" onClick={() => need && !open ? setOpen(true) : go("asesmen", code)}>📝 Mulai Asesmen</button>
        <button className="btn ghost" onClick={() => need && !open ? setOpen(true) : go("ujian", code)}>🎓 Ujian Sertifikasi</button>
      </div>
      {need && open && (
        <div style={{marginTop:12, maxWidth:420}}>
          <label className="muted">Kode akses untuk {t.name}</label>
          <input type="password" value={code} onChange={e => setCode(e.target.value)} placeholder="Kode akses" />
          <div style={{marginTop:10}}>
            <button className="btn accent" onClick={() => go("asesmen", code)}>Masuk ke Asesmen</button>{" "}
            <button className="btn ghost" onClick={() => go("ujian", code)}>Masuk ke Ujian</button>
          </div>
        </div>
      )}
    </div>
  );
}
