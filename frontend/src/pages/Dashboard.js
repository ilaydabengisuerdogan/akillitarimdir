import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { AppContext } from "../context/AppContext";
import { getSession } from "../services/auth";
import {
  getGreenhouses,
  getSensorsByGreenhouse,
  getSensorDataByGreenhouse,
  createSensorData,
  getIrrigationRecordsByGreenhouse,
  getTreatmentRecordsByGreenhouse,
  getUsers,
  getSensors
} from "../services/api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { globalTemp, globalHum, globalSoil, globalLight, climateMode, lightingMode, irrigationStatus, showSim } = useContext(AppContext);
  const user = getSession();
  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [greenhouses, setGreenhouses] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedGhName, setSelectedGhName] = useState("");
  const [systemStats, setSystemStats] = useState({ users: 0, greenhouses: 0, sensors: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
      const ownerEmail = user?.role === "FARMER" ? user?.email : null;

      const ghList = await getGreenhouses(ownerEmail);
      setGreenhouses(ghList);

      if (user?.role === "ADMIN") {
        const u = await getUsers();
        const s = await getSensors();
        setSystemStats({
          users: u.length || 0,
          greenhouses: ghList.length || 0,
          sensors: s.length || 0
        });
      }

      const currentGh = ghList?.find((g) => String(g.id) === String(ghId));
      setSelectedGhName(currentGh ? currentGh.greenhouseName : "");

      if (!ghId || !currentGh) {
        setData({ labels: [], temperature: [], humidity: [], soil: [], light: [] });
        return;
      }

      const [s, sd, irrRecords, treatRecords] = await Promise.all([
        getSensorsByGreenhouse(ghId),
        getSensorDataByGreenhouse(ghId),
        getIrrigationRecordsByGreenhouse(ghId),
        getTreatmentRecordsByGreenhouse(ghId)
      ]);

      setSensors(s);

      const combinedActivities = [
        ...irrRecords.map(r => ({
          id: `irr-${r.id}`,
          type: "Sulama",
          desc: `${r.irrigationType === 'MANUAL_ON' ? 'Manuel Sulama' : r.irrigationType === 'AUTOMATIC' ? 'Otomatik' : r.irrigationType} (${r.waterAmount} dk)`,
          date: new Date(r.irrigationTime || Date.now()),
          icon: "💧",
          color: "var(--secondary)"
        })),
        ...treatRecords.map(r => ({
          id: `treat-${r.id}`,
          type: r.treatmentType === "gübreleme" ? "Gübreleme" : "İlaçlama",
          desc: r.notes || "İşlem tamamlandı",
          date: new Date(r.appliedDate || Date.now()),
          icon: r.treatmentType === "gübreleme" ? "🌿" : "🧪",
          color: r.treatmentType === "gübreleme" ? "var(--primary)" : "var(--accent)"
        }))
      ].sort((a, b) => b.date - a.date).slice(0, 10);

      setActivities(combinedActivities);

      if (!sd || sd.length === 0) {
        // Sample Data for empty states (Demo Mode)
        const demoLabels = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];
        const demoTemp = [22, 24, 28, 27, 25, 23];
        const demoHum = [60, 55, 45, 48, 52, 58];
        const demoSoil = [40, 38, 35, 36, 38, 42];
        const demoLight = [2000, 3500, 4800, 4200, 2800, 1200];
        setData({ labels: demoLabels, temperature: demoTemp, humidity: demoHum, soil: demoSoil, light: demoLight, isDemo: true });
        return;
      }

      const validData = sd.slice(-12);
      const labels = validData.map((item) =>
        new Date(item.recordedAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
      );

      const temperature = validData.map((item) => item.temperature ?? 0);
      const humidity = validData.map((item) => item.humidity ?? 0);
      const soil = validData.map((item) => item.soilMoisture ?? 0);
      const light = validData.map((item) => item.lightLevel ?? 0);

      setData({ labels, temperature, humidity, soil, light, isDemo: false });
      processIntelligence(temperature.at(-1) || 0, humidity.at(-1) || 0, soil.at(-1) || 0, light.at(-1) || 0);
    } catch (err) {
      console.error(err);
      // Fallback on error
      setData({ labels: ["-"], temperature: [0], humidity: [0], soil: [0], light: [0], isDemo: true });
    } finally {
      setLoading(false);
    }
  };

  const processIntelligence = (temp, hum, soil, light) => {
    const newAlerts = [];
    const newSuggestions = [];

    // Critical Alerts
    if (temp >= 38) newAlerts.push({ text: "Aşırı Sıcaklık: Bitki Stresi Riski", severity: "danger", icon: "🔥" });
    if (temp <= 4) newAlerts.push({ text: "Don Riski: Acil Isıtma Gerekebilir", severity: "danger", icon: "❄️" });
    if (hum >= 90) newAlerts.push({ text: "Aşırı Nem: Mantar Hastalığı Riski", severity: "warning", icon: "🌫️" });
    if (light < 500) newAlerts.push({ text: "Düşük Işık: Fotosentez hızı yavaşlıyor", severity: "warning", icon: "☁️" });

    // Dynamic Suggestions
    if (soil <= 30) {
      newSuggestions.push({ 
        text: `Toprak nemi çok düşük (%${Math.round(soil)}). Bitki kök gelişimi için acil sulama önerilir.`, 
        action: "Sulama Başlat",
        type: "irrigation"
      });
    } else if (soil > 80) {
      newSuggestions.push({
        text: "Toprak aşırı nemli. Kök çürümesini önlemek için sulamayı durdurun.",
        type: "warning"
      });
    }

    if (light > 4000 && temp > 30) {
      newSuggestions.push({
        text: "Yoğun Güneş Işığı & Sıcaklık: Gölgelendirme sistemini aktif etmeniz önerilir.",
        type: "climate"
      });
    }

    if (temp > 28 && hum < 40) {
      newSuggestions.push({
        text: "Sıcak ve Kuru Hava: Transpirasyon hızı çok yüksek. Havalandırmayı azaltıp nemlendirme yapın.",
        type: "climate"
      });
    }

    if (temp > 22 && temp < 26 && hum > 50 && hum < 70) {
      newSuggestions.push({
        text: "İdeal Büyüme Koşulları: Mevcut iklim bitki gelişimi için optimize edilmiş durumda.",
        type: "info"
      });
    }

    if (hum > 85 && temp > 20) {
      newSuggestions.push({
        text: "Hastalık Riski: Yüksek nem ve sıcaklık küf oluşumuna neden olabilir. Havalandırmayı açın.",
        action: "Havalandırma Aç",
        type: "hazard"
      });
    }

    if (temp < 15 && soil < 50) {
      newSuggestions.push({
        text: "Düşük Sıcaklık & Düşük Nem: Bitki metabolizması yavaşlıyor. Hafif sulama ve sıcaklık artışı önerilir.",
        type: "climate"
      });
    }

    setAlerts(newAlerts);
    setSuggestions(newSuggestions);
  };

  useEffect(() => {
    const init = async () => {
      await fetchData();
      setLoading(false);
    };
    init();

    const interval = setInterval(fetchData, 10000);
    window.addEventListener("greenhouseChanged", fetchData);
    return () => {
      clearInterval(interval);
      window.removeEventListener("greenhouseChanged", fetchData);
    };
  }, []);
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: "var(--text-secondary)", font: { weight: '700', size: 12 } } },
      tooltip: { 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        titleColor: '#1e293b',
        bodyColor: '#475569',
        padding: 16, 
        borderRadius: 16,
        borderColor: 'var(--glass-border)',
        borderWidth: 1,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "var(--text-muted)", font: { size: 12, weight: '600' } } },
      y: { 
        grid: { color: "#f1f5f9", drawBorder: false }, 
        ticks: { color: "var(--text-muted)", font: { size: 12, weight: '600' }, padding: 10 } 
      },
    },
  };

  const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
  
  if (loading) {
    return (
      <MainLayout>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '24px'}}>
          <div className="loader-icon" style={{fontSize: '64px', animation: 'bounce 2s infinite'}}>🚜</div>
          <div className="loader-text" style={{fontSize: '20px', fontWeight: '700', color: 'var(--primary-dark)'}}>Tarım Verileri İşleniyor...</div>
        </div>
      </MainLayout>
    );
  }

  if (greenhouses.length === 0) {
    return (
      <MainLayout>
        <div className="empty-dashboard">
          <div className="empty-card premium-card">
            <div className="empty-icon">🌱</div>
            <h2 style={{fontSize: '28px', marginBottom: '16px'}}>Henüz Bir Alanınız Yok</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '32px'}}>Üretime başlamak için lütfen yeni bir sera veya tarım alanı ekleyin.</p>
            <button className="btn-primary" onClick={() => navigate("/greenhouse")} style={{margin: '0 auto'}}>
              Yeni Sera Ekle
            </button>
          </div>
        </div>
        <style>{`
          .empty-dashboard { height: 70vh; display: flex; align-items: center; justify-content: center; }
          .empty-card { text-align: center; max-width: 500px; width: 100%; padding: 60px; }
          .empty-icon { font-size: 80px; margin-bottom: 24px; filter: drop-shadow(0 10px 20px rgba(74,222,128,0.2)); }
        `}</style>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="dashboard-page">
        <header className="page-header">
          <div className="header-info">
            <h1 className="page-title">
              {selectedGhName} 
              <span className="badge-status badge-online">Canlı</span>
              {data?.isDemo && <span className="badge-demo">Demo Modu</span>}
            </h1>
            <p className="page-subtitle">
              {data?.isDemo ? "Şu an için örnek veriler gösteriliyor." : "Gerçek zamanlı sensör analizleri"}
            </p>
          </div>
          
          <div className="header-controls">
            <div className="quick-stats glass-panel">
              <QuickStat label="Sıcaklık" value={`${Math.round(globalTemp)}°C`} color="#ef4444" />
              <QuickStat label="Nem" value={`${Math.round(globalHum)}%`} color="#3b82f6" />
              <QuickStat label="Toprak" value={`${Math.round(globalSoil)}%`} color="var(--primary-dark)" />
              <QuickStat label="Işık" value={`${Math.round(globalLight)} lux`} color="#f59e0b" />
            </div>
          </div>
        </header>

        <div className="dashboard-grid">
          <div className="main-charts">
            {alerts.length > 0 && (
              <div className="alerts-banner fade-in">
                {alerts.map((a, i) => (
                  <div key={i} className={`alert-item ${a.severity}`}>
                    <span className="alert-icon">{a.icon}</span>
                    <span className="alert-text">{a.text}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="charts-container">
              <div className="premium-card chart-card">
                <div className="chart-header">
                  <h3>Sıcaklık Analizi</h3>
                  <span className="chart-unit">Sıcaklık (°C)</span>
                </div>
                <div className="chart-body">
                  {data && data.labels?.length > 0 ? (
                    <Line
                      data={{
                        labels: data.labels,
                        datasets: [{
                          label: "Sıcaklık",
                          data: data.temperature,
                          borderColor: "#ef4444",
                          backgroundColor: "rgba(239, 68, 68, 0.05)",
                          fill: true,
                          tension: 0.4,
                          pointRadius: 4,
                          pointBackgroundColor: "#ef4444",
                          borderWidth: 3
                        }]
                      }}
                      options={chartOptions}
                    />
                  ) : <div className="no-data-msg">Sensör verisi bekleniyor...</div>}
                </div>
              </div>

              <div className="premium-card chart-card">
                <div className="chart-header">
                  <h3>Nem & Toprak</h3>
                  <span className="chart-unit">Yüzde (%)</span>
                </div>
                <div className="chart-body">
                  {data && data.labels?.length > 0 ? (
                    <Bar
                      data={{
                        labels: data.labels,
                        datasets: [
                          { label: "Hava Nemi", data: data.humidity, backgroundColor: "#3b82f6", borderRadius: 8 },
                          { label: "Toprak Nemi", data: data.soil, backgroundColor: "#22c55e", borderRadius: 8 }
                        ]
                      }}
                      options={chartOptions}
                    />
                  ) : <div className="no-data-msg">Sensör verisi bekleniyor...</div>}
                </div>
              </div>

              <div className="premium-card chart-card" style={{gridColumn: 'span 2', minHeight: '350px'}}>
                <div className="chart-header">
                  <h3>Işık Seviyesi (Lux)</h3>
                  <span className="chart-unit">Lux</span>
                </div>
                <div className="chart-body" style={{height: '240px'}}>
                  {data && data.labels?.length > 0 ? (
                    <Line
                      data={{
                        labels: data.labels,
                        datasets: [{
                          label: "Işık Seviyesi",
                          data: data.light,
                          borderColor: "#f59e0b",
                          backgroundColor: "rgba(245, 158, 11, 0.1)",
                          fill: true,
                          tension: 0.4,
                          borderWidth: 3,
                          pointRadius: 4,
                          pointBackgroundColor: "#f59e0b"
                        }]
                      }}
                      options={chartOptions}
                    />
                  ) : <div className="no-data-msg">Sensör verisi bekleniyor...</div>}
                </div>
              </div>
            </div>

            <div className="premium-card intelligence-card">
              <div className="intel-header">
                <h3>💡 Akıllı Analiz</h3>
                <p>Yapay zeka destekli gelişim önerileri</p>
              </div>
              <div className="intel-body">
                {suggestions.length === 0 ? (
                  <div className="no-intel-box">
                    <span style={{fontSize: '32px'}}>✨</span>
                    <p>Şu an için her şey ideal görünüyor. İyi çalışmalar!</p>
                  </div>
                ) : (
                  suggestions.map((s, i) => (
                    <div key={i} className="suggestion-item glass-panel">
                      <div className="suggestion-content">
                        <span className="suggestion-bullet">🌿</span>
                        <p>{s.text}</p>
                      </div>
                      {s.action && (
                        <button className="btn-primary btn-sm" onClick={() => window.location.href='/irrigation'}>
                          {s.action}
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="side-activities">
            <div className="premium-card history-card">
              <div className="card-header">
                <h3>📜 Aktivite Akışı</h3>
              </div>
              <div className="activity-timeline">
                {activities.length === 0 ? (
                  <div className="empty-timeline">Henüz bir işlem yapılmadı.</div>
                ) : (
                  activities.map((act) => (
                    <div key={act.id} className="timeline-item">
                      <div className="timeline-icon" style={{ 
                        background: act.color,
                        boxShadow: `0 8px 16px -4px ${act.color}44`
                      }}>{act.icon}</div>
                      <div className="timeline-info">
                        <div className="act-type">{act.type}</div>
                        <div className="act-desc">{act.desc}</div>
                        <div className="act-time">{act.date.toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .badge-demo { background: #fef9c3; color: #a16207; border: 1px solid #fef08a; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; margin-left: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-online { background: #dcfce7; color: #15803d; padding: 6px 14px; border-radius: 100px; font-size: 11px; font-weight: 800; margin-left: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .dashboard-page { animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 48px; }
        .page-title { font-size: 40px; font-weight: 800; display: flex; align-items: center; letter-spacing: -0.03em; }
        .header-controls { display: flex; align-items: center; gap: 32px; }
        
        .quick-stats { display: flex; gap: 56px; padding: 20px 40px; background: white; border-radius: 28px; box-shadow: var(--shadow-premium); border: 1px solid rgba(0,0,0,0.02); }
        .q-stat { display: flex; flex-direction: column; gap: 6px; }
        .q-lab { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); letter-spacing: 1.2px; }
        .q-val { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
        
        .dashboard-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; }
        .charts-container { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 40px; }
        .chart-card { min-height: 440px; }
        .chart-body { height: 320px; margin-top: 24px; }
        .chart-header h3 { font-size: 20px; font-weight: 800; }
        .chart-unit { font-size: 13px; font-weight: 700; color: var(--text-muted); }
        
        .no-data-msg { height: 100%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-weight: 600; font-size: 15px; }
        
        .alerts-banner { margin-bottom: 40px; }
        .alert-item { padding: 24px 32px; border-radius: 24px; display: flex; align-items: center; gap: 20px; margin-bottom: 20px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
        .alert-item.danger { background: #fff1f2; color: #e11d48; border: 1px solid #ffe4e6; }
        .alert-item.warning { background: #fffbeb; color: #d97706; border: 1px solid #fef3c7; }
        
        .intelligence-card { background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%); }
        .intelligence-card .intel-header { margin-bottom: 32px; }
        .intelligence-card h3 { font-size: 22px; margin-bottom: 6px; }
        .no-intel-box { padding: 60px; text-align: center; background: white; border: 1px solid #f1f5f9; border-radius: 32px; color: var(--primary-dark); font-weight: 700; display: flex; flex-direction: column; gap: 16px; box-shadow: var(--shadow-soft); }
        
        .suggestion-item { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; background: white; border: 1px solid rgba(0,0,0,0.03); border-radius: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.01); transition: transform 0.3s; }
        .suggestion-item:hover { transform: translateX(10px); }
        .suggestion-content { display: flex; align-items: center; gap: 20px; }
        .suggestion-content p { color: var(--text-primary); font-weight: 600; font-size: 16px; line-height: 1.5; }
        .suggestion-bullet { font-size: 24px; }
        
        .history-card { height: 100%; }
        .activity-timeline { display: flex; flex-direction: column; gap: 28px; margin-top: 24px; }
        .timeline-item { display: flex; gap: 20px; align-items: center; padding: 12px; border-radius: 20px; transition: all 0.3s; }
        .timeline-item:hover { background: #f8fafc; transform: scale(1.02); }
        .timeline-icon { width: 52px; height: 52px; border-radius: 18px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; flex-shrink: 0; }
        .act-type { font-size: 15px; font-weight: 800; color: var(--text-primary); }
        .act-desc { font-size: 14px; color: var(--text-secondary); font-weight: 500; margin: 4px 0; }
        .act-time { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
      `}</style>
    </MainLayout>
  );
}

function QuickStat({ label, value, color }) {
  return (
    <div className="q-stat">
      <span className="q-lab">{label}</span>
      <span className="q-val" style={{ color }}>{value}</span>
    </div>
  );
}