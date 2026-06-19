const REFRESH_URL = "https://api.aflows.uk/api/v1/auth/refresh";

let refreshPromise: Promise<boolean> | null = null;

export const apiFetch = async (
  input: RequestInfo,
  init: RequestInit = {}
) => {
  const makeRequest = async () => {
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> || {}),
    };
    if (!(init.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(input, {
      ...init,
      headers,
      credentials: "include",
    });
  };

  let response = await makeRequest();

  // If not auth error → return
  if (![401, 403].includes(response.status)) {
    return response;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken();
  }
  const refreshed = await refreshPromise;
  refreshPromise = null;

  if (!refreshed) {
    forceLogout();
    throw new Error("Session expired");
  }

  return makeRequest();
};

function forceLogout() {
  localStorage.removeItem("aflows_user");
  window.location.replace("/login?reason=session-expired");
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// let refreshPromise: Promise<string | null> | null = null;

// const REFRESH_URL = "https://api.aflows.uk/api/v1/auth/refresh";

// export const apiFetch = async (
//   input: RequestInfo,
//   init: RequestInit = {}
// ) => {
//   const makeRequest = async (token?: string | null) => {
//     const headers: Record<string, string> = {
//       ...(init.headers as Record<string, string> || {}),
//     };

//     if (token) {
//       headers["Authorization"] = `Bearer ${token}`;
//     }

//     if (!(init.body instanceof FormData)) {
//       headers["Content-Type"] = "application/json";
//     }

//     return fetch(input, {
//       ...init,
//       headers,
//     });
//   };

//   const accessToken = localStorage.getItem("access_token");

//   console.log("API request:", input);

//   let response = await makeRequest(accessToken);

//   console.log("Status:", response.status);

//   // If not auth error → return
//   if (![401, 403].includes(response.status)) {
//     return response;
//   }

//   console.log("Access token expired, attempting refresh...");

//   if (!refreshPromise) {
//     refreshPromise = refreshAccessToken();
//   }

//   const newAccessToken = await refreshPromise;

//   refreshPromise = null;

//   if (!newAccessToken) {
//     forceLogout();
//     throw new Error("Session expired");
//   }

//   console.log("Token refreshed, retrying request...");

//   return makeRequest(newAccessToken);
// };

// function forceLogout() {
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("aflows_user");

//   window.location.replace("/login?reason=session-expired");
// }

// async function refreshAccessToken(): Promise<string | null> {
//   const refreshToken = localStorage.getItem("refresh_token");
//   const userRaw = localStorage.getItem("aflows_user");

//   if (!refreshToken || !userRaw) return null;

//   const user = JSON.parse(userRaw);

//   console.log("Refreshing token...");

//   try {
//     const response = await fetch(REFRESH_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         refresh_token: refreshToken,
//         // email: user.email,
//       }),
//     });

//     if (!response.ok) {
//       console.log("Refresh failed:", response.status);
//       return null;
//     }

//     const data = await response.json();

//     if (!data.success) {
//       return null;
//     }

//     if (!data.access_token || !data.refresh_token) {
//       return null;
//     }

//     localStorage.setItem("access_token", data.access_token);
//     localStorage.setItem("refresh_token", data.refresh_token);

//     console.log("Tokens rotated successfully");

//     return data.access_token;

//   } catch (err) {
//     console.log("Refresh error:", err);
//     return null;
//   }
// }
