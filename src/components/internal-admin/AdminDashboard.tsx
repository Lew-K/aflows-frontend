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

      {/* Header */}
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
          className="px-4 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          Logout
        </button>
      </div>

      {/* Top Stats (Static for now) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="p-5 border rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Businesses</p>
          <p className="text-2xl font-bold">124</p>
        </div>

        <div className="p-5 border rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Active Today</p>
          <p className="text-2xl font-bold">18</p>
        </div>

        <div className="p-5 border rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Issues</p>
          <p className="text-2xl font-bold text-red-500">3</p>
        </div>

        <div className="p-5 border rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Revenue (KES)</p>
          <p className="text-2xl font-bold">245,000</p>
        </div>
      </div>

      {/* Alert / Attention Section */}
      <div className="p-6 border rounded-xl bg-yellow-50">
        <h2 className="text-lg font-semibold mb-2">
          ⚠ Needs Attention
        </h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 2 businesses pending approval</li>
          <li>• 1 failed payment retry</li>
          <li>• 4 users flagged for suspicious activity</li>
        </ul>
      </div>

      {/* Main Admin Modules */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Businesses (Enhanced - PRIMARY CARD) */}
        <div
          onClick={() => navigate("/internal-admin/businesses")}
          className="p-6 border-2 border-black/10 rounded-xl hover:bg-gray-50 hover:shadow-md transition text-left cursor-pointer md:col-span-2"
        >
          <h2 className="text-xl font-semibold mb-2">
            🏢 Businesses
          </h2>

          <div className="space-y-1 text-sm text-gray-600">
            <p>124 total</p>
            <p className="text-red-500">6 overdue payments</p>
            <p className="text-yellow-500">3 pending approval</p>
          </div>

          <p className="mt-3 text-gray-500">
            Manage accounts, deactivate for non-payment, and monitor platform usage
          </p>

          {/* Quick Actions */}
          <div className="mt-4 flex gap-2 flex-wrap">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/internal-admin/businesses?filter=overdue");
              }}
              className="text-xs px-3 py-1 bg-red-100 text-red-600 rounded"
            >
              View Overdue
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/internal-admin/businesses?filter=pending");
              }}
              className="text-xs px-3 py-1 bg-yellow-100 text-yellow-600 rounded"
            >
              Pending Approval
            </button>
          </div>
        </div>

        {/* Activity */}
        <div
          onClick={() => navigate("/internal-admin/activity")}
          className="p-6 border rounded-xl hover:bg-gray-50 hover:shadow-md transition text-left cursor-pointer"
        >
          <h2 className="text-xl font-semibold mb-2">
            📊 Platform Activity
          </h2>

          <p className="text-gray-600 text-sm">
            View platform-wide events, logs, and admin actions
          </p>
        </div>

        {/* Placeholder Future Cards */}
        <div className="p-6 border rounded-xl text-left opacity-70">
          <h2 className="text-xl font-semibold mb-2">
            💳 Payments
          </h2>
          <p className="text-gray-600 text-sm">
            Coming soon: subscriptions, invoices, failed payments
          </p>
        </div>

        <div className="p-6 border rounded-xl text-left opacity-70">
          <h2 className="text-xl font-semibold mb-2">
            👤 Users
          </h2>
          <p className="text-gray-600 text-sm">
            Coming soon: manage admins and permissions
          </p>
        </div>

      </div>

      {/* Recent Activity Feed */}
      <div className="p-6 border rounded-xl">
        <h2 className="text-lg font-semibold mb-4">
          Recent Activity
        </h2>

        <ul className="text-sm text-gray-700 space-y-2">
          <li>• New business created</li>
          <li>• Business upgraded to premium</li>
          <li>• Admin updated receipt settings</li>
          <li>• Failed login attempt detected</li>
        </ul>
      </div>

    </div>
  );
};

export default AdminDashboard;
