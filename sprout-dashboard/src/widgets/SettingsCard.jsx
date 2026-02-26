import { Card, Chip } from "../components/Card";
import { useEffect, useMemo, useState } from "react";
import {
  subscribeThresholds,
  saveThresholds,
  subscribeLatestTelemetry,
} from "../services/telemetryService";

function clampNum(val) {
  // allow empty while typing
  if (val === "" || val == null) return "";
  const n = Number(val);
  return Number.isFinite(n) ? n : "";
}

function statusFromThreshold(value, min, max) {
  if (value == null || min == null || max == null) return { label: "—", tone: "gray" };
  if (value < min) return { label: "LOW", tone: "yellow" };
  if (value > max) return { label: "HIGH", tone: "red" };
  return { label: "OK", tone: "green" };
}

// Normalize whatever is in DB to our standard schema
function normalizeThresholds(t) {
  const src = t || {};
  const moist = src.moistureLevel ?? src.humidity ?? {}; // fallback

  return {
    temperature: {
      min: src.temperature?.min ?? "",
      max: src.temperature?.max ?? "",
    },
    moistureLevel: {
      min: moist?.min ?? "",
      max: moist?.max ?? "",
    },
    nh3: {
      min: src.nh3?.min ?? "",
      max: src.nh3?.max ?? "",
    },
  };
}

export default function SettingsCard() {
  const [thresholds, setThresholds] = useState(null);
  const [draft, setDraft] = useState(null);
  const [latest, setLatest] = useState(null);
  const [saving, setSaving] = useState(false);

  // ✅ Realtime thresholds subscription (this was missing)
  useEffect(() => {
    const unsub = subscribeThresholds((data) => {
      setThresholds(data ?? null);
    });
    return () => {
      try { unsub && unsub(); } catch {}
    };
  }, []);

  // ✅ Realtime latest telemetry (only once)
  useEffect(() => {
    const unsub = subscribeLatestTelemetry((data) => setLatest(data ?? null));
    return () => {
      try { unsub && unsub(); } catch {}
    };
  }, []);

  // ✅ Initialize/refresh draft when thresholds change
  useEffect(() => {
    if (!thresholds) return;
    setDraft(normalizeThresholds(thresholds));
  }, [thresholds]);

  // convenient field getters
  const temp = useMemo(
    () => ({
      min: draft?.temperature?.min ?? "",
      max: draft?.temperature?.max ?? "",
    }),
    [draft]
  );

  const moist = useMemo(
    () => ({
      min: draft?.moistureLevel?.min ?? "",
      max: draft?.moistureLevel?.max ?? "",
    }),
    [draft]
  );

  const nh3 = useMemo(
    () => ({
      min: draft?.nh3?.min ?? "",
      max: draft?.nh3?.max ?? "",
    }),
    [draft]
  );

  // telemetry normalize for badge checks
  const latestTemp = latest?.temperatureC ?? latest?.tempC ?? latest?.temperature ?? null;
  const latestMoist =
    latest?.moistureLevel ?? latest?.moisturePct ?? latest?.humidityPct ?? latest?.moist ?? null;
  const latestNh3 = latest?.nh3Ppm ?? latest?.nh3 ?? null;

  const liveThr = useMemo(() => normalizeThresholds(thresholds), [thresholds]);

  const tempStatus = statusFromThreshold(latestTemp, liveThr?.temperature?.min, liveThr?.temperature?.max);
  const moistStatus = statusFromThreshold(latestMoist, liveThr?.moistureLevel?.min, liveThr?.moistureLevel?.max);
  const nh3Status = statusFromThreshold(latestNh3, liveThr?.nh3?.min, liveThr?.nh3?.max);

  function updateField(group, key, value) {
    setDraft((d) => ({
      ...(d ?? {}),
      [group]: {
        ...((d ?? {})[group] ?? {}),
        [key]: clampNum(value),
      },
    }));
  }

  function validateDraft(d) {
    const groups = ["temperature", "moistureLevel", "nh3"];
    for (const g of groups) {
      const min = Number(d?.[g]?.min);
      const max = Number(d?.[g]?.max);
      if (!Number.isFinite(min) || !Number.isFinite(max)) return `${g} min/max must be numbers`;
      if (min > max) return `${g} min must be <= max`;
    }
    return null;
  }

  async function handleSave() {
    if (!draft) return;

    const err = validateDraft(draft);
    if (err) return alert(err);

    // ✅ Save in standard schema only
    const payload = {
      temperature: { min: Number(draft.temperature.min), max: Number(draft.temperature.max) },
      moistureLevel: { min: Number(draft.moistureLevel.min), max: Number(draft.moistureLevel.max) },
      nh3: { min: Number(draft.nh3.min), max: Number(draft.nh3.max) },
    };

    setSaving(true);
    try {
      await saveThresholds(payload);
      alert("Settings saved to Firebase.");
    } catch (e) {
      console.error(e);
      alert("Save failed. Check Firebase rules and internet connection.");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setDraft(normalizeThresholds(thresholds));
  }

  return (
    <Card title="Settings">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-sm text-gray-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium">Device ID</span>
          <span className="text-gray-600">{import.meta.env.VITE_DEVICE_ID || "ESP32"}</span>
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

      <div className="mt-2 flex flex-wrap gap-2 text-xs">
        <Chip tone={tempStatus.tone}>TEMP: {tempStatus.label}</Chip>
        <Chip tone={moistStatus.tone}>MOISTURE: {moistStatus.label}</Chip>
        <Chip tone={nh3Status.tone}>NH3: {nh3Status.label}</Chip>
      </div>

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
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={temp.min}
                  onChange={(e) => updateField("temperature", "min", e.target.value)}
                  placeholder="min"
                />
              </td>
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={temp.max}
                  onChange={(e) => updateField("temperature", "max", e.target.value)}
                  placeholder="max"
                />
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-2">Moisture</td>
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={moist.min}
                  onChange={(e) => updateField("moistureLevel", "min", e.target.value)}
                  placeholder="min"
                />
              </td>
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={moist.max}
                  onChange={(e) => updateField("moistureLevel", "max", e.target.value)}
                  placeholder="max"
                />
              </td>
            </tr>

            <tr className="border-t">
              <td className="p-2">NH3</td>
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={nh3.min}
                  onChange={(e) => updateField("nh3", "min", e.target.value)}
                  placeholder="min"
                />
              </td>
              <td className="p-2">
                <input
                  className="w-16 border rounded px-2 py-1"
                  value={nh3.max}
                  onChange={(e) => updateField("nh3", "max", e.target.value)}
                  placeholder="max"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleReset}
          className="w-1/2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg py-2 font-semibold"
          type="button"
        >
          Reset
        </button>

        <button
          onClick={handleSave}
          disabled={saving || !draft}
          className="w-1/2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg py-2 font-semibold"
          type="button"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </Card>
  );
}
