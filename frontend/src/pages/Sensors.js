import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { getSensorsByGreenhouse, getSensorDataByGreenhouse } from "../services/api";

export default function Sensors() {
  const [sensors, setSensors] = useState([]);
  const [sensorDataMap, setSensorDataMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
      if (!ghId) {
        setLoading(false);
        return;
      }
      try {
        const [sList, sData] = await Promise.all([
          getSensorsByGreenhouse(ghId),
          getSensorDataByGreenhouse(ghId)
        ]);
        
        setSensors(sList);

        const dataMap = {};
        sData.forEach(item => {
          if (!dataMap[item.sensorId] || new Date(item.recordedAt) > new Date(dataMap[item.sensorId].recordedAt)) {
            dataMap[item.sensorId] = item;
          }
        });
        setSensorDataMap(dataMap);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    window.addEventListener("greenhouseChanged", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("greenhouseChanged", fetchData);
    };
  }, []);

  return (
    <MainLayout>
      <div className="sensors-grid-page">
        <header className="page-header">
          <h1 className="page-title">📈 Sensör Veri Akışı</h1>
          <p className="page-subtitle">Sera içerisindeki her bir metrik için müstakil anlık izleme panelleri.</p>
        </header>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Veriler senkronize ediliyor...</p>
          </div>
        ) : sensors.length === 0 ? (
          <div className="premium-card empty-card">
            <div className="empty-icon">📡</div>
            <h2>Veri Bulunamadı</h2>
            <p>Seçili alan için henüz aktif bir sensör verisi kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="metrics-master-grid">
            {sensors.flatMap(s => {
              const latest = sensorDataMap[s.id];
              return [
                { id: `${s.id}-temp`, type: "Sıcaklık", value: latest?.temperature, unit: "°C", icon: "🌡️", color: "#ef4444", sName: s.sensorType, sId: s.id },
                { id: `${s.id}-hum`, type: "Hava Nemi", value: latest?.humidity, unit: "%", icon: "💧", color: "#3b82f6", sName: s.sensorType, sId: s.id },
                { id: `${s.id}-soil`, type: "Toprak Nemi", value: latest?.soilMoisture, unit: "%", icon: "🌿", color: "#10b981", sName: s.sensorType, sId: s.id }
              ];
            }).map(metric => (
              <div key={metric.id} className="metric-box premium-card fade-in">
                <div className="metric-header">
                  <span className="metric-icon" style={{background: `${metric.color}15`, color: metric.color}}>{metric.icon}</span>
                  <div className="metric-info">
                    <h3>{metric.type}</h3>
                    <span className="source-label">{metric.sName} (#{metric.sId})</span>
                  </div>
                </div>
                
                <div className="metric-body">
                  <div className="value-display">
                    <span className="main-value" style={{color: metric.color}}>
                      {metric.value !== undefined ? metric.value.toFixed(1) : "--"}
                    </span>
                    <span className="unit-label">{metric.unit}</span>
                  </div>
                  
                  <div className="mini-graph">
                    {/* Placeholder for small trend line */}
                    <div className="trend-line" style={{background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)`}}></div>
                  </div>
                </div>

                <div className="metric-footer">
                  <span className="status-dot" style={{background: metric.value !== undefined ? '#10b981' : '#64748b'}}></span>
                  <span className="status-text">{metric.value !== undefined ? "Canlı" : "Çevrimdışı"}</span>
                  <span className="update-time">{metric.value !== undefined ? "Anlık" : "--"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sensors-grid-page { animation: fadeIn 0.5s ease-out; }
        .metrics-master-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        
        .metric-box { padding: 24px; display: flex; flex-direction: column; gap: 20px; transition: transform 0.3s; }
        .metric-box:hover { transform: translateY(-5px); border-color: var(--primary); }
        
        .metric-header { display: flex; align-items: center; gap: 16px; }
        .metric-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .metric-info h3 { font-size: 16px; margin-bottom: 2px; }
        .source-label { font-size: 10px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }

        .value-display { display: flex; align-items: baseline; gap: 4px; margin: 10px 0; }
        .main-value { font-size: 36px; font-weight: 800; }
        .unit-label { font-size: 16px; color: var(--text-muted); font-weight: 600; }

        .mini-graph { height: 4px; background: rgba(255,255,255,0.05); border-radius: 100px; overflow: hidden; position: relative; }
        .trend-line { position: absolute; top: 0; left: 0; height: 100%; width: 100%; animation: scan 2s infinite linear; }
        @keyframes scan { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }

        .metric-footer { display: flex; align-items: center; gap: 8px; border-top: 1px solid var(--glass-border); padding-top: 16px; margin-top: auto; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; }
        .status-text { font-size: 11px; font-weight: 700; color: var(--text-secondary); }
        .update-time { font-size: 11px; color: var(--text-muted); margin-left: auto; }

        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px; gap: 20px; }
        .spinner { width: 40px; height: 40px; border: 3px solid var(--glass); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s infinite linear; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </MainLayout>
  );
}
