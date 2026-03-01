let refreshPromise: Promise<string | null> | null = null;

const REFRESH_URL = "https://n8n.aflows.uk/webhook/refresh-token";

export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {}
) => {
  const makeRequest = async (token?: string | null) => {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Only set Content-Type if NOT sending FormData
    if (!(init.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(input, {
      ...init,
      headers,
    });
  };

  const accessToken = localStorage.getItem("access_token");
  let response = await makeRequest(accessToken);

  // If NOT 401 → return normally
  if (response.status !== 401) {
    return response;
  }

  // If already refreshing → wait
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken();
  }

  const newAccessToken = await refreshPromise;

  // Reset after fully resolved
  refreshPromise = null;

  if (!newAccessToken) {
    forceLogout();
    throw new Error("Session expired");
  }

  // Retry original request
  const retryResponse = await makeRequest(newAccessToken);

  return retryResponse;
};

function forceLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("aflows_user");
  window.location.assign("/login?reason=session-expired");
}

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

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.access_token || !data.refresh_token) {
      return null;
    }

    // ROTATION: overwrite BOTH tokens
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    return data.access_token;
  } catch {
    return null;
  }
}
