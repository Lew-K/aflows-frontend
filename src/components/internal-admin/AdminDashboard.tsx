import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("superadmin");
    if (!admin) {
      navigate("/internal-admin/login");
    }
  }, [navigate]);

  return (
    <div className="p-8 space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">
          Platform Admin Dashboard
        </h1>

        <button
          onClick={() => {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("superadmin");
            navigate("/internal-admin/login");
          }}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Businesses */}

        <button
          onClick={() => navigate("/internal-admin/businesses")}
          className="p-6 border rounded-lg hover:bg-gray-50 hover:shadow-md transition text-left"
        >
          <h2 className="text-xl font-semibold mb-2">
            Businesses
          </h2>
          <p className="text-gray-600">
            View and manage all businesses on the platform
          </p>
        </button>

        {/* Activity */}

        <button
          onClick={() => navigate("/internal-admin/activity")}
          className="p-6 border rounded-lg hover:bg-gray-50 hover:shadow-md transition text-left"
        >
          <h2 className="text-xl font-semibold mb-2">
            Platform Activity
          </h2>
          <p className="text-gray-600">
            View platform-wide events and actions
          </p>
        </button>

      </div>

    </div>
  );
};

export default AdminDashboard;
