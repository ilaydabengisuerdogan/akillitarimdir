import { useState } from "react";
import { resetPassword } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");

    if (!email || !newPassword) {
      setError("Email ve yeni şifre zorunludur");
      return;
    }

    try {
      await resetPassword(email, newPassword);

      alert("Şifre başarıyla güncellendi 🔑");
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🔐 Şifre Sıfırla</h2>
        <p style={styles.subtitle}>Yeni şifrenizi belirleyin</p>

        <input
          style={styles.input}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Yeni Şifre"
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
        />

        {error && <div style={styles.error}>{error}</div>}

        <button style={styles.button} onClick={handleReset}>
          Şifreyi Güncelle
        </button>

        <p style={styles.link}>
          <Link to="/">Girişe dön</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1b5e20, #66bb6a)",
  },
  card: {
    width: 380,
    padding: 30,
    borderRadius: 16,
    background: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  title: {
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 12,
    margin: "8px 0",
    borderRadius: 10,
    border: "1px solid #ddd",
  },
  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
    border: "none",
    background: "#2e7d32",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
  error: {
    color: "red",
    fontSize: 13,
  },
  link: {
    marginTop: 10,
    fontSize: 13,
  },
};