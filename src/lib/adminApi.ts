const API_BASE = "https://n8n.aflows.uk/webhook";

export const adminApi = {

  login: async (email: string, password: string) => {

    const res = await fetch(`${API_BASE}/admin-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    return res.json();
  },

  getBusinesses: async () => {

    const res = await fetch(`${API_BASE}/api/admin/businesses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      }
    });

    return res.json();
  },

  impersonate: async (business_id: string) => {

    const res = await fetch(`${API_BASE}/api/admin/impersonate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`
      },
      body: JSON.stringify({ business_id })
    });

    return res.json();
  },

  getReceipts: async (businessId: string) => {

    const res = await fetch(
      `https://n8n.aflows.uk/webhook/dace6a4c-1876-47cd-9af0-138dc1103cf4/api/admin/business/${businessId}/receipts`
    );

    return res.json();
  },

  getActivity: async () => {

    const res = await fetch(`${API_BASE}/api/admin/activity`);

    return res.json();
  },

  inspectTable: async (businessId: string, table: string) => {

    const res = await fetch(
      `https://n8n.aflows.uk/webhook/8a2034b6-f8da-4198-a960-793384631e4c/api/admin/db/${businessId}/${table}`
    );

    return res.json();
  }

};
