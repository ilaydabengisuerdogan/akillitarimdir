export const analyzeSensors = (sensor) => {
  const alerts = [];

  if (!sensor) return alerts;

  if (sensor.temperature > 30) {
    alerts.push("🔥 Yüksek sıcaklık riski");
  }

  if (sensor.humidity < 40) {
    alerts.push("💧 Düşük nem seviyesi");
  }

  if (sensor.soil < 35) {
    alerts.push("🌱 Toprak nemi düşük");
  }

  return alerts;
};