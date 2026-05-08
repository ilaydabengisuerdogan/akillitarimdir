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

export default function Ventilation() {
  const { globalTemp, setGlobalTemp, globalHum, setGlobalHum, climateMode, setClimateMode } = useContext(AppContext);
  const user = getSession();
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "GREENHOUSE_MANAGER";
  
  const [suggestions, setSuggestions] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("CLIMATE_HISTORY");
    return saved ? JSON.parse(saved) : [
      { id: 1, time: "08:15", action: "SOĞUTMA AÇILDI", reason: "Sıcaklık 30°C üzerine çıktı", duration: "45 dk" },
      { id: 2, time: "09:00", action: "SİSTEM DURDURULDU", reason: "İdeal sıcaklığa ulaşıldı", duration: "-" },
      { id: 3, time: "12:30", action: "ISITMA AÇILDI", reason: "Sıcaklık 15°C altına düştü", duration: "60 dk" }
    ];
  });

  const fetchData = async () => {
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    if (!ghId) return;
    try {
      const alerts = await getAlertsByGreenhouse(ghId);
      setSuggestions(alerts.filter(a => a.alertType === "VENTILATION_SUGGESTION"));
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
    localStorage.setItem("CLIMATE_HISTORY", JSON.stringify(history));
  }, [history]);

  const handleAction = (mode) => {
    const now = new Date();
    const actionLabel = mode === "COOL" ? "SOĞUTMA AÇILDI" : mode === "HEAT" ? "ISITMA AÇILDI" : "SİSTEM DURDURULDU";
    
    setClimateMode(mode);
    setHistory([
      { 
        id: Date.now(), 
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
        action: actionLabel, 
        reason: "Manuel Kontrol", 
        duration: "-" 
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
        alertType: "VENTILATION_SUGGESTION",
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
    if (globalTemp > 30 && climateMode !== "COOL") return { text: `Sıcaklık kritik seviyede (${Math.round(globalTemp)}°C). Soğutma başlatılması önerilir.`, type: "cool", action: "COOL" };
    if (globalTemp < 15 && climateMode !== "HEAT") return { text: `Sıcaklık çok düşük (${Math.round(globalTemp)}°C). Don riskine karşı Isıtma başlatın.`, type: "heat", action: "HEAT" };
    if (climateMode !== "OFF" && globalTemp >= 22 && globalTemp <= 25) return { text: `Sıcaklık ideal seviyeye ulaştı (${Math.round(globalTemp)}°C). Enerji tasarrufu için sistemi durdurabilirsiniz.`, type: "info", action: "OFF" };
    return { text: `Sıcaklık dengeli (${Math.round(globalTemp)}°C). Mevcut durum ideal.`, type: "info" };
  };

  const suggestion = getSuggestion();

  return (
    <MainLayout>
      <div className="climate-page">
        <header className="page-header">
          <h1 className="page-title">🌡️ İklim ve Hava Kontrolü</h1>
          <p className="page-subtitle">Global senkronizasyon ve aktif simülasyon özellikli iklim yönetim merkezi.</p>
        </header>

        <div className="climate-grid">
          <section className="premium-card control-main">
            <div className="card-header">
              <h3>Sistem Kontrolü</h3>
              <div className="mode-indicators">
                <span className={`mode-tag heat ${climateMode === 'HEAT' ? 'active' : ''}`}>🔥 ISITMA</span>
                <span className={`mode-tag cool ${climateMode === 'COOL' ? 'active' : ''}`}>❄️ SOĞUTMA</span>
              </div>
            </div>

            <div className="climate-visual">
              <div className={`status-ring ${climateMode}`}>
                <div className="temp-display">
                  <span className="current-val">{Math.round(globalTemp)}°C</span>
                  <span className="status-text">
                    {climateMode === 'OFF' ? 'SİSTEM DURDURULDU' : climateMode === 'HEAT' ? 'ISITMA AKTİF' : 'SOĞUTMA AKTİF'}
                  </span>
                </div>
              </div>
            </div>

            <div className="control-buttons">
              {(!isAdmin && !isManager) ? (
                <>
                  <button 
                    className={`btn-control heat ${climateMode === 'HEAT' ? 'active' : ''}`}
                    onClick={() => handleAction(climateMode === 'HEAT' ? 'OFF' : 'HEAT')}
                  >
                    {climateMode === 'HEAT' ? '🛑 Isıtmayı Durdur' : '🔥 Isıtma Başlat'}
                  </button>
                  <button 
                    className={`btn-control cool ${climateMode === 'COOL' ? 'active' : ''}`}
                    onClick={() => handleAction(climateMode === 'COOL' ? 'OFF' : 'COOL')}
                  >
                    {climateMode === 'COOL' ? '🛑 Soğutma Durdur' : '❄️ Soğutma Başlat'}
                  </button>
                </>
              ) : (
                <p style={{gridColumn: 'span 2', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', background: 'rgba(0,0,0,0.1)', padding: '12px', borderRadius: '8px'}}>
                  İklimlendirme kontrolleri sadece Çiftçi yetkisindedir. (Gözlem Modu)
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
                <input className="input-glass" placeholder="Havalandırma tavsiyesi..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{flex: 1}} />
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
              <div className="panel-icon">{suggestion.type === 'cool' ? '❄️' : suggestion.type === 'heat' ? '🔥' : '✅'}</div>
              <div className="panel-content">
                <p>{suggestion.text}</p>
                {suggestion.action && climateMode !== suggestion.action && (!isAdmin && !isManager) && (
                  <button className="btn-action-apply" onClick={() => handleAction(suggestion.action)}>
                    Öneriyi Şimdi Uygula
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="premium-card logs-panel">
            <div className="card-header">
              <h3>📝 Senkronize İklim Kayıtları</h3>
            </div>
            <div className="log-list">
              {history.map(log => (
                <div key={log.id} className="log-entry glass-panel fade-in">
                  <span className="log-time">{log.time}</span>
                  <div className="log-details">
                    <span className="log-action" style={{color: log.action.includes('ISITMA') ? '#f59e0b' : log.action.includes('SOĞUTMA') ? '#3b82f6' : '#94a3b8'}}>
                      {log.action}
                    </span>
                    <span className="log-reason">{log.reason} (Nem: %{Math.round(globalHum)})</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .climate-page { animation: fadeIn 0.6s ease-out; }
        .climate-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
        .logs-panel { grid-column: span 2; }

        .mode-indicators { display: flex; gap: 8px; }
        .mode-tag { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 4px; opacity: 0.3; border: 1px solid currentColor; }
        .mode-tag.active { opacity: 1; }
        .mode-tag.heat { color: #f59e0b; }
        .mode-tag.cool { color: #3b82f6; }

        .climate-visual { padding: 40px 0; display: flex; justify-content: center; }
        .status-ring { width: 220px; height: 220px; border-radius: 50%; border: 4px solid var(--glass-border); display: flex; align-items: center; justify-content: center; position: relative; transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
        .status-ring.HEAT { border-color: #f59e0b; box-shadow: 0 0 40px rgba(245, 158, 11, 0.3); border-width: 6px; }
        .status-ring.COOL { border-color: #3b82f6; box-shadow: 0 0 40px rgba(59, 130, 246, 0.3); border-width: 6px; }
        
        .temp-display { text-align: center; }
        .current-val { font-size: 56px; font-weight: 800; display: block; color: var(--text-primary); transition: all 0.5s; }
        .status-text { font-size: 12px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; margin-top: 8px; }

        .control-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 32px; }
        .btn-control { padding: 18px; border-radius: 20px; border: 1px solid #e2e8f0; background: white; color: var(--text-primary); font-weight: 700; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .btn-control:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); border-color: #cbd5e1; }
        .btn-control.heat.active { background: #f59e0b; color: white; border-color: #d97706; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3); }
        .btn-control.cool.active { background: #3b82f6; color: white; border-color: #2563eb; box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3); }

        .suggestion-panel { display: flex; gap: 24px; padding: 32px; border-radius: 24px; background: white; border: 1px solid #f1f5f9; box-shadow: var(--shadow-premium); }
        .suggestion-panel.heat { border-left: 6px solid #f59e0b; background: #fffbeb; }
        .suggestion-panel.cool { border-left: 6px solid #3b82f6; background: #eff6ff; }
        .panel-icon { font-size: 40px; }
        .panel-content p { font-size: 15px; line-height: 1.6; margin-bottom: 20px; color: var(--text-primary); font-weight: 600; }
        .btn-action-apply { background: white; color: var(--text-primary); border: 1px solid #e2e8f0; padding: 10px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.02); }
        .btn-action-apply:hover { transform: scale(1.05); background: var(--primary); color: white; border-color: var(--primary); }

        .log-list { display: flex; flex-direction: column; gap: 16px; }
        .log-entry { display: flex; align-items: center; padding: 20px 32px; gap: 32px; animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-10); } to { opacity: 1; transform: translateX(0); } }
        .log-time { font-size: 13px; color: var(--text-muted); font-weight: 700; width: 60px; }
        .log-details { flex: 1; display: flex; flex-direction: column; }
        .log-action { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
        .log-reason { font-size: 12px; color: var(--text-muted); }

        @media (max-width: 1024px) {
          .ventilation-grid { grid-template-columns: 1fr; }
          .logs-panel { grid-column: auto; }
        }
      `}</style>
    </MainLayout>
  );
}
