import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type ActivityItem = {
  id: string;
  type: string;
  business: string;
  description: string;
  created_at: string;
};

const Activity = () => {

  const navigate = useNavigate();
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {

    const mockData: ActivityItem[] = [
      {
        id: "1",
        type: "receipt_upload",
        business: "Cafe Nairobi",
        description: "Uploaded receipt RCT-A6D9392D.pdf",
        created_at: "2026-03-14 10:23",
      },
      {
        id: "2",
        type: "sale_recorded",
        business: "Tech Supplies KE",
        description: "Sale recorded - KES 3,200",
        created_at: "2026-03-14 09:58",
      },
      {
        id: "3",
        type: "business_created",
        business: "Green Grocers",
        description: "New business registered",
        created_at: "2026-03-13 18:42",
      },
    ];

    setActivity(mockData);

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
                <td className="p-3">{item.business}</td>
                <td className="p-3 capitalize">
                  {item.type.replace("_", " ")}
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
