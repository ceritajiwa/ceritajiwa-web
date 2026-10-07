"use client";
import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import Radar from "../../components/Radar";

export default function Asesmen() {
  const sp = useSearchParams();
  const tid = sp.get("t"); const code = sp.get("code") || "";
  const [cat, setCat] = useState(null); const [training, setTraining] = useState(null);
  const [err, setErr] = useState("");
  const [name, setName] = useState(""); const [email, setEmail] = useState("");
  const [dept, setDept] = useState(""); const [level, setLevel] = useState("Individual Contributor / Staff");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  useEffect(() => {
    Promise.all([api("/api/catalog"), api("/api/trainings")])
      .then(([c, ts]) => { setCat(c); setTraining(ts.find(x => x.id === tid)); })
      .catch(e => setErr(e.message));
  }, [tid]);
  const insts = useMemo(() => {
    if (!cat || !training) return [];
    const en = training.enabled || [];
    return cat.instruments.filter(i => en.includes(i.key));
  }, [cat, training]);
  const total = insts.reduce((a, i) => a + i.items.length, 0);
  const answered = Object.keys(answers).length;
  if (err) return <div className="card">⚠️ {err}</div>;
  if (!cat || !training) return <div className="card muted">Memuat…</div>;
  if (result) return <Hasil result={result} training={training} />;
  const setA = (k, n, v) => setAnswers(p => ({ ...p, [`${k}:${n}`]: v }));
  return (
    <>
      <div className="card">
        <h1>📝 Asesmen — {training.name}</h1>
        <p className="muted">{insts.length} asesmen • {total} pernyataan • jawaban tersimpan otomatis saat kamu memilih</p>
        <div className="grid2">
          <div><label>Nama lengkap</label><input value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label>Departemen</label><input value={dept} onChange={e => setDept(e.target.value)} /></div>
          <div><label>Level jabatan</label>
            <select value={level} onChange={e => setLevel(e.target.value)}>
              <option>Individual Contributor / Staff</option><option>Supervisor / Team Lead</option>
              <option>Manager ke atas</option><option>Lainnya</option>
            </select>
          </div>
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
              <Question key={it.n} inst={inst} it={it} val={answers[`${inst.key}:${it.n}`]}
                onPick={v => setA(inst.key, it.n, v)} />
            ))}
          </div>
        </details>
      ))}
      <button className="btn" style={{width:"100%", marginTop:8}}
        disabled={answered < total || !name.trim() || !email.trim()}
        onClick={async () => {
          try {
            const r = await api("/api/assessment/submit", { method: "POST", body: {
              training_id: tid, name, email, department: dept, job_level: level, answers } });
            setResult(r);
            window.scrollTo(0, 0);
          } catch (e) { alert(e.message); }
        }}>
        {answered < total ? `Jawab dulu ${total - answered} pernyataan sisanya` : "✅ Kirim & Lihat Hasil"}
      </button>
    </>
  );
}

function Question({ inst, it, val, onPick }) {
  const opts = inst.mcq ? it.opts.map((o, i) => [i, o]) : inst.scale;
  return (
    <label className={`q ${val !== undefined ? "sel" : ""}`}>
      <span className="txt"><b>{it.n}.</b> {it.text || "Pilih jawaban yang tepat:"}</span>
      {it.img && <img src={it.img} alt="soal" style={{maxWidth: 420, width: "100%", marginBottom: 10}} />}
      <div className="opts">
        {opts.map(([v, lbl]) => (
          <span key={v} className={val === v ? "on" : ""} onClick={e => { e.preventDefault(); onPick(v); }}>{lbl}</span>
        ))}
      </div>
    </label>
  );
}

function Hasil({ result, training }) {
  const h = (result.scores || {});
  return (
    <>
      <div className="card center">
        <h1>Hasil Asesmen Anda</h1>
        <p className="muted">{training.name}</p>
      </div>
      <div className="card">
        <Radar data={h} title="Profil Anda (skala seragam: makin tinggi = makin sehat)" />
      </div>
      <div className="card">
        <h2 style={{marginTop:0}}>Penjelasan per Tes</h2>
        {(result.groups || []).map(([key, title, plain, rows]) => (
          <details key={key}>
            <summary>{title}</summary>
            <div className="body">
              <p className="muted" style={{marginBottom:10}}>{plain}</p>
              {rows.map(([label, b, text]) => (
                <p key={label} style={{marginBottom:10}}><b>{label}</b> — {text}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
      <a className="btn ghost" href="/" style={{textDecoration:"none", display:"inline-block"}}>← Kembali ke beranda</a>
    </>
  );
}
