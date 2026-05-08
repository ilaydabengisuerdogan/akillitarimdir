const KEY = "activities";

// tüm kayıtlar
export const getActivities = () => {
  return JSON.parse(localStorage.getItem(KEY)) || [];
};

// kullanıcıya özel kayıtlar
export const getUserActivities = (email) => {
  const all = getActivities();
  return all.filter(a => a.owner === email);
};

// yeni kayıt ekle
export const addActivity = (activity) => {
  const all = getActivities();
  all.push(activity);
  localStorage.setItem(KEY, JSON.stringify(all));
};