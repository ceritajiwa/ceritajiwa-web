"use client";
import { useEffect, useState } from "react";
import { api } from "../lib/api";

const MODULES = [
  { href: "/asesmen", icon: "📝", title: "Asesmen EQ & Kondisi Karyawan",
    desc: "31 instrumen psikologis teruji: stres, burnout, engagement, kepribadian, budaya, sales, kesehatan mental, dan lainnya — dikelompokkan per perusahaan.",
    ready: true },
  { href: "/ujian", icon: "🎓", title: "Ujian Sertifikasi",
    desc: "Paket ujian pilihan ganda berbasis studi kasus (CERC, CBT+Counseling, dan berikutnya). Nilai langsung, pengulangan soal yang salah, riwayat lengkap.",
    ready: true },
  { href: "/bei", icon: "👨‍⚕️", title: "Sesi Konseling Trainer (BEI)",
    desc: "Konselor mencatat sesi dengan panduan 10 pertanyaan; AI menyusun laporan terstruktur dengan radar aspek, siap diunduh sebagai PDF.",
    ready: true },
  { href: "/admin", icon: "🔐", title: "Dashboard Admin & Report",
    desc: "Kelola perusahaan & kombinasi asesmen, lihat kristalisasi budaya, klasterisasi karyawan, gap analysis, kirim hasil & sertifikat via email.",
    ready: true },
  { href: "#", icon: "📚", title: "LMS - Modul Pembelajaran",
    desc: "Materi training interaktif, progress belajar peserta, dan kuis per modul. Segera hadir.", ready: false },
  { href: "#", icon: "💳", title: "Pembayaran & Invoice",
    desc: "Penawaran, invoice, dan status pembayaran per perusahaan. Segera hadir.", ready: false },
  { href: "#", icon: "🏅", title: "Sertifikat & Badge Otomatis",
    desc: "Sertifikat PDF dan badge LinkedIn terkirim otomatis ke email peserta yang lulus. Segera hadir.", ready: false },
];

export default function Home() {
  const [n, setN] = useState({ t: 0, r: 0 });
  useEffect(() => {
    api("/api/trainings").then(ts => setN({ t: ts.length, r: ts.reduce((a, t) => a + (t.n_respondents || 0), 0) })).catch(() => {});
  }, []);
  return (
    <>
      <div className="card" style={{background:"var(--navy)", color:"#fff", border:"none"}}>
        <h1 style={{color:"#fff"}}>Platform Cerita Jiwa</h1>
        <p style={{color:"#D9DBDC", maxWidth:640}}>
          Satu pintu untuk seluruh layanan Cerita Jiwa Training Center — asesmen psikologis,
          ujian sertifikasi, sesi konseling, hingga (segera) LMS, pembayaran, dan sertifikat digital.
        </p>
        <div style={{marginTop:10}}>
          <span className="badge" style={{background:"rgba(255,255,255,.14)", color:"#fff"}}>{n.t} perusahaan aktif</span>
        </div>
      </div>
      <div className="grid2">
        {MODULES.map(m => (
          <a key={m.title} href={m.href} style={{textDecoration:"none", color:"inherit"}}>
            <div className="card" style={{height:"100%", opacity: m.ready ? 1 : 0.75}}>
              <div style={{fontSize:26}}>{m.icon}</div>
              <h2 style={{marginTop:6}}>{m.title} {!m.ready && <span className="pill" style={{background:"var(--light)", color:"var(--grey)"}}>segera</span>}</h2>
              <p className="muted">{m.desc}</p>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
