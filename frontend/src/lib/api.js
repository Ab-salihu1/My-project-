// Thin fetch wrapper: attaches the access token, and on a 401 tries a single
// silent refresh (via the httpOnly cookie) before retrying the request once.
// This is what keeps a student's session alive without re-typing a password
// every 15 minutes, while the refresh token itself stays out of reach of JS.

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

async function rawRequest(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
    credentials: "include", // sends the refresh cookie
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

async function tryRefresh() {
  const { ok, body } = await rawRequest("/api/auth/refresh", { method: "POST" });
  if (ok) {
    setAccessToken(body.data.accessToken);
    return true;
  }
  setAccessToken(null);
  return false;
}

export async function apiRequest(path, options = {}) {
  let result = await rawRequest(path, options);

  if (result.status === 401 && path !== "/api/auth/refresh") {
    const refreshed = await tryRefresh();
    if (refreshed) {
      result = await rawRequest(path, options);
    }
  }

  if (!result.ok) {
    const message = result.body?.error?.message || "Something went wrong.";
    const err = new Error(message);
    err.code = result.body?.error?.code;
    err.status = result.status;
    throw err;
  }
  return result.body.data;
}

export const api = {
  login: (email, password) => apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  logout: () => apiRequest("/api/auth/logout", { method: "POST" }),
  register: (payload) => apiRequest("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),

  myResults: (semesterId) => apiRequest(`/api/results/me${semesterId ? `?semesterId=${semesterId}` : ""}`),
  resultsByMatric: (matricNo) => apiRequest(`/api/results/student/${encodeURIComponent(matricNo)}`),
  searchStudents: (q) => apiRequest(`/api/results/students/search?q=${encodeURIComponent(q)}`),
  publishResult: (payload) => apiRequest("/api/results", { method: "POST", body: JSON.stringify(payload) }),

  courses: () => apiRequest("/api/courses"),
  semesters: () => apiRequest("/api/semesters"),
};
