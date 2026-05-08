import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { getSession } from "../services/auth";
import { 
  getGreenhouses, 
  getSensorDataByGreenhouse, 
  getIrrigationRecordsByGreenhouse 
} from "../services/api";

export default function Reports() {
  const user = getSession();
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGh, setSelectedGh] = useState("");
  const [dateRange, setDateRange] = useState("WEEK");
  const [stats, setStats] = useState({ avgTemp: 0, avgHum: 0, avgSoil: 0, totalIrrigation: 0 });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportText, setReportText] = useState("");
  const [savedReports, setSavedReports] = useState(() => {
    const saved = localStorage.getItem("ADMIN_REPORTS");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchGH = async () => {
      try {
        const data = await getGreenhouses(user.role === 'ADMIN' ? null : user.email);
        setGreenhouses(data);
        if (data.length > 0) setSelectedGh(data[0].id);
      } catch (err) { console.error(err); }
    };
    fetchGH();
  }, [user]);

  useEffect(() => {
    if (!selectedGh) return;
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const [sensors, irrigation] = await Promise.all([
          getSensorDataByGreenhouse(selectedGh),
          getIrrigationRecordsByGreenhouse(selectedGh)
        ]);
        
        if (sensors.length > 0) {
          const avgTemp = sensors.reduce((acc, s) => acc + s.temperature, 0) / sensors.length;
          const avgHum = sensors.reduce((acc, s) => acc + s.humidity, 0) / sensors.length;
          const avgSoil = sensors.reduce((acc, s) => acc + s.soilMoisture, 0) / sensors.length;
          setStats({
            avgTemp: Math.round(avgTemp),
            avgHum: Math.round(avgHum),
            avgSoil: Math.round(avgSoil),
            totalIrrigation: irrigation.length
          });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchReportData();
  }, [selectedGh]);

  const handleExport = (type) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      alert(`✅ ${type} raporu başarıyla oluşturuldu ve indirildi.`);
    }, 2000);
  };

  const handleDownloadReport = (report) => {
    const content = `
AKILLI TARIM SİSTEMİ - ANALİZ RAPORU
------------------------------------
Başlık: ${report.title}
Tarih: ${report.date}
Sera: ${report.greenhouse}

VERİ ÖZETİ:
- Ortalama Sıcaklık: ${report.stats.avgTemp}°C
- Ortalama Hava Nemi: %${report.stats.avgHum}
- Ortalama Toprak Nemi: %${report.stats.avgSoil}
- Toplam Sulama Sayısı: ${report.stats.totalIrrigation}

ADMİN NOTLARI & ANALİZ:
${report.text}

------------------------------------
Bu rapor sistem tarafından oluşturulmuştur.
    `;

    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Rapor_${report.id}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const handleSaveReport = () => {
    if (!reportText.trim() || !reportTitle.trim()) return alert("Lütfen başlık ve içeriği doldurun.");
    
    const newReport = {
      id: Date.now(),
      title: reportTitle,
      text: reportText,
      date: new Date().toLocaleString('tr-TR'),
      greenhouse: greenhouses.find(g => String(g.id) === String(selectedGh))?.greenhouseName || 'Genel',
      stats: { ...stats }
    };

    const updated = [newReport, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("ADMIN_REPORTS", JSON.stringify(updated));
    alert("✅ Rapor sisteme kaydedildi.");
  };

  const handleNewReport = () => {
    setReportTitle("");
    setReportText("");
  };

  const handleDeleteSavedReport = (id) => {
    if (window.confirm("Bu raporu sistemden silmek istediğinize emin misiniz?")) {
      const updated = savedReports.filter(r => r.id !== id);
      setSavedReports(updated);
      localStorage.setItem("ADMIN_REPORTS", JSON.stringify(updated));
    }
  };

  return (
    <MainLayout>
      <div className="reports-page">
        <header className="page-header">
          <h1 className="page-title">📊 Raporlama ve Analiz</h1>
          <p className="page-subtitle">Sistem verilerini filtreleyin, analiz edin ve dışa aktarın.</p>
        </header>

        <div className="reports-grid">
          <div className="stat-card premium-card">
            <span className="stat-icon">🌡️</span>
            <div className="stat-info">
              <span className="stat-val">{stats.avgTemp}°C</span>
              <span className="stat-lab">Ort. Sıcaklık</span>
            </div>
          </div>
          <div className="stat-card premium-card">
            <span className="stat-icon">💧</span>
            <div className="stat-info">
              <span className="stat-val">%{stats.avgHum}</span>
              <span className="stat-lab">Ort. Hava Nemi</span>
            </div>
          </div>
          <div className="stat-card premium-card">
            <span className="stat-icon">🌱</span>
            <div className="stat-info">
              <span className="stat-val">%{stats.avgSoil}</span>
              <span className="stat-lab">Ort. Toprak Nemi</span>
            </div>
          </div>
          <div className="stat-card premium-card">
            <span className="stat-icon">🌊</span>
            <div className="stat-info">
              <span className="stat-val">{stats.totalIrrigation}</span>
              <span className="stat-lab">Toplam Sulama</span>
            </div>
          </div>

          <section className="premium-card chart-preview-section" style={{height: 'auto'}}>
            <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3>📝 Yeni Rapor Oluştur</h3>
                <p>Sistem verilerini yorumlayın ve kaydedin</p>
              </div>
              <button className="btn-secondary btn-sm" onClick={handleNewReport}>➕ Yeni Temiz Sayfa</button>
            </div>
            <div className="report-writer-form" style={{display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px'}}>
              <input 
                type="text" 
                className="input-glass" 
                placeholder="Rapor Başlığı (Örn: Haftalık Verim Analizi)" 
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
              />
              <textarea 
                className="input-glass" 
                style={{minHeight: '150px', resize: 'none'}} 
                placeholder="Analiz notlarınızı buraya yazın..."
                value={reportText}
                onChange={e => setReportText(e.target.value)}
              />
              <button className="btn-primary" onClick={handleSaveReport}>
                💾 Raporu Sisteme Kaydet
              </button>
            </div>
          </section>

          <section className="premium-card tables-section">
            <div className="card-header">
              <h3>📋 Kayıtlı Raporlar</h3>
              <p>Geçmişte oluşturduğunuz analizler</p>
            </div>
            <div className="saved-reports-list" style={{marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {savedReports.length === 0 ? (
                <p style={{textAlign: 'center', color: 'var(--text-muted)', fontStyle: 'italic', padding: '20px'}}>Henüz kayıtlı rapor bulunmuyor.</p>
              ) : (
                savedReports.map(report => (
                  <div key={report.id} className="glass-panel" style={{padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 4px 0', color: 'white'}}>{report.title}</h4>
                      <p style={{fontSize: '11px', color: 'var(--text-muted)', margin: 0}}>
                        📅 {report.date} | 🌿 {report.greenhouse}
                      </p>
                    </div>
                    <div style={{display: 'flex', gap: '8px'}}>
                      <button className="btn-secondary btn-sm" onClick={() => handleDownloadReport(report)}>📥 İndir</button>
                      <button className="btn-icon danger sm" onClick={() => handleDeleteSavedReport(report.id)}>🗑</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .reports-page { animation: fadeIn 0.6s ease-out; }
        .reports-filter-bar { display: flex; gap: 24px; align-items: flex-end; padding: 24px; margin-bottom: 32px; flex-wrap: wrap; }
        .filter-group { display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
        .filter-group label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .export-actions { display: flex; gap: 12px; margin-left: auto; }

        .reports-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .stat-card { display: flex; align-items: center; gap: 24px; padding: 32px; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        .stat-icon { font-size: 36px; }
        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        .stat-val { display: block; font-size: 28px; font-weight: 800; color: #1e293b; letter-spacing: -0.02em; }
        .stat-lab { font-size: 14px; color: #64748b; font-weight: 700; text-transform: none; }

        .chart-preview-section { grid-column: span 4; height: auto; }
        .chart-placeholder { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; border: 1px dashed #e2e8f0; }
        .pulse-dot { width: 12px; height: 12px; background: var(--primary); border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

        .tables-section { grid-column: span 4; }
        .saved-report-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; transition: all 0.2s; }
        .saved-report-item:hover { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.02); }
        .report-info h4 { font-size: 17px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
        .report-meta { font-size: 13px; font-weight: 600; color: #64748b; }
        
        .badge-status { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 800; }
        .badge-status.ok { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        @media (max-width: 1200px) {
          .reports-grid { grid-template-columns: repeat(2, 1fr); }
          .chart-preview-section, .tables-section { grid-column: span 2; }
        }
      `}</style>
    </MainLayout>
  );
}