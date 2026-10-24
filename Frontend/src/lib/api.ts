export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://localhost:5000"; // fallback for dev

export function api(path: string) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}
