import { Card, Chip } from "../components/Card";

export default function DataLogsCard() {
  return (
    <Card title="Data Logs">
      <div className="flex gap-2 text-xs">
        <Chip>DATE</Chip>
        <Chip>from</Chip>
        <Chip>DATE</Chip>
        <Chip>to</Chip>
      </div>

      <div className="mt-4 text-sm text-gray-700 font-medium">Temperature Over Time</div>
      <div className="h-28 mt-2 bg-gray-50 rounded-lg border border-gray-100" />

      <div className="mt-4 text-sm text-gray-700 font-medium">Humidity Over Time</div>

      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-2">Date/Time</th>
              <th className="text-left p-2">Temp</th>
              <th className="text-left p-2">Hum</th>
            </tr>
          </thead>
          <tbody className="bg-white text-gray-700">
            <tr className="border-t">
              <td className="p-2">10/21 12:30</td>
              <td className="p-2">54°C</td>
              <td className="p-2">72%</td>
            </tr>
            <tr className="border-t">
              <td className="p-2">10/21 12:40</td>
              <td className="p-2">53°C</td>
              <td className="p-2">71%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
