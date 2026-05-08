import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../components/MainLayout";
import { AppContext } from "../context/AppContext";
import { getSession } from "../services/auth";
import { 
  getAlertsByGreenhouse, 
  createAlert, 
  updateAlertStatus, 
  deleteAlert 
} from "../services/api";

export default function Lighting() {
  const { globalLight, setGlobalLight, lightingMode, setLightingMode } = useContext(AppContext);
  const user = getSession();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "GREENHOUSE_MANAGER";
  
  const [suggestions, setSuggestions] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("LIGHTING_HISTORY");
    return saved ? JSON.parse(saved) : [
      { id: 1, time: "18:00", action: "AYDINLATMA AÇILDI", reason: "Işık seviyesi 500 Lux altına düştü", status: "AKTİF" },
      { id: 2, time: "22:00", action: "AYDINLATMA KAPATILDI", reason: "Gece döngüsü başladı", status: "KAPALI" }
    ];
  });

  const fetchData = async () => {
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    if (!ghId) return;
    try {
      const alerts = await getAlertsByGreenhouse(ghId);
      setSuggestions(alerts.filter(a => a.alertType === "LIGHTING_SUGGESTION"));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("greenhouseChanged", fetchData);
    return () => window.removeEventListener("greenhouseChanged", fetchData);
  }, []);

  useEffect(() => {
    localStorage.setItem("LIGHTING_HISTORY", JSON.stringify(history));
  }, [history]);

  const handleAction = (mode) => {
    const now = new Date();
    const actionLabel = mode === "ON" ? "AYDINLATMA AÇILDI" : "AYDINLATMA KAPATILDI";
    
    setLightingMode(mode);
    setHistory([
      { 
        id: Date.now(), 
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        action: actionLabel, 
        reason: "Manuel Kontrol", 
        status: mode === "ON" ? "AKTİF" : "KAPALI" 
      }, 
      ...history.slice(0, 9)
    ]);
  };

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    try {
      await createAlert({
        alertType: "LIGHTING_SUGGESTION",
        message: newMsg,
        severity: "INFO",
        greenhouseId: ghId ? Number(ghId) : 1
      });
      setNewMsg("");
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const handleDeleteSuggestion = async (id) => {
    if (window.confirm("Bu öneriyi silmek istiyor musunuz?")) {
      try {
        await deleteAlert(id);
        fetchData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateAlertStatus(id, status);
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const getSuggestion = () => {
    if (globalLight < 1000 && lightingMode !== "ON") return { text: `Işık seviyesi düşük (${Math.round(globalLight)} Lux). Bitki gelişimi için aydınlatma önerilir.`, type: "warn", action: "ON" };
    if (globalLight > 4000 && lightingMode === "ON") return { text: `Işık seviyesi yeterli (${Math.round(globalLight)} Lux). Enerji tasarrufu için kapatabilirsiniz.`, type: "info", action: "OFF" };
    return { text: `Işık seviyesi ideal (${Math.round(globalLight)} Lux). Mevcut durum bitkiler için uygun.`, type: "success" };
  };

  const suggestion = getSuggestion();

  return (
    <MainLayout>
      <div className="lighting-page">
        <header className="page-header">
          <h1 className="page-title">💡 Aydınlatma Kontrolü</h1>
          <p className="page-subtitle">Sera ışık spektrumunu ve fotoperiyot döngüsünü yönetin.</p>
        </header>

        <div className="lighting-grid">
          <section className="premium-card control-main">
            <div className="card-header">
              <h3>Işık Durumu</h3>
              <div className="mode-indicators">
                <span className={`mode-tag light-on ${lightingMode === 'ON' ? 'active' : ''}`}>💡 AÇIK</span>
                <span className={`mode-tag light-off ${lightingMode === 'OFF' ? 'active' : ''}`}>🌙 KAPALI</span>
              </div>
            </div>

            <div className="lighting-visual">
              <div className={`status-ring ${lightingMode}`}>
                <div className="light-display">
                  <span className="current-val">{Math.round(globalLight)}</span>
                  <span className="unit">LUX</span>
                  <span className="status-text">
                    {lightingMode === 'OFF' ? 'GECE MODU' : 'AYDINLATMA AKTİF'}
                  </span>
                </div>
              </div>
            </div>

            <div className="control-buttons">
              {/* Çiftçi kontrol edebilir, Admin/Manager sadece izler */}
              {(user?.role === "FARMER") ? (
                <>
                  <button 
                    className={`btn-control light-on ${lightingMode === 'ON' ? 'active' : ''}`}
                    onClick={() => handleAction(lightingMode === 'ON' ? 'OFF' : 'ON')}
                  >
                    {lightingMode === 'ON' ? '🛑 Işıkları Kapat' : '💡 Işıkları Aç'}
                  </button>
                </>
              ) : (
                <p style={{gridColumn: 'span 2', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px'}}>
                  Işıklandırma kontrolleri sadece Çiftçi yetkisindedir. (Gözlem Modu)
                </p>
              )}
            </div>
          </section>

          <section className="premium-card smart-advisor">
            <div className="card-header">
              <h3>💡 Yönetici Önerileri</h3>
            </div>
            {isManager && (
              <form onSubmit={handleAddSuggestion} style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
                <input className="input-glass" placeholder="Aydınlatma tavsiyesi..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{flex: 1}} />
                <button type="submit" className="btn-primary btn-sm">Yayınla</button>
              </form>
            )}
            <div className="suggestion-list">
              {suggestions.map(s => (
                <div key={s.id} className="suggestion-box glass-panel" style={{padding: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <p style={{fontSize: '13px', margin: 0}}>📢 {s.message}</p>
                    <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>{new Date(s.createdAt || Date.now()).toLocaleString("tr-TR")}</span>
                  </div>
                  <div className="s-actions" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    {isManager ? (
                      <button className="btn-icon danger sm" onClick={() => handleDeleteSuggestion(s.id)}>🗑</button>
                    ) : (user?.role === "FARMER" && s.status === "PENDING") && (
                      <div style={{display: 'flex', gap: '6px'}}>
                        <button className="btn-icon success sm" title="Onayla" onClick={() => handleUpdateStatus(s.id, "ACCEPTED")} style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer'}}>✓</button>
                        <button className="btn-icon danger sm" title="Reddet" onClick={() => handleUpdateStatus(s.id, "REJECTED")} style={{background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer'}}>✕</button>
                      </div>
                    )}
                    <span style={{fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: s.status === 'ACCEPTED' ? '#f0fdf4' : s.status === 'REJECTED' ? '#fef2f2' : '#f8fafc', color: s.status === 'ACCEPTED' ? '#10b981' : s.status === 'REJECTED' ? '#ef4444' : '#64748b'}}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
              {suggestions.length === 0 && <p style={{fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic'}}>Henüz bir öneri yok.</p>}
            </div>

            <div className="card-header" style={{marginTop: '24px'}}>
              <h3>🤖 Sistem Asistanı</h3>
            </div>
            <div className={`suggestion-panel ${suggestion.type}`}>
              <div className="panel-icon">{suggestion.type === 'warn' ? '⚠️' : suggestion.type === 'info' ? 'ℹ️' : '✅'}</div>
              <div className="panel-content">
                <p>{suggestion.text}</p>
                {suggestion.action && lightingMode !== suggestion.action && (user?.role === "FARMER") && (
                  <button className="btn-action-apply" onClick={() => handleAction(suggestion.action)}>
                    Öneriyi Şimdi Uygula
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="premium-card logs-panel">
            <div className="card-header">
              <h3>📝 Aydınlatma Kayıtları</h3>
            </div>
            <div className="log-list">
              {history.map(log => (
                <div key={log.id} className="log-entry glass-panel fade-in">
                  <span className="log-time">{log.time}</span>
                  <div className="log-details">
                    <span className="log-action" style={{color: log.status === 'AKTİF' ? '#fcd34d' : '#94a3b8'}}>
                      {log.action}
                    </span>
                    <span className="log-reason">{log.reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .lighting-page { animation: fadeIn 0.6s ease-out; }
        .lighting-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .logs-panel { grid-column: span 2; }

        .mode-indicators { display: flex; gap: 8px; }
        .mode-tag { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; opacity: 0.3; border: 1px solid currentColor; }
        .mode-tag.active { opacity: 1; }
        .mode-tag.light-on { color: #fcd34d; }
        .mode-tag.light-off { color: #94a3b8; }

        .lighting-visual { padding: 40px 0; display: flex; justify-content: center; }
        .status-ring { width: 220px; height: 220px; border-radius: 50%; border: 4px solid var(--glass-border); display: flex; align-items: center; justify-content: center; position: relative; transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .status-ring.ON { border-color: #fcd34d; box-shadow: 0 0 60px rgba(252, 211, 77, 0.4); border-width: 8px; background: rgba(252, 211, 77, 0.05); }
        
        .light-display { text-align: center; }
        .current-val { font-size: 56px; font-weight: 800; display: block; color: var(--text-primary); }
        .unit { font-size: 14px; font-weight: 700; color: var(--text-muted); }
        .status-text { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 12px; display: block; }

        .control-buttons { display: flex; justify-content: center; margin-top: 32px; }
        .btn-control { width: 100%; max-width: 300px; padding: 18px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; color: var(--text-primary); font-weight: 700; cursor: pointer; transition: all 0.3s; }
        .btn-control.light-on.active { background: #fcd34d; color: #92400e; border-color: #f59e0b; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.2); }

        .suggestion-panel { display: flex; gap: 24px; padding: 32px; border-radius: 24px; background: white; border: 1px solid #f1f5f9; }
        .suggestion-panel.warn { border-left: 6px solid #f59e0b; background: #fffbeb; }
        .suggestion-panel.success { border-left: 6px solid #10b981; background: #f0fdf4; }
        .panel-icon { font-size: 32px; }
        .panel-content p { font-size: 14px; font-weight: 600; margin-bottom: 16px; }

        .log-list { display: flex; flex-direction: column; gap: 12px; }
        .log-entry { display: flex; align-items: center; padding: 16px 24px; gap: 24px; }
        .log-time { font-size: 12px; font-weight: 700; color: var(--text-muted); width: 50px; }
        .log-action { font-size: 13px; font-weight: 800; }
        .log-reason { font-size: 12px; color: var(--text-muted); }

        @media (max-width: 1024px) {
          .lighting-grid { grid-template-columns: 1fr; }
          .logs-panel { grid-column: auto; }
        }
      `}</style>
    </MainLayout>
  );
}
