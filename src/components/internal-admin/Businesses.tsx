import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan: string;
  status: string;
};

const Businesses = () => {

  const navigate = useNavigate();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {

    adminApi.getBusinesses()
      .then((data) => setBusinesses(data))
      .catch((err) => console.error("Failed to load businesses", err));

  }, []);

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_email.toLowerCase().includes(search.toLowerCase())
  );

  const openDashboard = (id: string) => {
    window.open(`/dashboard?business_id=${id}`, "_blank");
  };

  const impersonateBusiness = async (id: string) => {

    try {

      const data = await adminApi.impersonate(id);

      if (data.login_url) {
        window.location.href = data.login_url;
      }

    } catch (err) {
      console.error("Impersonation failed", err);
    }

  };

  const openReceipts = (id: string) => {
    window.open(`/internal-admin/business/${id}/receipts`, "_blank");
  };

  const openDBInspector = (id: string) => {
    window.open(`/internal-admin/db/${id}`, "_blank");
  };

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

              <td className="p-3 font-medium">{b.name}</td>
              <td className="p-3">{b.owner_email}</td>
              <td className="p-3">{b.plan}</td>
              <td className="p-3">{b.status}</td>

              <td className="p-3 flex gap-4 flex-wrap">

                <button
                  onClick={() => openDashboard(b.id)}
                  className="text-blue-600 hover:underline"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => impersonateBusiness(b.id)}
                  className="text-green-600 hover:underline"
                >
                  Login As
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

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );
};

export default Businesses;
