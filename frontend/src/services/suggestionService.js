// src/services/suggestionService.js

// İKİ TARAFTA DA AYNI İSİM OLMAK ZORUNDA
const KEY = "my_app_suggestions"; 

export const getSuggestions = () => {
  const data = localStorage.getItem(KEY);
  const result = data ? JSON.parse(data) : [];
  return result;
};

export const createSuggestion = (message, createdBy, section) => {
  const all = getSuggestions();
  const newItem = {
    id: Date.now(),
    message,
    createdBy,
    section,
    status: "PENDING",
    date: new Date().toLocaleString(),
  };
  localStorage.setItem(KEY, JSON.stringify([newItem, ...all]));
};