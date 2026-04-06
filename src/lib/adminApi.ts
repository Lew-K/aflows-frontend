const API_BASE = "https://n8n.aflows.uk/webhook";

const getToken = () => localStorage.getItem("admin_token");

const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {

  if (!res.ok) {

    let message = "Request failed";

    try {
      const text = await res.text();
      if (text) message = text;
    } catch {}

    throw new Error(message);
  }

  return res.json();
};

const request = async (
  path: string,
  options: RequestInit = {}
) => {

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  });

  return handleResponse(res);
};

export const adminApi = {

  login: (email: string, password: string) =>
    request("/admin-login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  getBusinesses: () =>
    request("/api/admin/businesses"),

  impersonate: (business_id: string) =>
    request("/api/admin/impersonate", {
      method: "POST",
      body: JSON.stringify({ business_id })
    }),

  deactivateBusiness: (business_id: string, admin_password: string) =>
    request("/admin/deactivate-business", {
      method: "POST",
      body: JSON.stringify({ business_id, admin_password })
    }),

  activateBusiness: (business_id: string, admin_password: string) =>
    request("/admin/activate-business", {
      method: "POST",
      body: JSON.stringify({ business_id, admin_password })
    }),

  deleteBusiness: (business_id: string, admin_password: string) =>
    request("/admin/delete-business", {
      method: "POST",
      body: JSON.stringify({ business_id, admin_password })
    }),
  resetPassword: (business_id: string, new_password: string, admin_password: string) =>
  request("/admin/reset-password", {
    method: "POST",
    body: JSON.stringify({ business_id, new_password, admin_password })
  }),

  getReceipts: (businessId: string) =>
    request(`/dace6a4c-1876-47cd-9af0-138dc1103cf4/api/admin/business/${businessId}/receipts`),

  getActivity: () =>
    request("/api/admin/activity"),

  inspectTable: (businessId: string, table: string) =>
    request(`/8a2034b6-f8da-4198-a960-793384631e4c/api/admin/db/${businessId}/${table}`)
};
