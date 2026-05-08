import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* NAVIGATION BAR */}
      <nav className="landing-nav">
        <div className="nav-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Akıllı Tarım</span>
        </div>
        <div className="nav-links">
          <a href="#features">Özellikler</a>
          <a href="#services">Hizmetlerimiz</a>
          <a href="#about">Biz Kimiz</a>
        </div>
        <div className="nav-auth">
          <button className="btn-login-outline" onClick={() => navigate("/login")}>Giriş Yap</button>
          <button className="btn-register-solid" onClick={() => navigate("/register")}>Kayıt Ol</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content fade-in">
          <span className="hero-badge">Geleceğin Tarımı Burada</span>
          <h1 className="hero-title">Akıllı Sera Yönetim Sistemi ile Verimi Artırın</h1>
          <p className="hero-desc">
            IoT sensörleri, otomatik sulama ve veri analitiği ile seranızı dünyanın her yerinden kontrol edin. 
            Geleneksel yöntemleri teknoloji ile birleştirerek tarımda yeni bir dönem başlatıyoruz.
          </p>
          <div className="hero-btns">
            <button className="btn-primary-lg" onClick={() => navigate("/register")}>Hemen Başlayın</button>
            <button className="btn-secondary-lg" onClick={() => navigate("/login")}>Sistemi İncele</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-card glass-panel">
            <div className="v-stat">
              <span className="v-icon">💧</span>
              <div>
                <label>Su Tasarrufu</label>
                <strong>%40 Verim</strong>
              </div>
            </div>
            <div className="v-stat">
              <span className="v-icon">☀️</span>
              <div>
                <label>İklim Kontrolü</label>
                <strong>Otomatik</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Akıllı Çözümler</h2>
          <p>Üretiminizi dijitalleştirerek her aşamayı kontrol altında tutun</p>
        </div>
        <div className="features-grid">
          <div className="f-card premium-card">
            <div className="f-icon">📡</div>
            <h3>IoT Sensör Takibi</h3>
            <p>Sıcaklık, nem ve toprak ıslaklığını anlık olarak izleyin, kritik durumlarda bildirim alın.</p>
          </div>
          <div className="f-card premium-card">
            <div className="f-icon">🚰</div>
            <h3>Akıllı Sulama</h3>
            <p>Toprak ihtiyacına göre otomatik veya manuel sulama yaparak su kaynaklarını verimli kullanın.</p>
          </div>
          <div className="f-card premium-card">
            <div className="f-icon">📊</div>
            <h3>Gelişmiş Raporlama</h3>
            <p>Geçmişe dönük verileri analiz ederek hasat verimliliğinizi bilimsel yöntemlerle artırın.</p>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="features-section" style={{background: '#f8fafc'}}>
        <div className="section-header">
          <h2>Hizmetlerimiz</h2>
          <p>Sizlere sunduğumuz profesyonel tarım teknolojileri ve akıllı çözümler</p>
        </div>
        <div className="features-grid">
          <div className="f-card premium-card">
            <div className="f-icon">👨‍🌾</div>
            <h3>Uzman Desteği</h3>
            <p>Ziraat mühendislerimizle seranızı en verimli hale getirin.</p>
          </div>
          <div className="f-card premium-card">
            <div className="f-icon">🤖</div>
            <h3>Otomasyon</h3>
            <p>İnsan hatasını sıfıra indiren tam otomatik sistemler.</p>
          </div>
          <div className="f-card premium-card">
            <div className="f-icon">📱</div>
            <h3>Mobil Kontrol</h3>
            <p>Dünyanın neresinde olursanız olun seranız avucunuzun içinde.</p>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="about-section">
        <div className="about-container premium-card">
          <div className="about-text">
            <h2>Biz Kimiz?</h2>
            <p>
              Akıllı Tarım ekibi olarak, sürdürülebilir bir gelecek için tarımı teknolojiyle güçlendiriyoruz. 
              Amacımız, çiftçilerimizin iş yükünü azaltırken mahsul kalitesini ve miktarını en üst düzeye çıkarmaktır.
            </p>
            <p>
              Yazılım ve donanımı bir araya getiren yenilikçi platformumuzla, tarım arazilerinizi dijital birer işletmeye dönüştürüyoruz.
            </p>
            <button className="btn-primary" onClick={() => navigate("/register")}>Aramıza Katılın</button>
          </div>
          <div className="about-image">
              <video 
                src="/sulama.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="about-video"
                style={{ 
                  width: '70%', 
                  maxHeight: '350px',
                  objectFit: 'cover',
                  margin: '0 auto', 
                  display: 'block',
                  borderRadius: '30px', 
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s'
                }}
              />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-overlay"></div>
        <div className="cta-content">
          <h2>Üretime Hemen Başlayın.</h2>
          <p>Yüzlerce akıllı sera ve binlerce sensör ile tarımda dijital dönüşümün bir parçası olun.</p>
          <button className="btn-register-solid" onClick={() => navigate("/register")}>Ücretsiz Deneyin</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">🌿 Akıllı Tarım</div>
          <div className="footer-copy">© 2026 Akıllı Tarım Sistemleri. Tüm Hakları Saklıdır.</div>
        </div>
      </footer>

      <style>{`
        .landing-page { background: var(--bg-main); min-height: 100vh; overflow-x: hidden; scroll-behavior: smooth; }
        
        /* NAVBAR */
        .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 24px 80px; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: rgba(248, 250, 252, 0.8); backdrop-filter: blur(20px); border-bottom: 1px solid var(--glass-border); }
        .nav-logo { display: flex; align-items: center; gap: 12px; }
        .logo-icon { font-size: 28px; }
        .logo-text { font-size: 24px; font-weight: 900; color: #1e293b; letter-spacing: -1px; }
        .nav-links { display: flex; gap: 40px; }
        .nav-links a { text-decoration: none; color: #64748b; font-weight: 700; font-size: 15px; transition: color 0.2s; }
        .nav-links a:hover { color: var(--primary); }
        .nav-auth { display: flex; gap: 16px; }
        
        .btn-login-outline { background: transparent; border: 2px solid var(--primary); color: var(--primary); padding: 10px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .btn-login-outline:hover { background: var(--primary); color: white; }
        .btn-register-solid { background: var(--primary); border: none; color: white; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 15px rgba(16, 185, 129, 0.2); }
        .btn-register-solid:hover { transform: translateY(-2px); box-shadow: 0 12px 20px rgba(16, 185, 129, 0.3); }

        /* HERO */
        .hero-section { display: grid; grid-template-columns: 1fr 1fr; padding: 180px 80px 100px; gap: 60px; min-height: 90vh; align-items: center; }
        .hero-badge { background: var(--primary-light); color: var(--primary); padding: 8px 16px; border-radius: 100px; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; display: inline-block; margin-bottom: 24px; }
        .hero-title { font-size: 64px; line-height: 1.1; margin-bottom: 24px; font-weight: 900; color: #0f172a; letter-spacing: -2px; }
        .hero-desc { font-size: 20px; color: #64748b; line-height: 1.6; margin-bottom: 40px; font-weight: 500; }
        .hero-btns { display: flex; gap: 20px; }
        .btn-primary-lg { background: var(--primary); color: white; border: none; padding: 18px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 15px 30px rgba(16, 185, 129, 0.2); }
        .btn-secondary-lg { background: white; color: #1e293b; border: 2px solid #e2e8f0; padding: 18px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; transition: all 0.2s; }
        .btn-primary-lg:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3); }
        
        .hero-visual { position: relative; height: 500px; background: url('https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=1000') center; background-size: cover; border-radius: 40px; box-shadow: 0 40px 100px -20px rgba(0,0,0,0.15); }
        .visual-card { position: absolute; bottom: 40px; left: -40px; width: 260px; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .v-stat { display: flex; align-items: center; gap: 12px; }
        .v-icon { width: 44px; height: 44px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 8px 15px rgba(0,0,0,0.05); }
        .v-stat label { display: block; font-size: 12px; color: #64748b; font-weight: 700; }
        .v-stat strong { font-size: 16px; color: #1e293b; font-weight: 800; }

        /* FEATURES */
        .features-section { padding: 120px 80px; background: white; }
        .section-header { text-align: center; margin-bottom: 80px; }
        .section-header h2 { font-size: 44px; margin-bottom: 16px; }
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; }
        .f-card { text-align: center; padding: 50px 40px; }
        .f-icon { font-size: 50px; margin-bottom: 24px; display: inline-block; }
        .f-card h3 { font-size: 24px; margin-bottom: 16px; }
        .f-card p { color: #64748b; line-height: 1.6; }

        /* ABOUT */
        .about-section { padding: 80px; }
        .about-container { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 60px !important; }
        .about-text h2 { font-size: 40px; margin-bottom: 24px; }
        .about-text p { font-size: 18px; color: #64748b; line-height: 1.7; margin-bottom: 24px; }
        .about-image img { width: 100%; border-radius: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }

        /* FOOTER */
        .landing-footer { padding: 60px 80px; border-top: 1px solid #e2e8f0; }
        .footer-content { display: flex; justify-content: space-between; align-items: center; }
        .footer-logo { font-size: 24px; font-weight: 900; color: var(--primary); }
        .footer-copy { color: #94a3b8; font-size: 14px; font-weight: 600; }

        /* CTA SECTION */
        .cta-section { position: relative; padding: 100px 80px; text-align: center; background: url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200') center; background-size: cover; color: white; overflow: hidden; }
        .cta-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(6, 78, 59, 0.85); z-index: 1; }
        .cta-content { position: relative; z-index: 2; max-width: 800px; margin: 0 auto; }
        .cta-content h2 { font-size: 56px; color: white; margin-bottom: 24px; font-weight: 900; letter-spacing: -2px; }
        .cta-content p { font-size: 20px; opacity: 0.9; margin-bottom: 40px; font-weight: 500; }

        @media (max-width: 1024px) {
          .hero-section { grid-template-columns: 1fr; text-align: center; padding: 140px 24px 60px; }
          .hero-title { font-size: 48px; }
          .hero-btns { justify-content: center; }
          .hero-visual { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .about-container { grid-template-columns: 1fr; text-align: center; }
          .nav-links { display: none; }
          .landing-nav { padding: 20px 24px; }
        }
      `}</style>
    </div>
  );
}
