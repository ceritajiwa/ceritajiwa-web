"use client";
import "./globals.css";
import { usePathname } from "next/navigation";

const MENU = [
  ["/", "🏠", "Beranda"],
  ["/asesmen", "📝", "Asesmen"],
  ["/ujian", "🎓", "Ujian Sertifikasi"],
  ["/bei", "👨‍⚕️", "Trainer (BEI)"],
  ["/admin", "🔐", "Admin"],
];

export default function RootLayout({ children }) {
  const path = usePathname();
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <aside className="sidebar">
            <img src="/logo-white.png" alt="Cerita Jiwa" />
            <div className="brand-sub">Training Center Platform</div>
            <nav className="nav">
              {MENU.map(([href, icon, label]) => (
                <a key={href} href={href} className={path === href ? "on" : ""}>{icon}<span>{label}</span></a>
              ))}
            </nav>
          </aside>
          <main className="main"><div className="wrap">{children}</div></main>
        </div>
      </body>
    </html>
  );
}
