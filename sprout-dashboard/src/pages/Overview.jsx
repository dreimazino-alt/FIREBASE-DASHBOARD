import SystemDashboardCard from "../widgets/SystemDashboardCard";
import DataLogsCard from "../widgets/DataLogsCard";

export default function Overview() {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-3xl px-4 py-6 space-y-6">
        {/* Top: Dashboard */}
        <SystemDashboardCard />

        {/* Bottom: Data Logs */}
        <DataLogsCard />
      </div>
    </div>
  );
}
