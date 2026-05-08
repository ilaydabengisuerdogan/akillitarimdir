import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [secretCode, setSecretCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register({
        email,
        password,
        fullName,
        secretCode: secretCode,
      });

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card premium-card fade-in">
        <div className="auth-header">
          <div className="auth-logo">🌱</div>
          <h1>Yeni Hesap</h1>
          <p>Sisteme katılmak için bilgilerinizi girin</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <div className="form-group">
            <label>Ad Soyad</label>
            <input
              type="text"
              className="input-glass"
              placeholder="Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              className="input-glass"
              placeholder="example@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Şifre</label>
            <input
              type="password"
              className="input-glass"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Yetki Kodu (Yönetici/Admin İçin)</label>
            <input
              type="text"
              className="input-glass"
              placeholder="Çiftçiyseniz boş bırakın"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
            />
            <p style={{fontSize: '11px', color: '#666', marginTop: '4px'}}>
              * Admin veya Yönetici hesabı için size verilen özel kodu girin. Çiftçiler için boş bırakılabilir.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Kaydediliyor..." : "Kayıt Ol ve Başla"}
          </button>
        </form>

        <div className="auth-footer">
          Zaten hesabınız var mı? <Link to="/login">Giriş Yap</Link>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: 
            linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)),
            url('https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&q=80&w=1600') center/cover no-repeat fixed;
          padding: 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 60px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.3);
          border-radius: 40px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .auth-logo {
          font-size: 56px;
          margin-bottom: 20px;
          filter: drop-shadow(0 10px 20px var(--primary-glow));
        }

        .auth-header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .auth-header p {
          color: var(--text-secondary);
          font-size: 16px;
          font-weight: 500;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .auth-error {
          padding: 14px;
          background: #fff1f2;
          border: 1px solid #ffe4e6;
          border-radius: 16px;
          color: #e11d48;
          font-size: 14px;
          text-align: center;
          font-weight: 600;
        }

        .auth-footer {
          margin-top: 40px;
          text-align: center;
          font-size: 15px;
          color: var(--text-secondary);
        }

        .auth-footer a {
          color: var(--primary-dark);
          text-decoration: none;
          font-weight: 800;
        }

        select.input-glass {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          padding-right: 48px;
        }
      `}</style>
    </div>
  );
}