import { NavLink } from "react-router-dom";

function Tab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-2 py-1 text-sm transition ${
          isActive
            ? "text-gray-900 font-semibold border-b-2 border-gray-900"
            : "text-gray-500 hover:text-gray-800"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function TopNav() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-3 items-center">
        {/* Left: Firebase brand */}
        <div className="flex items-center gap-2 font-semibold text-gray-900">
          <span className="text-orange-500 text-lg">🌱</span>
          SPROUT
        </div>

        {/* Center: Tabs */}
        <div className="flex justify-center gap-6">
          <Tab to="/overview">Overview</Tab>
          <Tab to="/">Dashboard</Tab>
          <Tab to="/logs">Logs</Tab>
          <Tab to="/settings">Settings</Tab>
        </div>
      </div>
    </div>
  );
}
