"use client";
export default function Radar({ data, size = 340, title }) {
  const keys = Object.keys(data || {});
  if (!keys.length) return null;
  const vals = keys.map((k) => Math.max(0, Math.min(100, Number(data[k]) || 0)));
  const cx = size / 2, cy = size / 2, R = size / 2 - 52, N = keys.length;
  const pt = (i, r) => {
    const a = (2 * Math.PI * i) / N - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = [0.25, 0.5, 0.75, 1].map((f) =>
    Array.from({ length: N }, (_, i) => pt(i, R * f).join(",")).join(" "));
  const poly = vals.map((v, i) => pt(i, (R * v) / 100).join(",")).join(" ");
  return (
    <div className="center">
      <svg width={size} height={size} role="img" aria-label={title || "radar"}>
        {ring.map((p, i) => <polygon key={i} points={p} fill="none" stroke="#D9DBDC" />)}
        {keys.map((k, i) => {
          const [x, y] = pt(i, R);
          const [lx, ly] = pt(i, R + 26);
          return (
            <g key={k}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="#D9DBDC" />
              <text x={lx} y={ly} fontSize="11.5" fill="#344A61" textAnchor="middle" fontWeight="600">{k}</text>
              <text x={pt(i, (R * vals[i]) / 100)[0]} y={pt(i, (R * vals[i]) / 100)[1] - 7}
                    fontSize="12" fill="#344A61" textAnchor="middle" fontWeight="800">{vals[i]}</text>
            </g>
          );
        })}
        <polygon points={poly} fill="rgba(111,194,180,.30)" stroke="#344A61" strokeWidth="2" />
      </svg>
      <div className="muted">{title}</div>
    </div>
  );
}
