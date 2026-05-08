const BASE_URL = "http://localhost:8081";

// SENSOR
export const getSensors = async () => {
  const res = await fetch(`${BASE_URL}/sensors`);
  return res.json();
};

export const getSensorData = async () => {
  const res = await fetch(`${BASE_URL}/sensor-data`);
  return res.json();
};

export const getSensorsByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/sensors/greenhouse/${greenhouseId}`);
  return res.json();
};

export const getSensorDataByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/sensor-data/greenhouse/${greenhouseId}`);
  return res.json();
};

export const createSensorData = async (data) => {
  const res = await fetch(`${BASE_URL}/sensor-data`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
};

// AUTH & USERS
export const login = async (credentials) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) throw new Error("Giriş başarısız");
  return res.json();
};

export const registerUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Kayıt başarısız");
  return res.json();
};

export const updateBackendUser = async (email, userData) => {
  const res = await fetch(`${BASE_URL}/users/${email}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) throw new Error("Güncelleme başarısız");
  return res.json();
};

export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const deleteUser = async (email) => {
  const res = await fetch(`${BASE_URL}/users/${email}`, {
    method: "DELETE",
  });
  return res.text();
};

// GREENHOUSE
export const getGreenhouses = async (ownerEmail) => {
  const url = ownerEmail ? `${BASE_URL}/greenhouses?ownerEmail=${ownerEmail}` : `${BASE_URL}/greenhouses`;
  const res = await fetch(url);
  return res.json();
};

export const createGreenhouse = async (record) => {
  const res = await fetch(`${BASE_URL}/greenhouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

export const updateGreenhouse = async (id, record) => {
  const res = await fetch(`${BASE_URL}/greenhouses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

export const deleteGreenhouse = async (id) => {
  const res = await fetch(`${BASE_URL}/greenhouses/${id}`, {
    method: "DELETE",
  });
  return res.text();
};

// CROP PLAN
export const getCropPlans = async () => {
  const res = await fetch(`${BASE_URL}/crop-plans`);
  return res.json();
};

export const createCropPlan = async (record) => {
  const res = await fetch(`${BASE_URL}/crop-plans`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

export const getCropPlansByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/crop-plans/greenhouse/${greenhouseId}`);
  return res.json();
};

export const deleteCropPlan = async (id) => {
  const res = await fetch(`${BASE_URL}/crop-plans/${id}`, {
    method: "DELETE",
  });
  return res.text();
};

// IRRIGATION
export const getIrrigationRecords = async () => {
  const res = await fetch(`${BASE_URL}/irrigation-records`);
  return res.json();
};

export const getIrrigationRecordsByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/irrigation-records/greenhouse/${greenhouseId}`);
  return res.json();
};

export const createIrrigationRecord = async (record) => {
  const res = await fetch(`${BASE_URL}/irrigation-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

// TREATMENT
export const getTreatmentRecords = async () => {
  const res = await fetch(`${BASE_URL}/treatment-records`);
  return res.json();
};

export const getTreatmentRecordsByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/treatment-records/greenhouse/${greenhouseId}`);
  return res.json();
};

export const createTreatmentRecord = async (record) => {
  const res = await fetch(`${BASE_URL}/treatment-records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  return res.json();
};

export const deleteTreatmentRecord = async (id) => {
  const res = await fetch(`${BASE_URL}/treatment-records/${id}`, {
    method: "DELETE",
  });
  return res.text();
};

// ALERTS (Used for Suggestions)
export const getAlerts = async () => {
  const res = await fetch(`${BASE_URL}/alerts`);
  return res.json();
};

export const getAlertsByGreenhouse = async (greenhouseId) => {
  const res = await fetch(`${BASE_URL}/alerts/greenhouse/${greenhouseId}`);
  return res.json();
};

export const createAlert = async (alert) => {
  const res = await fetch(`${BASE_URL}/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(alert),
  });
  return res.json();
};

export const updateAlertStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/alerts/${id}/status?status=${status}`, {
    method: "PATCH",
  });
  return res.json();
};

export const deleteAlert = async (id) => {
  const res = await fetch(`${BASE_URL}/alerts/${id}`, {
    method: "DELETE",
  });
  return res.text();
};
