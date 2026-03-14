import { useEffect, useState } from "react";

type Business = {
  id: string;
  name: string;
  owner_email: string;
  plan: string;
  status: string;
};

const Businesses = () => {

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((res) => res.json())
      .then((data) => setBusinesses(data));
  }, []);

  const filteredBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_email.toLowerCase().includes(search.toLowerCase())
  );

  const openDashboard = (id: string) => {
    window.open(`/dashboard?business_id=${id}`, "_blank");
  };

  const impersonateBusiness = async (id: string) => {

    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ business_id: id }),
    });

    const data = await res.json();

    if (data.login_url) {
      window.location.href = data.login_url;
    }
  };

  const openReceipts = (id: string) => {
    window.open(`/internal-admin/business/${id}/receipts`, "_blank");
  };

  const openDBInspector = (id: string) => {
    window.open(`/internal-admin/db/${id}`, "_blank");
  };

  return (

    <div className="p-6 space-y-6">

      <h1 className="text-2xl font-bold">
        All Businesses
      </h1>

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search business or owner email..."
        className="border rounded px-3 py-2 w-full max-w-md text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* RESULT COUNT */}

      <p className="text-sm text-muted-foreground">
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
                {b.plan}
              </td>

              <td className="p-3">
                {b.status}
              </td>

              <td className="p-3 flex gap-3 flex-wrap">

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
