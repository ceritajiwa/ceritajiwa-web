"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";

export default function Page() {
  return <Suspense fallback={<div className="card muted">Memuat…</div>}><UjianInner /></Suspense>;
}

function UjianInner() {
  const sp = useSearchParams();
  const tid = sp.get("t");
  const [pkgs, setPkgs] = useState(null); const [err, setErr] = useState("");
  const [pkg, setPkg] = useState(""); const [training, setTraining] = useState(null);
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => {
    Promise.all([api("/api/exam/packages"), api("/api/trainings")])
      .then(([p, ts]) => { setPkgs(p); setTraining(ts.find(x => x.id === tid)); if (Object.keys(p).length) setPkg(Object.keys(p)[0]); })
      .catch(e => setErr(e.message));
  }, [tid]);
  if (err) return <div className="card">⚠️ {err}</div>;
  if (!pkgs) return <div className="card muted">Memuat…</div>;
  const P = pkgs[pkg];
  if (!P) return <div className="card">Paket ujian tidak ditemukan.</div>;
  const questions = P.questions;
  const answered = Object.keys(answers).length;
  const retry = result && !result.passed;
  return (
    <>
      <div className="card">
        <h1>🎓 Ujian Sertifikasi {training ? "— " + training.name : ""}</h1>
        <p className="muted">40 soal • kelulusan minimal {P.passing} • boleh mengulang</p>
        <label>Paket ujian</label>
        <select value={pkg} onChange={e => { setPkg(e.target.value); setAnswers({}); setResult(null); }}>
          {Object.entries(pkgs).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
        </select>
      </div>
      {result ? (
        <div className="card center">
          <div className="scorebig">{result.score}</div>
          <p>Benar {result.correct}/40 — <b style={{color: result.passed ? "var(--ok)" : "var(--danger)"}}>{result.passed ? "✅ LULUS" : "❌ BELUM LULUS"}</b></p>
          <div style={{marginTop:14, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap"}}>
            <button className="btn" onClick={() => { setAnswers({}); setResult(null); }}>🔁 Ulangi Ujian</button>
            <a className="btn ghost" href="/" style={{textDecoration:"none"}}>Selesai</a>
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
                  training_id: tid, package: pkg, name, email, answers } });
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
