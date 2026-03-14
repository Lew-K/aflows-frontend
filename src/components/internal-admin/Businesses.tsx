import { useEffect, useState } from "react";

const Businesses = () => {

  const [businesses, setBusinesses] = useState<any[]>([]);

  useEffect(() => {

    fetch("/api/admin/businesses")
      .then((res) => res.json())
      .then((data) => setBusinesses(data));

  }, []);

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        All Businesses
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Business</th>
            <th className="p-2">Owner</th>
            <th className="p-2">Plan</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>

          {businesses.map((b) => (

            <tr key={b.id} className="border-t">
              <td className="p-2">{b.name}</td>
              <td className="p-2">{b.owner_email}</td>
              <td className="p-2">{b.plan}</td>
              <td className="p-2">{b.status}</td>
            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default Businesses;
