import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isSuper = localStorage.getItem("superadmin") === "true";
    const token = localStorage.getItem("admin_token");

    // Redirect if not logged in or not superadmin
    if (!token || !isSuper) {
      navigate("/internal-admin/login");
    }
  }, [navigate]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Admin Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Businesses</h2>
          <p>Manage all businesses</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Activity</h2>
          <p>Platform activity logs</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
