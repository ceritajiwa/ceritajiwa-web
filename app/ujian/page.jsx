"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import Gate from "../../components/Gate";

export default function Ujian() {
  const [pkgs, setPkgs] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [tid, setTid] = useState("");
  const [ok, setOk] = useState(false); const [code, setCode] = useState("");
  const [pkg, setPkg] = useState("");
  const [err, setErr] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => {
    Promise.all([api("/api/exam/packages"), api("/api/trainings")])
      .then(([p, ts]) => { setPkgs(p); setTrainings(ts); if (ts[0]) setTid(ts[0].id);
        if (Object.keys(p).length) setPkg(Object.keys(p)[0]); })
      .catch(e => setErr(e.message));
  }, []);
  const training = trainings.find(x => x.id === tid);
  if (err) return <div className="card">⚠️ {err}</div>;
  if (!pkgs) return <div className="card muted">Memuat…</div>;
  const P = pkgs[pkg];
  if (!P) return <div className="card">Paket ujian tidak ditemukan.</div>;
  if (!ok && training && training.access_code)
    return <Gate title="🎓 Ujian Sertifikasi" subtitle={training.name} trainingId={tid}
             onUnlock={c => { setCode(c); setOk(true); }} />;
  const questions = P.questions;
  const answered = Object.keys(answers).length;
  return (
    <>
      <div className="card">
        <h1>🎓 Ujian Sertifikasi {training ? "— " + training.name : ""}</h1>
        <label>Perusahaan / Training</label>
        <select value={tid} onChange={e => { setTid(e.target.value); setAnswers({}); setResult(null); setOk(false); }}>
          {trainings.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="grid2" style={{marginTop:10}}>
          <div><label>Paket ujian</label>
            <select value={pkg} onChange={e => { setPkg(e.target.value); setAnswers({}); setResult(null); }}>
              {Object.entries(pkgs).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
            </select></div>
          <div className="muted" style={{alignSelf:"end"}}>40 soal • kelulusan minimal {P.passing} • boleh mengulang</div>
        </div>
      </div>
      {result ? (
        <div className="card center">
          <div className="scorebig">{result.score}</div>
          <p>Benar {result.correct}/40 — <b style={{color: result.passed ? "var(--ok)" : "var(--danger)"}}>{result.passed ? "✅ LULUS" : "❌ BELUM LULUS"}</b></p>
          <div style={{marginTop:14, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap"}}>
            <button className="btn" onClick={() => { setAnswers({}); setResult(null); }}>🔁 Ulangi Ujian</button>
            <a className="btn ghost" href="/ujian" style={{textDecoration:"none"}}>Selesai</a>
          </div>
        </div>
      ) : (
        <>
          <div className="card grid2">
            <div><label>Nama lengkap</label><input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <div className="progress"><div style={{width:`${answered/40*100}%`}} /></div>
          <p className="muted">Terjawab: {answered}/40</p>
          {Object.entries(P.sessions).sort((a,b)=>Number(a[0])-Number(b[0])).map(([s, title]) => {
            const qs = questions.filter(q => q.session === Number(s));
            return (
              <details key={s} open={Number(s) === 1}>
                <summary>{title} ({qs.length} soal)</summary>
                <div className="body">
                  {qs.map(q => (
                    <label key={q.n} className={`q ${answers[q.n] !== undefined ? "sel" : ""}`}>
                      <span className="txt"><b>{q.n}.</b> {q.q}</span>
                      <div className="opts">
                        {q.opts.map((o, i) => (
                          <span key={i} className={answers[q.n] === i ? "on" : ""}
                            onClick={e => { e.preventDefault(); setAnswers(p => ({...p, [q.n]: i})); }}>
                            {String.fromCharCode(65+i)}. {o}
                          </span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </details>
            );
          })}
          <button className="btn" style={{width:"100%"}}
            disabled={answered < 40 || !name.trim() || !email.trim()}
            onClick={async () => {
              try {
                const r = await api("/api/exam/submit", { method: "POST", body: {
                  training_id: tid, package: pkg, name, email, access_code: code, answers } });
                setResult(r); window.scrollTo(0,0);
              } catch (e) { alert(e.message); }
            }}>
            {answered < 40 ? `Jawab dulu ${40-answered} soal sisanya` : "✅ Kumpulkan Jawaban"}
          </button>
        </>
      )}
    </>
  );
}
