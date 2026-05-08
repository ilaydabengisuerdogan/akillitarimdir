import React, { useState, useEffect, useContext } from "react";
import MainLayout from "../components/MainLayout";
import { AppContext } from "../context/AppContext";
import { getSession } from "../services/auth";
import { 
  getSensorDataByGreenhouse, 
  getIrrigationRecordsByGreenhouse, 
  createIrrigationRecord,
  getAlertsByGreenhouse,
  createAlert,
  updateAlertStatus,
  deleteAlert
} from "../services/api";

export default function Irrigation() {
  const user = getSession();
  const { irrigationStatus, setIrrigationStatus, globalSoil, setGlobalSoil } = useContext(AppContext);
  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "GREENHOUSE_MANAGER";
  
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    if (!ghId) return;

    setLoading(true);
    try {
      const [sensorData, records, alerts] = await Promise.all([
        getSensorDataByGreenhouse(ghId),
        getIrrigationRecordsByGreenhouse(ghId),
        getAlertsByGreenhouse(ghId)
      ]);

      if (sensorData?.length > 0) {
        const latest = sensorData.at(-1);
        // API'den veri gelse bile simülasyon modunda globalSoil öncelikli olabilir
        // Kullanıcının isteği üzerine Dashboard ile paralel olması için globalSoil kullanıyoruz
        if (latest.soilMoisture < 30) setStatus("🚨 Kritik Seviye");
        else if (latest.soilMoisture < 50) setStatus("⚠️ Takip Gerekli");
        else setStatus("✅ Normal Seviye");
      }

      setLogs(records.reverse());
      setSuggestions(alerts.filter(a => a.alertType === "IRRIGATION_SUGGESTION"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    window.addEventListener("greenhouseChanged", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("greenhouseChanged", fetchData);
    };
  }, []);

  const handleManualToggle = async () => {
    const newState = !irrigationStatus;
    setIrrigationStatus(newState);
    
    if (newState) {
      const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
      try {
        await createIrrigationRecord({
          waterAmount: 0,
          irrigationType: "MANUAL_ON",
          greenhouseId: Number(ghId)
        });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };


  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    try {
      await createAlert({
        alertType: "IRRIGATION_SUGGESTION",
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
    if (window.confirm("Bu öneriyi silmek istediğinize emin misiniz?")) {
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
      if (status === "ACCEPTED" && !irrigationStatus) {
        handleManualToggle();
      }
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="irrigation-page">
        <header className="page-header">
          <h1 className="page-title">💧 Sulama ve Nem Kontrolü</h1>
          <p className="page-subtitle">Manuel ve zamanlı sulama sistemleri ile tam kontrol.</p>
        </header>

        <div className="irrigation-grid">
          <div className="left-panel">
            <section className="premium-card control-card">
              <div className="card-header">
                <h3>Sistem Durumu</h3>
                <div className={`status-led ${irrigationStatus ? 'active' : ''}`}></div>
              </div>

              <div className="soil-main">
                <div className="soil-circle">
                  <div className="soil-val">{Math.round(globalSoil)}%</div>
                  <div className="soil-lab">Toprak Nemi</div>
                  {irrigationStatus && <div className="water-drops">💧💧💧</div>}
                </div>
              </div>

              <div className="manual-toggle-section">
                <div className="toggle-info">
                  <span className="toggle-label">Vana Durumu</span>
                  <span className="toggle-val">{irrigationStatus ? "AÇIK" : "KAPALI"}</span>
                </div>
                {(!isAdmin && !isManager) ? (
                  <button 
                    className={`btn-toggle-switch ${irrigationStatus ? 'on' : 'off'}`}
                    onClick={handleManualToggle}
                  >
                    {irrigationStatus ? "Sulamayı Kapat" : "Sulamayı Başlat"}
                  </button>
                ) : (
                  <p className="admin-notice">Vana kontrol yetkisi sadece Çiftçi tarafındadır. (Admin/Yönetici İzleme Modu)</p>
                )}
              </div>

            </section>

            <section className="premium-card suggestions-card">
              <h3>💡 Öneriler</h3>
              {isManager && (
                <form onSubmit={handleAddSuggestion} className="suggestion-form" style={{display: 'flex', gap: '8px', marginBottom: '16px'}}>
                  <input className="input-glass" placeholder="Sulama önerisi yazın..." value={newMsg} onChange={e => setNewMsg(e.target.value)} style={{flex: 1}} />
                  <button type="submit" className="btn-primary btn-sm">Gönder</button>
                </form>
              )}
              <div className="suggestion-list">
                {suggestions.map(s => (
                  <div key={s.id} className="suggestion-box glass-panel" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <p>{s.message}</p>
                      <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                        <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>{s.status}</span>
                        <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>• {new Date(s.createdAt || Date.now()).toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                    <div className="s-btns" style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
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
                {suggestions.length === 0 && <p className="empty-text">Henüz öneri bulunmuyor.</p>}
              </div>
            </section>
          </div>

          <div className="right-panel">
            <section className="premium-card history-card">
              <h3>📜 Sulama Geçmişi</h3>
              <div className="logs-list">
                {logs.map(log => (
                  <div key={log.id} className="log-row glass-panel">
                    <span className="log-type">{log.irrigationType === 'MANUAL_ON' ? 'Manuel Sulama' : 'Zamanlı'}</span>
                    <span className="log-amt">{log.waterAmount > 0 ? `${log.waterAmount} dk` : 'Açıldı'}</span>
                    <span className="log-date">{new Date(log.irrigationTime || Date.now()).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .irrigation-page { animation: fadeIn 0.5s ease-out; }
        .irrigation-grid { display: grid; grid-template-columns: 440px 1fr; gap: 32px; }
        
        .control-card { position: relative; }
        .status-led { width: 10px; height: 10px; border-radius: 50%; background: #4b5563; }
        .status-led.active { background: #10b981; box-shadow: 0 0 12px #10b981; }

        .soil-main { padding: 40px 0; display: flex; justify-content: center; }
        .soil-circle { width: 180px; height: 180px; border-radius: 50%; border: 6px solid var(--glass-border); display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; background: var(--glass-bg); }
        .soil-val { font-size: 40px; font-weight: 800; color: var(--primary); }
        .soil-lab { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
        
        .water-drops { position: absolute; bottom: -20px; font-size: 24px; animation: drip 1s infinite; }
        @keyframes drip { 0% { opacity: 0; transform: translateY(-10px); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateY(10px); } }

        .manual-toggle-section { margin-top: 20px; padding: 20px; background: var(--glass); border-radius: 16px; border: 1px solid var(--glass-border); }
        .toggle-info { display: flex; justify-content: space-between; margin-bottom: 16px; }
        .toggle-label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
        .toggle-val { font-size: 13px; font-weight: 800; color: var(--primary); }
        
        .btn-toggle-switch { width: 100%; padding: 14px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: all 0.2s; }
        .btn-toggle-switch.off { background: var(--primary); color: white; }
        .btn-toggle-switch.on { background: var(--danger); color: white; }

        .admin-notice { font-size: 11px; color: var(--text-muted); font-style: italic; background: rgba(0,0,0,0.1); padding: 8px; border-radius: 4px; text-align: center; }

        .timed-section { margin-top: 24px; text-align: left; }
        .timed-section label { font-size: 12px; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 8px; }
        .timed-controls { display: flex; gap: 12px; }
        .timed-controls .input-glass { flex: 1; }

        .logs-list { display: flex; flex-direction: column; gap: 10px; max-height: 600px; overflow-y: auto; }
        .log-row { padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; }
        .log-type { font-size: 13px; font-weight: 800; color: var(--secondary); }
        .log-amt { font-size: 13px; font-weight: 700; color: white; }
        .log-date { font-size: 11px; color: var(--text-muted); }

        .suggestion-box { padding: 16px; margin-top: 12px; }
        .suggestion-box p { font-size: 13px; line-height: 1.5; color: var(--text-secondary); }
        .s-btns { margin-top: 12px; display: flex; gap: 8px; }

        @media (max-width: 1024px) { .irrigation-grid { grid-template-columns: 1fr; } }
      `}</style>
    </MainLayout>
  );
}