import axios from "axios";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Safely strip any accidental trailing slashes from Vercel config
const ROOT = API_BASE.replace(/\/$/, "");

function getAuthHeader() {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("user_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function loginUser(email: string, pass: string) {
  const res = await axios.post(`${ROOT}/auth/login`, { email, password: pass });
  return res.data;
}

export async function registerUser(email: string, pass: string) {
  const res = await axios.post(`${ROOT}/auth/register`, { email, password: pass });
  return res.data;
}

export async function saveToHistory(prediction: any, imageUri?: string) {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  const res = await axios.post(
    `${ROOT}/history`,
    { image_uri: imageUri, prediction },
    { headers }
  );
  return res.data;
}

export async function getHistory() {
  const headers = getAuthHeader();
  if (!headers.Authorization) return null;
  const res = await axios.get(`${ROOT}/history`, { headers });
  return res.data;
}

export async function predictFromUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const res = await axios.post(`${ROOT}/predict/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function predictFromURL(url: string) {
  const res = await axios.post(`${ROOT}/predict/url`, { url });
  return res.data;
}
