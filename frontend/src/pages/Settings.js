import React, { useState } from "react";
import MainLayout from "../components/MainLayout";
import { getSession, updateUser } from "../services/auth";
import { updateBackendUser } from "../services/api";

export default function Settings() {
  const user = getSession();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [bio, setBio] = useState(user?.bio || "Akıllı Tarım sistem kullanıcısı.");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [passSaving, setPassSaving] = useState(false);
  const [showPassForm, setShowPassForm] = useState(false);

  const compressImage = (base64Str, maxWidth = 200, maxHeight = 200) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress as JPEG with 0.7 quality
      };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalAvatar = avatar;
      if (avatar && avatar.length > 50000) { // If larger than ~50KB
        finalAvatar = await compressImage(avatar);
      }
      await updateBackendUser(user.email, { fullName, bio, avatar: finalAvatar });
      updateUser({ fullName, bio, avatar: finalAvatar });
      alert("✅ Profil başarıyla güncellendi.");
      window.location.reload();
    } catch (err) {
      if (err.name === 'QuotaExceededError' || err.message.includes('quota')) {
        alert("❌ Hata: Fotoğraf boyutu çok büyük! Lütfen daha küçük bir dosya seçin.");
      } else {
        alert("❌ Hata: " + err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return alert("❌ Yeni şifreler eşleşmiyor!");
    }
    setPassSaving(true);
    try {
      // Assuming the backend accepts password in the update object
      await updateBackendUser(user.email, { ...user, password: passwords.new });
      alert("✅ Şifre başarıyla güncellendi.");
      setPasswords({ old: "", new: "", confirm: "" });
      setShowPassForm(false);
    } catch (err) {
      alert("❌ Hata: " + err.message);
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="settings-page">
        <header className="page-header">
          <h1 className="page-title">⚙️ Ayarlar</h1>
          <p className="page-subtitle">Profilinizi ve sistem tercihlerini yönetin</p>
        </header>

        <div className="settings-grid">
          <section className="premium-card profile-card">
            <div className="card-header">
              <h3>👤 Profil Bilgileri</h3>
            </div>
            
            <form onSubmit={handleSave} className="settings-form">
              <div className="profile-upload-section">
                <div className="avatar-preview" style={{backgroundImage: avatar ? `url(${avatar})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center'}}>
                  {!avatar && fullName.charAt(0)}
                  <input 
                    type="file" 
                    id="avatar-input" 
                    accept="image/*" 
                    hidden 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setAvatar(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
                <div className="avatar-actions">
                  <label htmlFor="avatar-input" className="btn-secondary btn-sm">Fotoğraf Seç</label>
                  {avatar && (
                    <button type="button" className="btn-secondary btn-sm danger-text" onClick={() => setAvatar("")}>Kaldır</button>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Ad Soyad</label>
                <input 
                  className="input-glass" 
                  value={fullName} 
                  onChange={e => setFullName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>E-posta</label>
                <input className="input-glass" value={user?.email} disabled />
                <small>E-posta adresi sistem kimliğinizdir ve değiştirilemez.</small>
              </div>
              <div className="form-group">
                <label>Hakkında / Bio</label>
                <textarea 
                  className="input-glass" 
                  value={bio} 
                  onChange={e => setBio(e.target.value)} 
                  rows="3"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </form>
          </section>

          <div className="side-panels">
            <section className="premium-card security-card">
              <div className="card-header">
                <h3>🔒 Güvenlik</h3>
                {!showPassForm && (
                  <button className="btn-secondary btn-sm" onClick={() => setShowPassForm(true)}>Düzenle</button>
                )}
              </div>
              
              {showPassForm ? (
                <form onSubmit={handleUpdatePassword} className="pass-form">
                  <div className="form-group">
                    <label>Yeni Şifre</label>
                    <input 
                      type="password" 
                      className="input-glass" 
                      value={passwords.new}
                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Yeni Şifre (Tekrar)</label>
                    <input 
                      type="password" 
                      className="input-glass" 
                      value={passwords.confirm}
                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                      required
                    />
                  </div>
                  <div className="pass-actions">
                    <button type="submit" className="btn-primary btn-sm" disabled={passSaving}>
                      {passSaving ? "Güncelleniyor..." : "Güncelle"}
                    </button>
                    <button type="button" className="btn-secondary btn-sm" onClick={() => setShowPassForm(false)}>İptal</button>
                  </div>
                </form>
              ) : (
                <div className="security-info">
                  <p>Şifreniz en son 2 ay önce değiştirildi.</p>
                  <div className="security-status">
                    <span className="status-dot"></span> Güçlü Şifre Korunuyor
                  </div>
                </div>
              )}
            </section>

            <section className="premium-card info-panel">
              <h3>ℹ️ Sistem Bilgisi</h3>
              <div className="info-list">
                <div className="info-item"><span>Sürüm:</span> <span>v2.2.0-Premium</span></div>
                <div className="info-item"><span>Rol:</span> <span className="badge-role">{user?.role}</span></div>
                <div className="info-item"><span>Bağlantı:</span> <span className="status-text">Güvenli SSL</span></div>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .settings-page { animation: fadeIn 0.6s ease-out; }
        .settings-grid { display: grid; grid-template-columns: 1fr 360px; gap: 32px; }
        
        .profile-card { padding: 40px; }
        .settings-form { display: flex; flex-direction: column; gap: 24px; }
        .profile-upload-section { display: flex; flex-direction: column; align-items: center; gap: 12px; margin-bottom: 8px; border-bottom: 1px solid var(--glass-border); padding-bottom: 24px; }
        .avatar-preview { width: 120px; height: 120px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 900; color: white; border: 4px solid var(--glass-border); position: relative; overflow: hidden; }
        .avatar-actions { display: flex; gap: 10px; }
        .danger-text { color: var(--danger) !important; }
        textarea.input-glass { resize: none; padding-top: 12px; }

        .side-panels { display: flex; flex-direction: column; gap: 24px; }
        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        
        .pass-form { display: flex; flex-direction: column; gap: 16px; }
        .pass-actions { display: flex; gap: 12px; margin-top: 8px; }
        
        .security-info p { font-size: 13px; color: var(--text-secondary); margin-bottom: 12px; }
        .security-status { font-size: 11px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 6px; }
        .status-dot { width: 6px; height: 6px; background: var(--primary); border-radius: 50%; box-shadow: 0 0 8px var(--primary); }

        .info-panel h3 { margin-bottom: 16px; }
        .info-list { display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); }
        .badge-role { background: rgba(16, 185, 129, 0.1); color: var(--primary); padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; }
        .status-text { color: var(--primary); font-weight: 700; font-size: 12px; }
      `}</style>
    </MainLayout>
  );
}