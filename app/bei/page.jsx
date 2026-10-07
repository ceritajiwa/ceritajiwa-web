"use client";
import { useEffect, useState } from "react";
import { api, getToken, setToken, downloadFile } from "../../lib/api";
import Radar from "../../components/Radar";

const FIELDS = [["domain","Domain Utama"],["kekuatan","Kekuatan"],["area_rawan","Area Perhatian"],
  ["pemicu","Pemicu"],["risiko","Risiko"],["prioritas","Prioritas (1-5)"],
  ["rekomendasi_peserta","Rekomendasi Peserta"],["rekomendasi_perusahaan","Rekomendasi Perusahaan"],
  ["ringkasan","Ringkasan"]];

export default function BeiPage() {
  const [token, setT] = useState(null);
  const [pwd, setPwd] = useState("");
  const [trainings, setTrainings] = useState([]);
  const [tid, setTid] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [resps, setResps] = useState([]);
  const [pname, setPname] = useState(""); const [counselor, setCounselor] = useState("");
  const [narr, setNarr] = useState({}); const [loadedId, setLoadedId] = useState(null);
  const [last, setLast] = useState(null); const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState([]);

  async function loadSessions(t) {
    setSessions(await api(`/api/bei/${t}`, { auth: token }));
  }
  useEffect(() => {
    if (getToken("trainer")) setT(getToken("trainer"));
    api("/api/catalog").then(c => setPrompts(c.bei_prompts));
    api("/api/trainings").then(ts => { setTrainings(ts); if (ts[0]) { setTid(ts[0].id); if (getToken("trainer")) loadSessions(ts[0].id); } });
  }, []);
  useEffect(() => { if (token && tid) loadSessions(tid); }, [token, tid]);
  useEffect(() => {
    if (tid) api(`/api/admin/respondents/${tid}`).then(setResps).catch(() => {});
  }, [tid, token]);

  if (!token) return (
    <div className="card" style={{maxWidth:420, margin:"40px auto"}}>
      <h1>👨‍⚕️ Menu Trainer (BEI)</h1>
      <label>Password trainer</label>
      <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} />
      <button className="btn" style={{marginTop:14, width:"100%"}} onClick={async () => {
        try { const r = await api("/api/login", { method:"POST", body:{password: pwd, role:"trainer"} });
          setToken("trainer", r.token); setT(r.token); } catch (e) { alert(e.message); }
      }}>Masuk</button>
    </div>
  );

  const stc = last?.structured;
  return (
    <>
      <div className="card">
        <h1>👨‍⚕️ Sesi Konseling (BEI)</h1>
        <label>Perusahaan / Training</label>
        <select value={tid} onChange={e => { setTid(e.target.value); setLoadedId(null); setLast(null); }}>
          {trainings.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="grid2" style={{marginTop:10}}>
          <div><label>Peserta (ketik atau pilih)</label>
            <input list="resp-list" value={pname} onChange={e => setPname(e.target.value)} />
            <datalist id="resp-list">{resps.map(r => <option key={r.id} value={r.full_name} />)}</datalist>
          </div>
          <div><label>Konselor / Trainer</label>
            <input value={counselor} onChange={e => setCounselor(e.target.value)} /></div>
        </div>
      </div>
      <div className="card">
        <h2 style={{marginTop:0}}>Panduan Pertanyaan</h2>
        {prompts.map(p => (
          <div key={p.k} style={{marginBottom:12}}>
            <b style={{color:"var(--navy)"}}>{p.title}</b>
            <div className="muted" style={{fontSize:12.5, margin:"2px 0 4px"}}>{p.hint}</div>
            <textarea rows={3} value={narr[p.k] || ""} onChange={e => setNarr(x => ({...x, [p.k]: e.target.value}))} />
          </div>
        ))}
        <button className="btn" style={{width:"100%"}} disabled={busy || !pname.trim() || !counselor.trim()}
          onClick={async () => {
            setBusy(true);
            try {
              const r = await api("/api/bei/save", { method:"POST", auth: token, body: {
                training_id: tid, participant_name: pname, counselor_name: counselor,
                narratives: narr, session_id: loadedId } });
              setLast({ structured: r.structured });
              setLoadedId(null); loadSessions(tid);
              window.scrollTo({top: document.getElementById("hasil-bei")?.offsetTop || 0, behavior:"smooth"});
            } catch (e) { alert(e.message); } finally { setBusy(false); }
          }}>{busy ? "Menyimpan & memproses AI… (bisa 10-30 detik)" : "💾 Simpan & Proses dengan AI"}</button>
      </div>
      {last && (
        <div className="card" id="hasil-bei">
          <h2 style={{marginTop:0}}>📋 Hasil Terstruktur</h2>
          {stc?._error ? (
            <p style={{color:"var(--danger)"}}>⚠️ {stc._error}</p>
          ) : (
            <>
              {stc?.skor_visual && <Radar data={stc.skor_visual} title="Estimasi aspek dari AI" />}
              <table><tbody>
                {FIELDS.map(([k, label]) => (
                  <tr key={k}><td style={{width:190, fontWeight:600}}>{label}</td><td>{stc?.[k] || "-"}</td></tr>
                ))}
              </tbody></table>
            </>
          )}
        </div>
      )}
      <div className="card">
        <h2 style={{marginTop:0}}>📚 Riwayat Sesi</h2>
        {sessions.length === 0 ? <p className="muted">Belum ada sesi.</p> :
          sessions.map(s => (
            <details key={s.id}>
              <summary><b>{s.participant_name}</b> — {s.counselor_name} ({String(s.created_at).slice(0,10)})</summary>
              <div className="body">
                {s.structured?.skor_visual && <Radar data={s.structured.skor_visual} size={300} />}
                <table><tbody>
                  {FIELDS.map(([k, label]) => (
                    <tr key={k}><td style={{width:190, fontWeight:600}}>{label}</td><td>{s.structured?.[k] || "-"}</td></tr>
                  ))}
                </tbody></table>
                <div style={{marginTop:10, display:"flex", gap:8, flexWrap:"wrap"}}>
                  <button className="btn ghost" onClick={() => downloadFile(`/api/bei/pdf/${s.id}`, token, `BEI_${s.participant_name}.pdf`)}>⬇️ PDF</button>
                  <button className="btn ghost" onClick={() => {
                    setPname(s.participant_name); setCounselor(s.counselor_name);
                    setNarr(s.narratives || {}); setLoadedId(s.id);
                    window.scrollTo(0,0);
                  }}>✏️ Muat ke Form</button>
                </div>
              </div>
            </details>
          ))}
      </div>
    </>
  );
}
