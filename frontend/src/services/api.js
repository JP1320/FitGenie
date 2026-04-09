const API = import.meta.env.VITE_API_BASE_URL || "https://fitgenie-26il.onrender.com";

export async function callApi(path, method = "GET", body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { message: "Non-JSON response from server" };
  }

  return { ok: res.ok, status: res.status, data };
}
