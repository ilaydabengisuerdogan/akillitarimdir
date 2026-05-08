import React, { useState, useContext } from "react";
import MainLayout from "../components/MainLayout";
import { AppContext } from "../context/AppContext";

export default function Simulator() {
  const { 
    globalTemp, 
    globalHum, 
    globalSoil,
    showSim, setShowSim 
  } = useContext(AppContext);

  const [localVals, setLocalVals] = useState({
    temp: Math.round(globalTemp),
    hum: Math.round(globalHum),
    soil: Math.round(globalSoil)
  });

  const [localIntel, setLocalIntel] = useState("");

  const processLocalIntel = (t, h, s) => {
    let msg = "";
    if (t > 35) msg += "🚨 Kritik Sıcaklık! Bitkilerde yanma riski var. Soğutma sistemini açmalısınız. ";
    else if (t < 15) msg += "❄️ Düşük Sıcaklık! Don riski veya yavaş büyüme gözlenebilir. Isıtma önerilir. ";
    
    if (s < 30) msg += "💧 Toprak Nemi Kritik! Acil sulama başlatılmalı. ";
    else if (s > 85) msg += "🌊 Aşırı Sulama! Kök çürümesi riski var, sulamayı kesin. ";

    if (h > 90) msg += "🌫️ Yüksek Hava Nemi! Mantar hastalıklarına karşı havalandırma şart. ";
    
    if (!msg) msg = "✅ İdeal Koşullar: Girilen değerlere göre sistem verimli çalışmaktadır.";
    setLocalIntel(msg);
  };

  const handleApply = () => {
    // We no longer update globalTemp/Hum/Soil to keep dashboard clean
    // We just show how the system WOULD react here
    processLocalIntel(localVals.temp, localVals.hum, localVals.soil);
  };

  const handleToggle = () => {
    setShowSim(!showSim);
  };

  return (
    <MainLayout>
      <div className="simulator-page">
        <header className="page-header">
          <h1 className="page-title">🧪 Simülasyon Merkezi</h1>
          <p className="page-subtitle">Sistem davranışlarını test etmek için çevresel değerleri manuel olarak ayarlayın.</p>
        </header>

        <div className="simulator-grid">
          <div className="control-panel premium-card">
            <div className="card-header">
              <h3>Sistem Modu</h3>
              <div className={`mode-badge ${showSim ? 'active' : 'real'}`}>
                {showSim ? "SİMÜLASYON AKTİF" : "GERÇEK VERİ MODU"}
              </div>
            </div>

            <div className="toggle-wrapper">
              <p style={{fontSize: '19px', color: '#1e293b', letterSpacing: '-0.01em'}}>Simülasyon modunu açarak sensör verilerini manuel olarak manipüle edebilir ve sistem tepkilerini test edebilirsiniz.</p>
              <button className={`btn-sim-toggle ${showSim ? 'active' : ''}`} onClick={handleToggle}>
                {showSim ? "Simülasyonu Kapat" : "Simülasyonu Başlat"}
              </button>
            </div>

            {showSim && (
              <div className="manual-inputs fade-in">
                <div className="input-row">
                  <label>🌡️ Sıcaklık (°C)</label>
                  <input 
                    type="range" min="0" max="50" 
                    value={localVals.temp} 
                    onChange={e => setLocalVals({...localVals, temp: e.target.value})} 
                  />
                  <span className="val-display">{localVals.temp}°C</span>
                </div>

                <div className="input-row">
                  <label>🌫️ Nem (%)</label>
                  <input 
                    type="range" min="0" max="100" 
                    value={localVals.hum} 
                    onChange={e => setLocalVals({...localVals, hum: e.target.value})} 
                  />
                  <span className="val-display">%{localVals.hum}</span>
                </div>

                <div className="input-row">
                  <label>🌱 Toprak Nemi (%)</label>
                  <input 
                    type="range" min="0" max="100" 
                    value={localVals.soil} 
                    onChange={e => setLocalVals({...localVals, soil: e.target.value})} 
                  />
                  <span className="val-display">%{localVals.soil}</span>
                </div>

                <button className="btn-primary w-full" onClick={handleApply}>Simülasyonu Analiz Et</button>
              </div>
            )}

            {showSim && localIntel && (
              <div className="simulation-intel glass-panel fade-in" style={{marginTop: '24px', padding: '20px', borderLeft: '4px solid var(--primary)'}}>
                <h4 style={{marginBottom: '10px', color: 'var(--primary)'}}>🤖 Yapay Zeka Simülasyon Analizi</h4>
                <p style={{fontSize: '15px', lineHeight: '1.6', color: 'var(--text-primary)', fontWeight: '600'}}>{localIntel}</p>
              </div>
            )}
          </div>

          <div className="info-panel premium-card">
            <h3>Nasıl Çalışır?</h3>
            <ul className="info-list">
              <li><strong>Eşik Testleri:</strong> Düşük nem veya yüksek sıcaklık değerleri girerek uyarı sistemlerini test edebilirsiniz.</li>
              <li><strong>Karar Destek:</strong> Yapay zeka önerilerinin girdiğiniz değerlere göre nasıl değiştiğini Dashboard'dan izleyebilirsiniz.</li>
              <li><strong>Sıfırlama:</strong> Simülasyonu kapattığınızda sistem otomatik olarak gerçek saha verilerine geri döner.</li>
            </ul>
            <div className="sim-status-live glass-panel" style={{
              borderColor: showSim ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              background: showSim ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)'
            }}>
              <h4 style={{color: showSim ? 'var(--primary)' : '#1e293b'}}>Canlı Sistem Değerleri {showSim && "(SİM)"}</h4>
              <div className="live-vals">
                <div className="v-item">
                  <span>Sıcaklık:</span> 
                  <strong style={{color: showSim ? 'var(--primary)' : '#1e293b'}}>
                    {showSim ? localVals.temp : Math.round(globalTemp)}°C
                  </strong>
                </div>
                <div className="v-item">
                  <span>Nem:</span> 
                  <strong style={{color: showSim ? 'var(--primary)' : '#1e293b'}}>
                    %{showSim ? localVals.hum : Math.round(globalHum)}
                  </strong>
                </div>
                <div className="v-item">
                  <span>Toprak:</span> 
                  <strong style={{color: showSim ? 'var(--primary)' : '#1e293b'}}>
                    %{showSim ? localVals.soil : Math.round(globalSoil)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .simulator-page { animation: fadeIn 0.5s; }
        .simulator-grid { display: grid; grid-template-columns: 1fr 400px; gap: 32px; margin-top: 24px; }
        
        .mode-badge { padding: 8px 16px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 0.5px; }
        .mode-badge.active { background: #064e3b; color: #a7f3d0; border: 1px solid #065f46; }
        .mode-badge.real { background: #1e3a8a; color: #bfdbfe; border: 1px solid #1e40af; }

        .toggle-wrapper { padding: 24px 0; border-bottom: 1px solid var(--glass-border); margin-bottom: 24px; }
        .toggle-wrapper p { font-size: 18px; color: var(--text-primary); margin-bottom: 20px; font-weight: 700; line-height: 1.4; }

        .btn-sim-toggle { width: 100%; padding: 16px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; transition: all 0.3s; background: white; color: #1e293b; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .btn-sim-toggle.active { background: var(--danger); color: white; border-color: transparent; }
        .btn-sim-toggle:hover { transform: translateY(-2px); }

        .manual-inputs { display: flex; flex-direction: column; gap: 24px; }
        .input-row { display: flex; flex-direction: column; gap: 12px; }
        .input-row label { font-size: 13px; font-weight: 700; color: var(--text-secondary); }
        .val-display { font-size: 18px; font-weight: 800; color: var(--primary); text-align: right; }

        input[type="range"] { -webkit-appearance: none; width: 100%; height: 6px; background: var(--glass-border); border-radius: 5px; outline: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: var(--primary); border-radius: 50%; cursor: pointer; transition: 0.2s; box-shadow: 0 0 10px var(--primary-glow); }

        .info-list { list-style: none; padding: 0; margin: 20px 0; }
        .info-list li { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.6; }
        .info-list strong { color: white; }

        .sim-status-live { margin-top: auto; padding: 20px; }
        .live-vals { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
        .v-item { display: flex; justify-content: space-between; font-size: 14px; }
        .v-item span { color: var(--text-muted); }
        .v-item strong { color: var(--primary); }

        .w-full { width: 100%; }

        @media (max-width: 1024px) { .simulator-grid { grid-template-columns: 1fr; } }
      `}</style>
    </MainLayout>
  );
}
