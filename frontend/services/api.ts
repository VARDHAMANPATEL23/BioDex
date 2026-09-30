import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(email: string, pass: string) {
  const res = await axios.post(`${API_BASE}/auth/login`, { email, password: pass });
  return res.data;
}

export async function registerUser(email: string, pass: string) {
  const res = await axios.post(`${API_BASE}/auth/register`, { email, password: pass });
  return res.data;
}

export async function saveToHistory(prediction: any, imageUri?: string) {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  const res = await axios.post(
    `${API_BASE}/history/`,
    { image_uri: imageUri, prediction },
    { headers }
  );
  return res.data;
}

export async function getHistory() {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  const res = await axios.get(`${API_BASE}/history/`, { headers });
  return res.data;
}

export async function predictFromUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const res = await axios.post(`${API_BASE}/predict/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function predictFromURL(url: string) {
  const res = await axios.post(`${API_BASE}/predict/url`, { url });
  return res.data;
}
