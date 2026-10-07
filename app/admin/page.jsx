"use client";
import { useEffect, useState } from "react";
import { api, getToken, setToken } from "../../lib/api";
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
  const [err, setErr] = useState("");
  useEffect(() => { api("/api/trainings").then(ts => { setTrainings(ts); if (ts[0]) setTid(ts[0].id); }); }, []);
  async function load(t) {
    setErr("");
    try {
      const r = await api(`/api/report/company/${t}`, { auth: token });
      setRep(r.empty ? null : r);
      setExam(await api(`/api/admin/exam/${t}`, { auth: token }));
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
            <table><thead><tr><th>Dimensi</th><th>Rata2</th><th>Target</th><th>Status</th></tr></thead>
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
              <table><thead><tr><th>Nama</th><th>Email</th><th>Paket</th><th>Benar</th><th>Nilai</th><th>Status</th></tr></thead>
              <tbody>{exam.map(a => (
                <tr key={a.id}><td>{a.full_name}</td><td>{a.email}</td><td>{a.package}</td>
                  <td>{a.correct}</td><td>{a.score}</td>
                  <td>{a.passed ? "✅ Lulus" : "❌ Belum"}</td></tr>
              ))}</tbody></table>
            )}
          </div>
        </>
      )}
    </>
  );
}
