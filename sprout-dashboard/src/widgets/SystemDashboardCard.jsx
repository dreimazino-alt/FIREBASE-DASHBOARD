import { Card, Chip } from "../components/Card";

export default function SystemDashboardCard() {
  return (
    <Card title="System Dashboard">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">
          <div className="font-medium text-gray-700">Composting Status</div>
          <div>Last updated: 1 min ago</div>
        </div>
        <div className="text-sm text-gray-500 text-right">
          <div className="font-medium text-gray-700">Composting</div>
          <div>Ongoing</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Temperature</div>
          <div className="text-2xl font-bold text-gray-900">54°C</div>
          <div className="mt-2"><Chip tone="green">Normal</Chip></div>
          <div className="h-10 mt-2 bg-blue-100 rounded" />
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Humidity</div>
          <div className="text-2xl font-bold text-gray-900">72%</div>
          <div className="mt-2"><Chip tone="yellow">High</Chip></div>
          <div className="h-10 mt-2 bg-blue-100 rounded" />
        </div>
      </div>

      <div className="mt-4 text-sm">
        <div className="font-medium text-gray-700">Quick Alerts</div>
        <div className="text-gray-600 mt-1">• Humidity above thresholds</div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700 font-medium">Ammonia Level</div>
        <Chip tone="blue">Low</Chip>
      </div>
      <div className="text-2xl font-bold text-gray-900">8 ppm</div>
    </Card>
  );
}
