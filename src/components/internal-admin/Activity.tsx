import { useEffect, useState } from "react";

type ActivityItem = {
  id: string;
  type: string;
  business: string;
  description: string;
  created_at: string;
};

const Activity = () => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    // Placeholder data until backend endpoint exists
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
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Platform Activity</h1>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="text-left">
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
                <td className="p-3 capitalize">{item.type.replace("_", " ")}</td>
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
