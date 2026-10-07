const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function api(path, { method = "GET", body, auth } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { authorization: auth } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return data;
}
export const getToken = (role) => (typeof window !== "undefined" ? localStorage.getItem("cj_token_" + role) : null);
export const setToken = (role, t) => localStorage.setItem("cj_token_" + role, t);

export async function downloadFile(path, auth, filename) {
  const res = await fetch(BASE + path, { headers: { authorization: auth } });
  if (!res.ok) throw new Error("Download gagal");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
