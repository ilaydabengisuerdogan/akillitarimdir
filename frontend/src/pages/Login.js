import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginUser(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* VISUAL SIDE */}
        <div className="auth-visual">
          <div className="visual-overlay"></div>
          <div className="visual-content">
            <span className="v-badge">Akıllı Tarım v2.0</span>
            <h2>Geleceğin Tarımı <br/> Şimdiden Hazır</h2>
            <p>IoT tabanlı izleme ve otomasyon sistemleri ile verimliliğinizi profesyonelce yönetin.</p>
            <div className="v-features">
              <div className="v-feat"><span>✓</span> 7/24 Canlı İzleme</div>
              <div className="v-feat"><span>✓</span> Yapay Zeka Destekli Analiz</div>
            </div>
          </div>
        </div>

        {/* FORM SIDE */}
        <div className="auth-form-side">
          <div className="auth-card premium-card">
            <div className="auth-header">
              <div className="auth-logo">🌿</div>
              <h1>Giriş Paneli</h1>
              <p>Hesabınıza giriş yaparak sisteminizi yönetmeye başlayın.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
              {error && <div className="auth-error">{error}</div>}
              
              <div className="form-group">
                <label>Kurumsal E-posta</label>
                <input
                  type="email"
                  className="input-glass"
                  placeholder="admin@akillitarim.com"
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

              <div className="auth-actions">
                <Link to="/forgot-password">Şifremi Unuttum</Link>
              </div>

              <button type="submit" className="btn-primary-auth" disabled={loading}>
                {loading ? "Giriş Yapılıyor..." : "Sisteme Giriş Yap"}
              </button>
            </form>

            <div className="auth-footer">
              Hesabınız yok mu? <Link to="/register">Hemen Kayıt Olun</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: 
            linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)),
            url('https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=1600') center/cover no-repeat fixed;
          padding: 40px;
        }

        .auth-container {
          width: 100%;
          max-width: 1100px;
          height: 700px;
          display: flex;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 50px 150px -20px rgba(0,0,0,0.4);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* VISUAL SIDE */
        .auth-visual {
          flex: 1;
          position: relative;
          background: url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=1000') center;
          background-size: cover;
          display: flex;
          align-items: center;
          padding: 60px;
        }

        .visual-overlay {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(16, 185, 129, 0.6) 100%);
        }

        .visual-content {
          position: relative;
          z-index: 1;
          color: white;
        }

        .v-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 800;
          backdrop-filter: blur(10px);
          margin-bottom: 24px;
          display: inline-block;
        }

        .visual-content h2 {
          font-size: 48px;
          line-height: 1.1;
          font-weight: 900;
          margin-bottom: 24px;
          color: white;
          letter-spacing: -2px;
        }

        .visual-content p {
          font-size: 18px;
          opacity: 0.9;
          line-height: 1.6;
          margin-bottom: 40px;
          max-width: 400px;
        }

        .v-features { display: flex; flex-direction: column; gap: 16px; }
        .v-feat { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 15px; }
        .v-feat span { width: 24px; height: 24px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; }

        /* FORM SIDE */
        .auth-form-side {
          width: 500px;
          background: #ffffff;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-card {
          width: 100%;
          box-shadow: none !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
        }

        .auth-header { margin-bottom: 40px; }
        .auth-logo { font-size: 48px; margin-bottom: 16px; }
        .auth-header h1 { font-size: 32px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
        .auth-header p { color: #64748b; font-size: 15px; font-weight: 600; }

        .auth-form { display: flex; flex-direction: column; gap: 20px; }
        .auth-error { padding: 12px; background: #fff1f2; border-radius: 12px; color: #e11d48; font-size: 13px; font-weight: 700; text-align: center; }
        
        .auth-actions { display: flex; justify-content: flex-end; }
        .auth-actions a { font-size: 13px; font-weight: 800; color: #10b981; text-decoration: none; }

        .btn-primary-auth {
          background: #10b981;
          color: white;
          border: none;
          padding: 16px;
          border-radius: 16px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3);
        }
        .btn-primary-auth:hover { transform: translateY(-2px); background: #059669; }

        .auth-footer { margin-top: 40px; text-align: center; font-size: 14px; color: #64748b; font-weight: 600; }
        .auth-footer a { color: #10b981; font-weight: 900; text-decoration: none; }

        @media (max-width: 1024px) {
          .auth-visual { display: none; }
          .auth-form-side { width: 100%; }
          .auth-container { max-width: 500px; height: auto; }
        }
      `}</style>
    </div>
  );
}