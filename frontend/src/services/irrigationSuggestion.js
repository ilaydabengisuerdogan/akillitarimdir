let current = null;

export const generateSuggestion = (soil) => {
  if (soil < 35) {
    current = {
      status: "PENDING",
      message: "🌱 Toprak nemi düşük → Sulama öneriliyor",
    };
  } else {
    current = {
      status: "OK",
      message: "✅ Sulama gerekmiyor",
    };
  }

  return current;
};

export const acceptSuggestion = () => {
  if (!current) return null;

  current = {
    status: "ACCEPTED",
    message: "✔ Sulama BAŞLATILDI",
  };

  return current;
};

export const rejectSuggestion = () => {
  if (!current) return null;

  current = {
    status: "REJECTED",
    message: "❌ Sulama reddedildi",
  };

  return current;
};

export const getSuggestion = () => current;