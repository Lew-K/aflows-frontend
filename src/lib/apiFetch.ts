let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

const REFRESH_URL = "https://n8n.aflows.uk/webhook/refresh-token";

export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {}
) => {
  const accessToken = localStorage.getItem("access_token");

  const headers = {
    ...(init.headers || {}),
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    "Content-Type": "application/json",
  };

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  // If access expired → try refresh
  if (!isRefreshing) {
    isRefreshing = true;

    refreshPromise = refreshAccessToken();
  }

  const newAccessToken = await refreshPromise;
  isRefreshing = false;

  if (!newAccessToken) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("aflows_user");
  
    window.location.href = "/login?reason=session-expired";
  
    throw new Error("Session expired");
  }

  // Retry original request with new token
  const retryResponse = await fetch(input, {
    ...init,
    const headers = {
      ...(init.headers || {}),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      // Authorization: `Bearer ${newAccessToken}`,
      // "Content-Type": "application/json",
    },
  });

  return retryResponse;
};

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token");
  const userRaw = localStorage.getItem("aflows_user");

  if (!refreshToken || !userRaw) return null;

  const user = JSON.parse(userRaw);

  try {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refresh_token: refreshToken,
        email: user.email,
      }),
    });

    if (response.status === 400) {
      return null;
    }

    const data = await response.json();

    // ROTATION: overwrite BOTH tokens
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data.access_token;
  } catch {
    return null;
  }
}
