import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {

  const navigate = useNavigate();

  useEffect(() => {
    const admin = localStorage.getItem("superadmin");

    if (!admin) {
      navigate("/internal-admin/login");
    }
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const allowed = await isSuperAdmin();
  
      if (!allowed) {
        window.location.href = "/";
      }
    };
  
    checkAdmin();
  }, []);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Platform Admin Dashboard
      </h1>

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
