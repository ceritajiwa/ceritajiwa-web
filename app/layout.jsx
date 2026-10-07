import "./globals.css";
export const metadata = { title: "Asesmen & Ujian | Cerita Jiwa", description: "Platform asesmen EQ, ujian sertifikasi, dan sesi konseling Cerita Jiwa Training Center" };
export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/mx/../favicon.png" />
      </head>
      <body>
        <div className="header">
          <img src="/logo-white.png" alt="Cerita Jiwa" />
          <div>
            <div style={{color:"#fff", fontWeight:700, fontSize:17}}>Asesmen & Ujian Sertifikasi</div>
            <div className="tag">Cerita Jiwa Training Center</div>
          </div>
        </div>
        <div className="wrap">{children}</div>
      </body>
    </html>
  );
}
