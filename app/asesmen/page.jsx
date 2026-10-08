"use client";
import { useEffect, useState, useMemo } from "react";
import { api } from "../../lib/api";
import Radar from "../../components/Radar";
import Gate from "../../components/Gate";

export default function Asesmen() {
  const [cat, setCat] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [tid, setTid] = useState("");
  const [ok, setOk] = useState(false); const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [dept, setDept] = useState(""); const [level, setLevel] = useState("Individual Contributor / Staff");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => {
    Promise.all([api("/api/catalog"), api("/api/trainings")])
      .then(([c, ts]) => { setCat(c); setTrainings(ts); if (ts[0]) setTid(ts[0].id); })
      .catch(e => setErr(e.message));
  }, []);
  const training = trainings.find(x => x.id === tid);
  const insts = useMemo(() => {
    if (!cat || !training) return [];
    return cat.instruments.filter(i => (training.enabled || []).includes(i.key));
  }, [cat, training]);
  const total = insts.reduce((a, i) => a + i.items.length, 0);
  const answered = Object.keys(answers).length;
  if (err) return <div className="card">⚠️ {err}</div>;
  if (!cat) return <div className="card muted">Memuat…</div>;
  if (!training) return <div className="card">Belum ada training.</div>;
  if (!ok && training.access_code)
    return <Gate title="📝 Asesmen" subtitle={training.name} trainingId={tid} onUnlock={c => { setCode(c); setOk(true); }} />;
  if (result) return <Hasil result={result} training={training} />;
  const setA = (k, n, v) => setAnswers(p => ({ ...p, [`${k}:${n}`]: v }));
  return (
    <>
      <div className="card">
        <h1>📝 Asesmen</h1>
        <label>Perusahaan / Training</label>
        <select value={tid} onChange={e => { setTid(e.target.value); setAnswers({}); setResult(null); setOk(false); }}>
          {trainings.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <p className="muted" style={{marginTop:10}}>{training.name} • {insts.length} asesmen • {total} pernyataan • jawaban tersimpan otomatis saat dipilih</p>
        <div className="grid2">
          <div><label>Nama lengkap</label><input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label>Departemen</label><input value={dept} onChange={e => setDept(e.target.value)} /></div>
          <div><label>Level jabatan</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option>Individual Contributor / Staff</option><option>Supervisor / Team Lead</option>
              <option>Manager ke atas</option><option>Lainnya</option>
            </select></div>
        </div>
      </div>
      <div className="progress"><div style={{width: `${total ? (answered/total*100) : 0}%`}} /></div>
      <p className="muted">Terjawab: {answered}/{total}</p>
      {insts.map((inst, ix) => (
        <details key={inst.key} open={ix === 0}>
          <summary>{inst.name} ({inst.items.length} pernyataan)</summary>
          <div className="body">
            <p className="muted" style={{marginBottom:12}}>{inst.intro}</p>
            {inst.items.map(it => (
              <label key={it.n} className={`q ${answers[`${inst.key}:${it.n}`] !== undefined ? "sel" : ""}`}>
                <span className="txt"><b>{it.n}.</b> {it.text || "Pilih jawaban yang tepat:"}</span>
                {it.img && <img src={it.img} alt="soal" style={{maxWidth:420, width:"100%", marginBottom:10}} />}
                <div className="opts">
                  {(inst.mcq ? it.opts.map((o, i) => [i, o]) : inst.scale).map(([v, lbl]) => (
                    <span key={v} className={answers[`${inst.key}:${it.n}`] === v ? "on" : ""}
                      onClick={e => { e.preventDefault(); setA(inst.key, it.n, v); }}>{lbl}</span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </details>
      ))}
      <button className="btn" style={{width:"100%", marginTop:8}}
        disabled={answered < total || !name.trim() || !email.trim()}
        onClick={async () => {
          try {
            const r = await api("/api/assessment/submit", { method: "POST", body: {
              training_id: tid, name, email, department: dept, job_level: level, access_code: code, answers } });
            setResult(r); window.scrollTo(0, 0);
          } catch (e) { alert(e.message); }
        }}>
        {answered < total ? `Jawab dulu ${total - answered} pernyataan sisanya` : "✅ Kirim & Lihat Hasil"}
      </button>
    </>
  );
}

function Hasil({ result, training }) {
  return (
    <>
      <div className="card center">
        <h1>Hasil Asesmen Anda</h1>
        <p className="muted">{training.name}</p>
      </div>
      <div className="card">
        <Radar data={result.scores || {}} title="Profil Anda (makin tinggi = makin sehat)" />
      </div>
      <div className="card">
        <h2 style={{marginTop:0}}>Penjelasan per Tes</h2>
        {(result.groups || []).map(([key, title, plain, rows]) => (
          <details key={key}>
            <summary>{title}</summary>
            <div className="body">
              <p className="muted" style={{marginBottom:10}}>{plain}</p>
              {rows.map(([label, b, text]) => <p key={label} style={{marginBottom:10}}><b>{label}</b> — {text}</p>)}
            </div>
          </details>
        ))}
      </div>
      <a className="btn ghost" href="/asesmen" style={{textDecoration:"none", display:"inline-block"}}>← Asesmen baru</a>
    </>
  );
}
