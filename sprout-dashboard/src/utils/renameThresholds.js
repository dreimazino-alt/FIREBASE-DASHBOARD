import { ref, get, set, remove } from "firebase/database";
import { db } from "../firebase"; // adjust path if needed

async function renameHumidityToMoisture() {
  const oldRef = ref(db, "devices/ESP32/settings/thresholds/humidity");
  const newRef = ref(db, "devices/ESP32/settings/thresholds/moistureLevel");

  const snap = await get(oldRef);
  if (!snap.exists()) {
    console.log("No humidity threshold found");
    return;
  }

  await set(newRef, snap.val());
  await remove(oldRef);

  console.log("Renamed humidity → moistureLevel");
}

renameHumidityToMoisture();
