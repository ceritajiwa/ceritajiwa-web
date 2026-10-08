"use client";
import { useEffect, useState } from "react";
import { api, getToken, setToken, downloadFile } from "../../lib/api";
import Radar from "../../components/Radar";

const CLUSTER_COLOR = {1:"#2E8B57", 2:"#F2C14E", 3:"#E67E22", 4:"#C0392B"};
const CLUSTER_NAME = {1:"Sehat & Terlibat", 2:"Cukup Baik", 3:"Perlu Perhatian", 4:"Prioritas Intervensi"};

export default function Admin() {
  const [token, setT] = useState(null);
  const [pwd, setPwd] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [tid, setTid] = useState("");
  const [rep, setRep] = useState(null);
  const [exam, setExam] = useState([]);
  const [resps, setResps] = useState([]);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [nt, setNt] = useState({ name: "", access_code: "" });
  async function email(kind, id) {
    setMsg("");
    try { await api(`/api/admin/email/${kind}/${id}`, { method: "POST", auth: token }); setMsg("📧 Terkirim!"); }
    catch (e) { setMsg("⚠️ " + e.message); }
  }
  useEffect(() => { api("/api/trainings").then(ts => { setTrainings(ts); if (ts[0]) setTid(ts[0].id); }); }, []);
  async function load(t) {
    setErr("");
    try {
      const r = await api(`/api/report/company/${t}`, { auth: token });
      setRep(r.empty ? null : r);
      setExam(await api(`/api/admin/exam/${t}`, { auth: token }));
      setResps(await api(`/api/admin/respondents/${t}`, { auth: token }));
    } catch (e) { setErr(e.message); }
  }
  if (!token) {
    const saved = getToken("admin");
    if (saved) { setT(saved); return null; }
    return (
      <div className="card" style={{maxWidth:420, margin:"40px auto"}}>
        <h1>🔐 Area Admin</h1>
        <label>Password admin</label>
        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
        <button className="btn" style={{marginTop:14, width:"100%"}} onClick={async () => {
          try { const r = await api("/api/login", { method:"POST", body:{password: pwd, role:"admin"} });
            setToken("admin", r.token); setT(r.token); } catch (e) { alert(e.message); }
        }}>Masuk</button>
      </div>
    );
  }
  return (
    <>
      <div className="card">
        <h1>📊 Report per Perusahaan</h1>
        <label>Perusahaan / Training</label>
        <select value={tid} onChange={e => { setTid(e.target.value); load(e.target.value); }}>
          {trainings.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="btn" style={{marginTop:10}} onClick={() => load(tid)}>Muat Report</button>
        {err && <p style={{color:"var(--danger)"}}>{err}</p>}
        {msg && <p style={{color:"var(--navy)"}}>{msg}</p>}
      </div>
      <div className="card">
        <h2 style={{marginTop:0}}>🏢 Kelola Training</h2>
        <table><thead><tr><th>Nama</th><th>Kode akses</th><th></th></tr></thead>
        <tbody>{trainings.map(t => (
          <tr key={t.id}><td>{t.name}</td><td>{t.access_code || "-"}</td>
            <td><button className="btn ghost" style={{padding:"5px 12px", fontSize:13}}
              onClick={async () => { if (confirm("Hapus " + t.name + " beserta semua datanya?")) {
                await api(`/api/admin/trainings/${t.id}`, { method:"DELETE", auth: token });
                const ts = await api("/api/trainings"); setTrainings(ts); } }}>🗑️</button></td></tr>
        ))}</tbody></table>
        <div className="grid2" style={{marginTop:12}}>
          <div><label>Nama training baru</label><input value={nt.name} onChange={e => setNt({...nt, name: e.target.value})} /></div>
          <div><label>Kode akses (opsional)</label><input value={nt.access_code} onChange={e => setNt({...nt, access_code: e.target.value})} /></div>
        </div>
        <button className="btn accent" style={{marginTop:10}}
          disabled={!nt.name.trim()}
          onClick={async () => {
            await api("/api/admin/trainings", { method:"POST", auth: token, body: nt });
            const ts = await api("/api/trainings"); setTrainings(ts); setNt({name:"", access_code:""});
          }}>➕ Tambah</button>
        <p className="muted" style={{marginTop:8, fontSize:12.5}}>Ubah kombinasi asesmen per training menyusul di versi berikutnya.</p>
      </div>
      <div className="card">
        <h2 style={{marginTop:0}}>👤 Peserta Asesmen ({resps.length})</h2>
        {resps.length === 0 ? <p className="muted">Belum ada peserta.</p> : (
          <table><thead><tr><th>Nama</th><th>Email</th><th>Dept</th><th>Unduh / Kirim</th></tr></thead>
          <tbody>{resps.map(r => (
            <tr key={r.id}><td>{r.full_name}</td><td>{r.email}</td><td>{r.department || "-"}</td>
              <td style={{whiteSpace:"nowrap"}}>
                <button className="btn ghost" style={{padding:"5px 10px", fontSize:12.5, marginRight:6}}
                  onClick={() => downloadFile(`/api/assessment/${r.id}/pdf`, token, `Hasil_${r.full_name}.pdf`)}>⬇️ PDF</button>
                <button className="btn ghost" style={{padding:"5px 10px", fontSize:12.5}}
                  onClick={() => email("assessment", r.id)}>📧 Kirim</button>
              </td></tr>
          ))}</tbody></table>
        )}
      </div>
      {rep && (
        <>
          <div className="card grid2">
            <div><div className="muted">Responden</div><div className="scorebig">{rep.n}</div></div>
            <div><div className="muted">Klasterisasi</div>
              {[1,2,3,4].map(c => (
                <div key={c} style={{margin:"4px 0"}}>
                  <span className="pill" style={{background:CLUSTER_COLOR[c]}}>{CLUSTER_NAME[c]}</span>
                  <b> {rep.clusters.counts[c] || 0} orang</b>
                </div>
              ))}
            </div>
          </div>
          <div className="card"><Radar data={rep.mean} title="Profil rata-rata (makin tinggi = makin sehat)" /></div>
          <div className="card">
            <h2 style={{marginTop:0}}>📋 Gap Analysis</h2>
            <table><thead><tr><th>Dimensi</th><th>Rata2</th><th>Target</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>{rep.gap.map(g => (
                <tr key={g.dim}><td>{g.label}</td><td>{g.mean}</td><td>{g.target}</td>
                  <td>{g.gap >= 0 ? "✅" : "⚠️"} {g.status}</td></tr>
              ))}</tbody></table>
          </div>
          <div className="card">
            <h2 style={{marginTop:0}}>🗺️ Peta Tindak Lanjut</h2>
            {Object.entries(rep.actions).map(([k, rows]) => rows.length > 0 && (
              <div key={k} style={{marginBottom:14}}>
                <span className="pill" style={{background: rep.action_color?.[k] || "#344A61"}}>
                  {({konseling:"Prioritas Konseling + Training", training:"Prioritas Training",
                     pantau:"Pantau + Asesmen Berkala", pertahankan:"Pertahankan"})[k]}
                </span>
                <ul style={{margin:"8px 0 0 18px"}}>
                  {rows.map(r => <li key={r.dim}><b>{r.label}</b> — {r.rekomendasi}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 style={{marginTop:0}}>🎓 Riwayat Ujian</h2>
            {exam.length === 0 ? <p className="muted">Belum ada percobaan ujian.</p> : (
              <table><thead><tr><th>Nama</th><th>Email</th><th>Paket</th><th>Benar</th><th>Nilai</th><th>Status</th><th>Aksi</th></tr></thead>
              <tbody>{exam.map(a => (
                <tr key={a.id}><td>{a.full_name}</td><td>{a.email}</td><td>{a.package}</td>
                  <td>{a.correct}</td><td>{a.score}</td>
                  <td>{a.passed ? "✅ Lulus" : "❌ Belum"}</td>
                  <td>{a.passed && <button className="btn ghost" style={{padding:"5px 10px", fontSize:12.5}}
                    onClick={() => email("certificate", a.id)}>📧 Sertifikat</button>}</td></tr>
              ))}</tbody></table>
            )}
          </div>
        </>
      )}
    </>
  );
}
