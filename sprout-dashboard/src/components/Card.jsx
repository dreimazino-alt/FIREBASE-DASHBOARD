export function Card({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function Chip({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-800",
  };
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
}
