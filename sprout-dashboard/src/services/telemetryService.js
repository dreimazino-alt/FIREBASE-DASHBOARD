import { ref, onValue, set, push, query, limitToLast, remove } from "firebase/database";
import { db } from "../firebase";

const deviceId = import.meta.env.VITE_DEVICE_ID || "ESP32";

// ... keep your existing functions ...

export async function clearTelemetryHistory() {
  const r = ref(db, `devices/${deviceId}/telemetry/history`);
  await remove(r);
}
//
// ======================= READ: LATEST =======================
//
export function subscribeLatestTelemetry(cb) {
  const r = ref(db, `devices/${deviceId}/telemetry/latest`);
  return onValue(r, (snap) => cb(snap.val()));
}

//
// ======================= READ: THRESHOLDS =======================
//
export function subscribeThresholds(cb) {
  const r = ref(db, `devices/${deviceId}/settings/thresholds`);
  return onValue(r, (snap) => cb(snap.val()));
}

export async function saveThresholds(data) {
  const r = ref(db, `devices/${deviceId}/settings/thresholds`);
  await set(r, data);
}

//
// ======================= WRITE: LATEST =======================
//
export async function writeLatestTelemetry(data) {
  const r = ref(db, `devices/${deviceId}/telemetry/latest`);
  await set(r, data);
}

//
// ======================= WRITE: HISTORY =======================
//
export async function appendTelemetryHistory(data) {
  const r = ref(db, `devices/${deviceId}/telemetry/history`);
  await set(push(r), data); // push() = realtime history
}

//
// ======================= WRITE: BOTH =======================
//
export async function logTelemetry(data) {
  // always ensure a real timestamp (epoch seconds)
  const ts = data.ts ?? data.updatedAt ?? Math.floor(Date.now() / 1000);

  const payload = {
    ...data,
    ts,
    updatedAt: ts,
  };

  await writeLatestTelemetry(payload);
  await appendTelemetryHistory(payload);

  return payload;
}

//
// ======================= READ: HISTORY (REALTIME) =======================
//
export function subscribeHistoryLastN(n, cb) {
  const r = query(
    ref(db, `devices/${deviceId}/telemetry/history`),
    limitToLast(n)
  );

  return onValue(r, (snap) => {
    const val = snap.val() || {};

    // Firebase gives object → convert to array
    const arr = Object.entries(val).map(([key, row]) => ({
      _key: key,
      ...(row || {}),
    }));

    // sort newest → oldest
    arr.sort(
      (a, b) =>
        (b.ts ?? b.updatedAt ?? 0) -
        (a.ts ?? a.updatedAt ?? 0)
    );

    cb(arr);
  });
}
