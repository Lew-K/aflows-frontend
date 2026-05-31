import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../lib/adminApi";

type ActivityItem = {
  id: string;
  event_type: string;
  business_name: string;
  description: string;
  created_at: string;
};

const Activity = () => {

  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    adminApi.getActivity(100)
      .then(d => setActivity(d.activity || []))
      .catch(() => {});
  }, []);
  
  return (
    <div className="p-8 space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Platform Activity
        </h1>

        <button
          onClick={() => navigate("/internal-admin")}
          className="px-4 py-2 border rounded"
        >
          Back to Dashboard
        </button>

      </div>

      <div className="border rounded-lg overflow-hidden">

        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">Time</th>
              <th className="p-3">Business</th>
              <th className="p-3">Event</th>
              <th className="p-3">Description</th>
            </tr>
          </thead>

          <tbody>

            {activity.map((item) => (

              <tr key={item.id} className="border-t">

                <td className="p-3">{item.created_at}</td>
                <td className="p-3">{item.business_name}</td>
                <td className="p-3 capitalize">
                  {item.event_type.replace("_", " ")}
                </td>
                <td className="p-3">{item.description}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Activity;
