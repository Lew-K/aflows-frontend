const API_BASE = "https://n8n.aflows.uk/webhook";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("admin_token")}`
});

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  return res.json();
};

export const adminApi = {

  login: async (email: string, password: string) => {

    const res = await fetch(`${API_BASE}/admin-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    return handleResponse(res);
  },

  getBusinesses: async () => {

    const res = await fetch(`${API_BASE}/api/admin/businesses`, {
      headers: getAuthHeaders()
    });

    return handleResponse(res);
  },

  impersonate: async (business_id: string) => {

    const res = await fetch(`${API_BASE}/api/admin/impersonate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_id })
    });

    return handleResponse(res);
  },

  deactivateBusiness: async (business_id: string) => {

    const res = await fetch(`${API_BASE}/admin/deactivate-business`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_id })
    });

    return handleResponse(res);
  },

  activateBusiness: async (business_id: string) => {

    const res = await fetch(`${API_BASE}/admin/activate-business`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_id })
    });

    return handleResponse(res);
  },

  deleteBusiness: async (business_id: string, admin_password: string) => {

    const res = await fetch(`${API_BASE}/admin/delete-business`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ business_id, admin_password })
    });

    return handleResponse(res);
  },

  getReceipts: async (businessId: string) => {

    const res = await fetch(
      `${API_BASE}/dace6a4c-1876-47cd-9af0-138dc1103cf4/api/admin/business/${businessId}/receipts`,
      { headers: getAuthHeaders() }
    );

    return handleResponse(res);
  },

  getActivity: async () => {

    const res = await fetch(`${API_BASE}/api/admin/activity`, {
      headers: getAuthHeaders()
    });

    return handleResponse(res);
  },

  inspectTable: async (businessId: string, table: string) => {

    const res = await fetch(
      `${API_BASE}/8a2034b6-f8da-4198-a960-793384631e4c/api/admin/db/${businessId}/${table}`,
      { headers: getAuthHeaders() }
    );

    return handleResponse(res);
  }
};
