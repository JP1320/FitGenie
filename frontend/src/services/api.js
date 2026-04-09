const API = import.meta.env.VITE_API_BASE_URL || "https://fitgenie-26il.onrender.com";

export async function callApi(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}
