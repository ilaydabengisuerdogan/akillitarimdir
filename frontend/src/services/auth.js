const SESSION_KEY = "session";

/* 🔐 LOGIN */
export const loginUser = async (email, password) => {
  const response = await fetch("http://localhost:8081/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Mail veya şifre hatalı");
  }

  const data = await response.json();

  const session = {
    id: data.id,
    fullName: data.fullName,
    email: data.email,
    role: data.role,
    raw: data,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  return session;
};

/* 👤 REGISTER */
export const register = async (userData) => {
  const response = await fetch("http://localhost:8081/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fullName: userData.fullName || userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role || "FARMER",
      secretCode: userData.secretCode,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Kayıt başarısız");
  }

  return await response.json();
};

/* 🔄 SESSION */
export const getSession = () => {
  const session = localStorage.getItem(SESSION_KEY);

  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
};

/* 🚪 LOGOUT */
export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("SELECTED_GREENHOUSE_ID");
};

/* ✏️ USER UPDATE */
export const updateUser = (updatedUser) => {
  const session = getSession();

  const newSession = {
    ...session,
    ...updatedUser,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
};

/* 🔑 RESET PASSWORD */
export const resetPassword = async (email, newPassword) => {
  const response = await fetch("http://localhost:8081/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, newPassword }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Şifre sıfırlanamadı");
  }

  return await response.json();
};