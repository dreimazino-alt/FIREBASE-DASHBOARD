import { Card, Chip } from "../components/Card";
import { useEffect, useMemo, useState } from "react";
import {
  subscribeHistoryLastN,
  logTelemetry,
  clearTelemetryHistory,
} from "../services/telemetryService";

export default function DataLogsCard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper
  function formatTsSeconds(ts) {
    if (!ts || Number.isNaN(Number(ts))) return "--";
    return new Date(Number(ts) * 1000).toLocaleString();
  }

  // normalize + sort newest first
  const viewRows = useMemo(() => {
    const norm = (r) => {
      const ts =
        r?.ts ??
        r?.tsec ??
        r?.updatedAt ??
        r?.timestamp ??
        r?.time ??
        null;

      const temp =
        r?.temperatureC ??
        r?.tempC ??
        r?.temperature ??
        null;

      const moisture =
        r?.moistureLevel ??
        r?.moisturePct ??
        r?.humidityPct ??
        r?.moist ??
        null;

      const nh3 =
        r?.nh3Ppm ??
        r?.nh3 ??
        null;

      return {
        ...r,
        _ts: ts != null ? Number(ts) : 0,
        _temp: temp != null ? Number(temp) : null,
        _moist: moisture != null ? Number(moisture) : null,
        _nh3: nh3 != null ? Number(nh3) : null,
        _key: r?._key ?? r?.key ?? r?.id ?? null,
      };
    };

    return [...rows].map(norm).sort((a, b) => (b._ts || 0) - (a._ts || 0));
  }, [rows]);

  const fmt = (v, digits = 1) =>
    v == null || Number.isNaN(v) ? "--" : Number(v).toFixed(digits);

  useEffect(() => {
    let unsub = null;
    let cancelled = false;

    (async () => {
      try {
        // ---------- RESET LOGS EVERY 3 DAYS ----------
        const deviceId = import.meta.env.VITE_DEVICE_ID || "ESP32";
        const KEY = `sprout:lastHistoryReset:${deviceId}`;
        const now = Date.now();
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

        const last = Number(localStorage.getItem(KEY) || 0);

        if (!last || now - last >= THREE_DAYS_MS) {
          try {
            await clearTelemetryHistory();
            localStorage.setItem(KEY, String(now));
            console.log("[LOGS] Cleared history (3-day reset).");
          } catch (e) {
            console.error("[LOGS] Failed to clear history:", e);
          }
        }

        // ---------- OPTIONAL: AUTO-ADD ONE TEST LOG ONCE ----------
        const TEST_KEY = `sprout:didTestLog:${deviceId}`;
        if (!localStorage.getItem(TEST_KEY)) {
          try {
            await logTelemetry({
              temperatureC: 42,
              moistureLevel: 60,
              nh3Ppm: 10,
              status: "Manual test",
            });
            localStorage.setItem(TEST_KEY, "1");
            console.log("[LOGS] Added one manual test log.");
          } catch (e) {
            console.error("[LOGS] Failed to add test log:", e);
          }
        }

        // ---------- REALTIME SUBSCRIBE ----------
        // Expect subscribeHistoryLastN to return an unsubscribe function.
        // Callback should receive an array of rows.
        unsub = subscribeHistoryLastN(50, (data) => {
          if (cancelled) return;
          setRows(Array.isArray(data) ? data : []);
          setLoading(false);
        });

        // If service returns nothing, at least stop loading
        if (!unsub) setLoading(false);
      } catch (e) {
        console.error("[LOGS] init/subscribe error:", e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (typeof unsub === "function") unsub();
    };
  }, []);

  return (
    <Card title="Data Logs">
      <div className="flex gap-2 text-xs">
        <Chip>DATE</Chip>
        <Chip>from</Chip>
        <Chip>DATE</Chip>
        <Chip>to</Chip>
      </div>

      <div className="mt-4 text-sm text-gray-700 font-medium">
        Latest Logs (Realtime)
      </div>

      <div className="mt-2 overflow-hidden rounded-lg border border-gray-100">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left p-2">Date/Time</th>
              <th className="text-left p-2">Temp</th>
              <th className="text-left p-2">Moisture</th>
              <th className="text-left p-2">NH3</th>
            </tr>
          </thead>

          <tbody className="bg-white text-gray-700">
            {loading ? (
              <tr className="border-t">
                <td className="p-2" colSpan={4}>
                  Loading realtime logs…
                </td>
              </tr>
            ) : viewRows.length === 0 ? (
              <tr className="border-t">
                <td className="p-2" colSpan={4}>
                  No history yet.
                </td>
              </tr>
            ) : (
              viewRows.map((r, idx) => (
                <tr className="border-t" key={r._key ?? `${r._ts}-${idx}`}>
                  <td className="p-2">{formatTsSeconds(r._ts)}</td>
                  <td className="p-2">
                    {fmt(r._temp, 1)}
                    {r._temp != null ? "°C" : ""}
                  </td>
                  <td className="p-2">
                    {fmt(r._moist, 1)}
                    {r._moist != null ? "%" : ""}
                  </td>
                  <td className="p-2">
                    {fmt(r._nh3, 1)}
                    {r._nh3 != null ? " ppm" : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
