const KEY = "suggestions";

/* 📥 GET ALL */
export const getSuggestions = () => {
  return JSON.parse(localStorage.getItem(KEY)) || [];
};

/* ➕ CREATE (SECTION EKLENDİ) */
export const createSuggestion = (message, createdBy, section) => {
  const list = getSuggestions();

  const newItem = {
    id: Date.now(),
    message,
    status: "PENDING",
    createdBy,
    section, // 🔥 KRİTİK
    date: new Date().toLocaleString(),
  };

  localStorage.setItem(KEY, JSON.stringify([newItem, ...list]));
  return newItem;
};

/* 🔄 UPDATE */
export const updateSuggestion = (id, status) => {
  const list = getSuggestions().map((s) =>
    s.id === id ? { ...s, status } : s
  );

  localStorage.setItem(KEY, JSON.stringify(list));
};

/* ❌ DELETE (MANAGER İÇİN) */
export const deleteSuggestion = (id) => {
  const list = getSuggestions().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
};