import { Card, Chip } from "../components/Card";
import { useEffect, useMemo, useState } from "react";
import { subscribeLatestTelemetry, subscribeThresholds } from "../services/telemetryService";

export default function SystemDashboardCard() {
  const [latest, setLatest] = useState(null);
  const [thresholds, setThresholds] = useState(null);

  // ✅ this stores the moment the browser received the newest snapshot
  const [lastSeenMs, setLastSeenMs] = useState(null);

  useEffect(() => {
    const unsubLatest = subscribeLatestTelemetry((data) => {
      console.log("LATEST FROM FIREBASE:", data);
      setLatest(data ?? null);
      setLastSeenMs(Date.now()); // ✅ fixes 1970 display
    });

    const unsubThresh = subscribeThresholds((data) => {
      console.log("THRESHOLDS FROM FIREBASE:", data);
      setThresholds(data ?? null);
    });

    return () => {
      try { unsubLatest && unsubLatest(); } catch {}
      try { unsubThresh && unsubThresh(); } catch {}
    };
  }, []);

  // --------- normalize telemetry ----------
  const norm = useMemo(() => {
    const l = latest || {};

    const ts =
      l.updatedAt ??
      l.ts ??
      l.tsec ??
      l.timestamp ??
      null;

    const temp =
      l.temperatureC ??
      l.tempC ??
      l.temperature ??
      null;

    const moisture =
      l.moistureLevel ??
      l.moisturePct ??
      l.humidityPct ??
      l.moist ??
      null;

    const nh3 =
      l.nh3Ppm ??
      l.nh3 ??
      null;

    const device =
      l.device ??
      l.deviceId ??
      l.id ??
    "ESP32";

    const status =
      l.status ??
      l.state ??
      l.mode ??
    (lastSeenMs ? "Online" : "—");

    const rssi = l.rssi ?? null;

return {
  ts: ts != null ? Number(ts) : null,
  temp: temp != null ? Number(temp) : null,
  moisture: moisture != null ? Number(moisture) : null,
  nh3: nh3 != null ? Number(nh3) : null,
  device,
  status,
  rssi,
};

  }, [latest]);

  // ✅ Only treat ts as a real wall-clock time if it looks like a real epoch seconds
  // 1700000000 ~ year 2023. Anything smaller is probably uptime/0.
  const isValidEpochSeconds = (s) => typeof s === "number" && s > 1700000000;

  const updatedLabel = useMemo(() => {
    if (isValidEpochSeconds(norm.ts)) {
      return new Date(norm.ts * 1000).toLocaleString();
    }
    if (lastSeenMs) {
      return new Date(lastSeenMs).toLocaleString();
    }
    return "—";
  }, [norm.ts, lastSeenMs]);

  // --------- normalize thresholds ----------
  const thr = useMemo(() => {
    const t = thresholds || {};

    const tMin = t.temperature?.min ?? t.tempC?.min ?? t.temperatureC?.min ?? t.temperatureMin ?? null;
    const tMax = t.temperature?.max ?? t.tempC?.max ?? t.temperatureC?.max ?? t.temperatureMax ?? null;

    const mMin = t.moistureLevel?.min ?? t.moisture?.min ?? t.humidity?.min ?? t.moistureMin ?? null;
    const mMax = t.moistureLevel?.max ?? t.moisture?.max ?? t.humidity?.max ?? t.moistureMax ?? null;

    const nMin = t.nh3?.min ?? t.ammonia?.min ?? t.nh3Min ?? null;
    const nMax = t.nh3?.max ?? t.ammonia?.max ?? t.nh3Max ?? null;

    return {
      tMin: tMin != null ? Number(tMin) : null,
      tMax: tMax != null ? Number(tMax) : null,
      mMin: mMin != null ? Number(mMin) : null,
      mMax: mMax != null ? Number(mMax) : null,
      nMin: nMin != null ? Number(nMin) : null,
      nMax: nMax != null ? Number(nMax) : null,
    };
  }, [thresholds]);

  function labelTone(value, min, max) {
    if (value == null || min == null || max == null) return { label: "—", tone: "gray" };
    if (value < min) return { label: "Low", tone: "yellow" };
    if (value > max) return { label: "High", tone: "red" };
    return { label: "Normal", tone: "green" };
  }

  const tempBadge = labelTone(norm.temp, thr.tMin, thr.tMax);
  const moistureBadge = labelTone(norm.moisture, thr.mMin, thr.mMax);
  const nh3Badge = labelTone(norm.nh3, thr.nMin, thr.nMax);

  const alerts = [];
  if (norm.moisture != null && thr.mMax != null && norm.moisture > thr.mMax) alerts.push("Moisture level above thresholds");
  if (norm.moisture != null && thr.mMin != null && norm.moisture < thr.mMin) alerts.push("Moisture level below thresholds");
  if (norm.temp != null && thr.tMax != null && norm.temp > thr.tMax) alerts.push("Temperature above thresholds");
  if (norm.temp != null && thr.tMin != null && norm.temp < thr.tMin) alerts.push("Temperature below thresholds");
  if (norm.nh3 != null && thr.nMax != null && norm.nh3 > thr.nMax) alerts.push("Ammonia above thresholds");

  const fmt = (v, digits = 1) => (v == null || Number.isNaN(v) ? "--" : Number(v).toFixed(digits));

  return (
    <Card title="System Dashboard">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">
          <div className="font-medium text-gray-700">Composting Status</div>
          <div>Last updated: {updatedLabel}</div>
          {norm.rssi != null ? <div>WiFi RSSI: {norm.rssi} dBm</div> : null}
        </div>

        <div className="text-sm text-gray-500 text-right">
          <div className="font-medium text-gray-700">Device</div>
          <div>{norm.status}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Temperature</div>
          <div className="text-2xl font-bold text-gray-900">
            {fmt(norm.temp, 1)}{norm.temp != null ? "°C" : ""}
          </div>
          <div className="mt-2">
            <Chip tone={tempBadge.tone}>{tempBadge.label}</Chip>
          </div>
          <div className="h-10 mt-2 bg-blue-100 rounded" />
          <div className="mt-2 text-[11px] text-gray-500">
            Threshold: {thr.tMin ?? "—"} to {thr.tMax ?? "—"} °C
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500">Moisture Level</div>
          <div className="text-2xl font-bold text-gray-900">
            {fmt(norm.moisture, 1)}{norm.moisture != null ? "%" : ""}
          </div>
          <div className="mt-2">
            <Chip tone={moistureBadge.tone}>{moistureBadge.label}</Chip>
          </div>
          <div className="h-10 mt-2 bg-blue-100 rounded" />
          <div className="mt-2 text-[11px] text-gray-500">
            Threshold: {thr.mMin ?? "—"} to {thr.mMax ?? "—"} %
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm">
        <div className="font-medium text-gray-700">Quick Alerts</div>
        <div className="text-gray-600 mt-1">
          {alerts.length ? alerts.map((a) => <div key={a}>• {a}</div>) : <div>• No active alerts</div>}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700 font-medium">Ammonia Level</div>
        <Chip tone={nh3Badge.tone}>{nh3Badge.label}</Chip>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {fmt(norm.nh3, 1)}{norm.nh3 != null ? " ppm" : ""}
      </div>
      <div className="mt-2 text-[11px] text-gray-500">
        Threshold: {thr.nMin ?? "—"} to {thr.nMax ?? "—"} ppm
      </div>
    </Card>
  );
}
