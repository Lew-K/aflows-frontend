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

  // Only 401 means "your token is invalid/expired" — refresh and retry.
  // 403 means "you're authenticated but not allowed" — never logout for this.
  if (response.status !== 401) {
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


// const REFRESH_URL = "https://api.aflows.uk/api/v1/auth/refresh";

// let refreshPromise: Promise<boolean> | null = null;

// export const apiFetch = async (
//   input: RequestInfo,
//   init: RequestInit = {}
// ) => {
//   const makeRequest = async () => {
//     const headers: Record<string, string> = {
//       ...(init.headers as Record<string, string> || {}),
//     };
//     if (!(init.body instanceof FormData)) {
//       headers["Content-Type"] = "application/json";
//     }
//     return fetch(input, {
//       ...init,
//       headers,
//       credentials: "include",
//     });
//   };

//   let response = await makeRequest();

//   // If not auth error → return
//   if (![401, 403].includes(response.status)) {
//     return response;
//   }

//   if (!refreshPromise) {
//     refreshPromise = refreshAccessToken();
//   }
//   const refreshed = await refreshPromise;
//   refreshPromise = null;

//   if (!refreshed) {
//     forceLogout();
//     throw new Error("Session expired");
//   }

//   return makeRequest();
// };

// function forceLogout() {
//   localStorage.removeItem("aflows_user");
//   window.location.replace("/login?reason=session-expired");
// }

// async function refreshAccessToken(): Promise<boolean> {
//   try {
//     const response = await fetch(REFRESH_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       credentials: "include",
//     });

//     if (!response.ok) {
//       return false;
//     }

//     const data = await response.json();
//     return !!data.success;
//   } catch {
//     return false;
//   }
// }
