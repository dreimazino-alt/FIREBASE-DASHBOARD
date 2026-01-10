import { Card, Chip } from "../components/Card";

export default function SettingsCard() {
  return (
    <Card title="Settings">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm text-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Device ID</span>
          <span className="text-gray-600">ESP32</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">WiFi Status</span>
          <Chip tone="green">Connected</Chip>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-medium">Upload</span>
          <Chip tone="blue">ACTIVE</Chip>
        </div>
      </div>

      <div className="mt-4 text-sm font-medium text-gray-700">Sensor Alert Thresholds</div>

      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-2"></th>
              <th className="text-left p-2">min</th>
              <th className="text-left p-2">max</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-700">
            <tr className="border-t">
              <td className="p-2">Temperature</td>
              <td className="p-2">45</td>
              <td className="p-2">60</td>
            </tr>
            <tr className="border-t">
              <td className="p-2">Humidity</td>
              <td className="p-2">65</td>
              <td className="p-2">75</td>
            </tr>
            <tr className="border-t">
              <td className="p-2">NH3</td>
              <td className="p-2">0</td>
              <td className="p-2">15</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 font-semibold">
        Save Settings
      </button>
    </Card>
  );
}
