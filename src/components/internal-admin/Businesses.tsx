import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan?: string;
  status?: string;
};

const Businesses = () => {

  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");

  // ---------- DATA LOADING WITH PREFETCH CACHE ----------

  useEffect(() => {

    const cached = sessionStorage.getItem("admin_businesses");

    if (cached) {
      setBusinesses(JSON.parse(cached));
    }

    adminApi.getBusinesses()
      .then((data) => {

        const list = data.businesses || [];

        setBusinesses(list);

        sessionStorage.setItem(
          "admin_businesses",
          JSON.stringify(list)
        );

      })
      .catch((err) => console.error("Failed to load businesses", err));

  }, []);

  // ---------- SEARCH ----------

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_email.toLowerCase().includes(search.toLowerCase())
  );

  // ---------- ADMIN ACTIONS ----------

  const openDashboard = (id: string) => {
    window.open(`/dashboard?business_id=${id}`, "_blank");
  };

  const openReceipts = (id: string) => {
    window.open(`/internal-admin/business/${id}/receipts`, "_blank");
  };

  const openDBInspector = (id: string) => {
    window.open(`/internal-admin/db/${id}`, "_blank");
  };

  const resetPassword = async (id: string) => {

    const newPassword = prompt("Enter new password");

    if (!newPassword) return;

    try {

      await adminApi.resetPassword(id, newPassword);

      alert("Password updated");

    } catch (err) {
      console.error("Password reset failed", err);
    }

  };

  const deactivateBusiness = async (id: string) => {

    if (!confirm("Deactivate this business?")) return;

    try {

      await adminApi.deactivateBusiness(id);

      setBusinesses((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "inactive" } : b
        )
      );

    } catch (err) {
      console.error("Deactivate failed", err);
    }

  };

  const confirmDelete = async (id: string) => {

    const password = prompt(
      "Enter admin password to permanently delete this business"
    );

    if (!password) return;

    try {

      await adminApi.deleteBusiness(id, password);

      setBusinesses((prev) =>
        prev.filter((b) => b.id !== id)
      );

    } catch (err) {
      console.error("Delete failed", err);
    }

  };

  // ---------- UI ----------

  return (

    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          All Businesses
        </h1>

        <button
          onClick={() => navigate("/internal-admin")}
          className="px-4 py-2 border rounded"
        >
          Back
        </button>

      </div>

      <input
        type="text"
        placeholder="Search business or owner email..."
        className="border rounded px-3 py-2 w-full max-w-md text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <p className="text-sm text-gray-500">
        Showing {filteredBusinesses.length} of {businesses.length} businesses
      </p>

      <table className="w-full border rounded-lg overflow-hidden">

        <thead className="bg-gray-100 text-black">
          <tr>
            <th className="p-3 text-left">Business</th>
            <th className="p-3 text-left">Owner</th>
            <th className="p-3 text-left">Plan</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>

          {filteredBusinesses.map((b) => (

            <tr key={b.id} className="border-t">

              <td className="p-3 font-medium">
                {b.name}
              </td>

              <td className="p-3">
                {b.owner_email}
              </td>

              <td className="p-3">
                {b.plan || "-"}
              </td>

              <td className="p-3">
                {b.status || "active"}
              </td>

              <td className="p-3">

                <div className="flex flex-wrap gap-3 text-sm">

                  <button
                    onClick={() => openDashboard(b.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Dashboard
                  </button>

                  <button
                    onClick={() => openReceipts(b.id)}
                    className="text-purple-600 hover:underline"
                  >
                    Receipts
                  </button>

                  <button
                    onClick={() => openDBInspector(b.id)}
                    className="text-orange-600 hover:underline"
                  >
                    DB
                  </button>

                  <button
                    onClick={() => resetPassword(b.id)}
                    className="text-indigo-600 hover:underline"
                  >
                    Reset Password
                  </button>

                  <button
                    onClick={() => deactivateBusiness(b.id)}
                    className="text-yellow-600 hover:underline"
                  >
                    Deactivate
                  </button>

                  <button
                    onClick={() => confirmDelete(b.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

};

export default Businesses;
