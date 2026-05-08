import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import {
  getCropPlansByGreenhouse,
  createCropPlan,
  deleteCropPlan,
  getAlertsByGreenhouse,
  createAlert,
  updateAlertStatus,
  deleteAlert,
  getGreenhouses
} from "../services/api";
import { getSession } from "../services/auth";

const PREDEFINED_CROPS = [
  { name: "Domates", icon: "🍅" },
  { name: "Salatalık", icon: "🥒" },
  { name: "Biber", icon: "🫑" },
  { name: "Çilek", icon: "🍓" },
  { name: "Patlıcan", icon: "🍆" },
  { name: "Soğan", icon: "🧅" },
  { name: "Patates", icon: "🥔" },
  { name: "Bamya", icon: "🍲" },
  { name: "Kuşkonmaz", icon: "🎋" },
  { name: "Kabak", icon: "🥒" },
  { name: "Ispanak", icon: "🌿" },
  { name: "Havuç", icon: "🥕" },
  { name: "Limon", icon: "🍋" }
];

export default function Calendar() {
  const user = getSession();
  const isManager = user?.role === "GREENHOUSE_MANAGER";
  const isAdmin = user?.role === "ADMIN";
  const isFarmer = user?.role === "FARMER";

  const [product, setProduct] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [harvestDate, setHarvestDate] = useState("");
  const [notes, setNotes] = useState("");
  const [plans, setPlans] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestionMsg, setNewSuggestionMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGh, setSelectedGh] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    if (!ghId) return;
    setSelectedGh(ghId);

    setLoading(true);
    try {
      const [records, alerts, ghList] = await Promise.all([
        getCropPlansByGreenhouse(ghId),
        getAlertsByGreenhouse(ghId),
        getGreenhouses(user?.role === "FARMER" ? user.email : null)
      ]);

      setPlans(records.map(r => ({
        id: r.id,
        product: r.cropName,
        date: r.plantingDate,
        harvestDate: r.harvestDate,
        notes: r.notes,
        greenhouseName: r.greenhouseName
      })).reverse());
      setSuggestions(alerts.filter(a => a.alertType === "CALENDAR_SUGGESTION"));
      setGreenhouses(ghList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener("greenhouseChanged", fetchData);
    return () => window.removeEventListener("greenhouseChanged", fetchData);
  }, []);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    if (!product || !date) return;
    
    setSubmitting(true);
    try {
      await createCropPlan({
        cropName: product,
        plantingDate: date,
        harvestDate: harvestDate || date,
        status: "PLANTED",
        notes: notes,
        greenhouseId: Number(selectedGh)
      });
      setProduct("");
      setNotes("");
      setSearchTerm("");
      fetchData();
    } catch(err) {
      alert("Hata: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id) => {
    if (window.confirm("Bu planı silmek istiyor musunuz?")) {
      try {
        await deleteCropPlan(id);
        fetchData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const getDaysDiff = (targetDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  };

  const filteredCrops = PREDEFINED_CROPS.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestionMsg.trim()) return;
    try {
      await createAlert({
        alertType: "CALENDAR_SUGGESTION",
        message: newSuggestionMsg,
        severity: "INFO",
        greenhouseId: Number(selectedGh)
      });
      setNewSuggestionMsg("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAlertStatus = async (id, status) => {
    try {
      await updateAlertStatus(id, status);
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

  const handleGhChange = (e) => {
    const val = e.target.value;
    setSelectedGh(val);
    localStorage.setItem("SELECTED_GREENHOUSE_ID", val);
    window.dispatchEvent(new Event("greenhouseChanged"));
  };

  return (
    <MainLayout>
      <div className="calendar-page">
        {/* TOP SELECTOR FOR MANAGERS/ADMINS */}
        {(isManager || isAdmin) && (
          <div className="gh-selector-bar glass-panel">
            <label>📊 İncelemek İstediğiniz Sera:</label>
            <select value={selectedGh} onChange={handleGhChange} className="input-glass">
              {greenhouses.map(g => (
                <option key={g.id} value={g.id}>{g.greenhouseName} - {g.location}</option>
              ))}
            </select>
          </div>
        )}

        <div className={`calendar-grid ${(isManager || isAdmin) ? 'manager-view' : ''}`}>
          {/* LEFT PANEL: FORM (FARMER) OR SUGGESTION PANEL (MANAGER) */}
          {user?.role === "FARMER" ? (
            <div className="left-panel">
              <header className="form-header">
                <div className="plus-icon">+</div>
                <h2>Yeni Ekim Tanımla</h2>
              </header>

              <form onSubmit={handleSavePlan} className="premium-form">
                <div className="form-section">
                  <label className="section-label">SERA ÜRETİM SAHASI</label>
                  <select 
                    className="input-glass select-full" 
                    value={selectedGh} 
                    onChange={handleGhChange}
                  >
                    {greenhouses.map(g => (
                      <option key={g.id} value={g.id}>{g.greenhouseName} - {g.location}</option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label className="section-label">MAHSUL SEÇİMİ</label>
                  <input 
                    type="text" 
                    className="input-glass search-bar" 
                    placeholder="Mahsul ara veya yeni ekle..." 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setProduct(e.target.value);
                    }}
                  />
                  
                  <div className="crop-grid">
                    {filteredCrops.map(crop => (
                      <div 
                        key={crop.name} 
                        className={`crop-item ${product === crop.name ? 'selected' : ''}`}
                        onClick={() => {
                          setProduct(crop.name);
                          setSearchTerm(crop.name);
                        }}
                      >
                        <span className="crop-icon">{crop.icon}</span>
                        <span className="crop-name">{crop.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-section">
                    <label className="section-label">EKİM TARİHİ</label>
                    <input type="date" className="input-glass" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div className="form-section">
                    <label className="section-label">HASAT (TAHMİNİ)</label>
                    <input type="date" className="input-glass" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} />
                  </div>
                </div>

                <div className="form-section">
                  <label className="section-label">NOTLAR / AÇIKLAMA</label>
                  <textarea className="input-glass textarea-sm" placeholder="Notlar..." value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <button type="submit" className="btn-save-plan" disabled={submitting}>
                  {submitting ? "Tanımlanıyor..." : "Planı Sisteme Kaydet"}
                </button>
              </form>
            </div>
          ) : isManager ? (
            <div className="left-panel manager-left">
              <div className="manager-suggestion-panel premium-card">
                <header className="s-header">
                  <h3>💡 Ekim ve Bakım Önerisi Yap</h3>
                </header>
                <form onSubmit={handleAddSuggestion} className="s-form">
                  <textarea 
                    className="input-glass" 
                    placeholder="Bu sera için ekim veya bakım tavsiyesi yazın..." 
                    value={newSuggestionMsg}
                    onChange={e => setNewSuggestionMsg(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">Öneriyi Yayınla</button>
                </form>
                <div className="s-history">
                  <h4 className="s-history-title">Öneri Geçmişi</h4>
                  {suggestions.map(s => (
                    <div key={s.id} className="s-box glass-panel">
                      <div className="s-content">
                        <p>{s.message}</p>
                        <span className="s-date">{new Date(s.createdAt).toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="s-actions">
                        <button className="btn-icon danger" onClick={() => handleDeleteSuggestion(s.id)}>🗑</button>
                      </div>
                    </div>
                  ))}
                  {suggestions.length === 0 && <p className="no-s">Henüz öneri yok.</p>}
                </div>
              </div>
            </div>
          ) : (
            /* ADMIN VIEW: No Left Panel, Grid will be single column or handled by CSS */
            null
          )}

          {/* RIGHT PANEL: LIST */}
          <div className="right-panel">
            {/* Farmer & Admin View suggestions */}
            {(isFarmer || isAdmin) && (
              <div className="farmer-suggestion-view premium-card" style={{border: isAdmin ? '2px solid #10b981' : '1px solid #f1f5f9'}}>
                <div className="s-view-header">
                  <span className="s-badge-icon">💡</span>
                  <h3>Sera Yöneticisi Önerileri</h3>
                </div>
                <div className="s-history">
                  {suggestions.length > 0 ? (
                    suggestions.map(s => (
                      <div key={s.id} className="s-box glass-panel">
                        <div className="s-content">
                          <p>{s.message}</p>
                          <span className="s-date">{new Date(s.createdAt).toLocaleString("tr-TR")}</span>
                        </div>
                        <div className="s-actions">
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-s-msg">Henüz bu sera için bir öneri bulunmamaktadır.</p>
                  )}
                </div>
              </div>
            )}

            {loading ? (
              <div className="loading-state">Yükleniyor...</div>
            ) : plans.length === 0 ? (
              <div className="empty-state-v2">Henüz aktif bir ekim planı bulunmuyor.</div>
            ) : (
              <div className="plans-v2-list">
                <h2 className="panel-title">Ekim Geçmişi ve Planlar</h2>
                {plans.map(p => {
                  const cropInfo = PREDEFINED_CROPS.find(c => c.name === p.product) || { icon: "🌱" };
                  const diff = getDaysDiff(p.harvestDate || p.date);
                  const isPast = diff < 0;

                  return (
                    <div key={p.id} className="plan-card-v2">
                      <div className="p-main">
                        <div className="p-icon-box">{cropInfo.icon}</div>
                        <div className="p-header-info">
                          <div className="p-title-row">
                            <h3>{p.product?.toLowerCase() || "isimsiz mahsul"}</h3>
                            {(!isManager && !isAdmin) && <button className="btn-delete-v2" onClick={() => handleDeletePlan(p.id)}>🗑</button>}
                          </div>
                          <div className="p-meta-row">
                            <span className="p-gh-name">{p.greenhouseName?.toLowerCase() || 'seram'}</span>
                            <span className={`p-status-badge ${isPast ? 'expired' : 'active'}`}>
                              {isPast ? "Hasat tamamlandı" : `Ekim başladı · Hasada ${diff} gün kaldı`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-dates-grid">
                        <div className="date-item">
                          <label>EKİM TARİHİ</label>
                          <span className="val">{new Date(p.date).toLocaleDateString("tr-TR")}</span>
                        </div>
                        <div className="date-item">
                          <label>HASAT ZAMANI</label>
                          <span className="val highlight">{new Date(p.harvestDate || p.date).toLocaleDateString("tr-TR")}</span>
                        </div>
                      </div>

                      {p.notes && (
                        <div className="p-notes-box">
                          <span className="info-icon">ℹ️</span>
                          <p>{p.notes}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .calendar-page { padding: 40px; animation: fadeIn 0.5s ease; max-width: 1400px; margin: 0 auto; }
        .calendar-grid { display: grid; grid-template-columns: 450px 1fr; gap: 40px; align-items: start; }
        .calendar-grid.manager-view { grid-template-columns: 500px 1fr; }
        .calendar-page:has(.manager-view) { /* Optional layout tweak */ }
        
        /* If no left panel (Admin), make grid 1 column */
        .calendar-grid:not(:has(.left-panel)) { grid-template-columns: 1fr; }

        .gh-selector-bar { display: flex; align-items: center; gap: 20px; padding: 20px 32px; border-radius: 20px; margin-bottom: 32px; }
        .gh-selector-bar label { font-size: 14px; font-weight: 800; color: #1e293b; }
        .gh-selector-bar select { min-width: 300px; }

        /* Form Styles */
        .left-panel { background: white; border-radius: 24px; padding: 32px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); }
        .form-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
        .plus-icon { width: 32px; height: 32px; background: #f0fdf4; color: #10b981; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 800; }
        .form-header h2 { font-size: 20px; font-weight: 800; color: #1e293b; }

        .section-label { font-size: 11px; font-weight: 800; color: #64748b; margin-bottom: 12px; display: block; letter-spacing: 0.5px; }
        .form-section { margin-bottom: 24px; }
        .input-glass { width: 100%; padding: 14px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 14px; color: #1e293b; transition: all 0.2s; }
        .input-glass:focus { border-color: #10b981; background: white; outline: none; }
        
        .search-bar { margin-bottom: 16px; font-weight: 600; }
        
        .crop-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .crop-item { padding: 12px 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; gap: 6px; }
        .crop-item:hover { border-color: #10b981; background: #f0fdf4; }
        .crop-item.selected { border-color: #10b981; background: #10b981; color: white; }
        .crop-icon { font-size: 22px; }
        .crop-name { font-size: 11px; font-weight: 700; }
        .crop-item.selected .crop-name { color: white; }

        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .textarea-sm { min-height: 80px; resize: none; }

        .btn-save-plan { width: 100%; padding: 18px; background: #1e293b; color: white; border-radius: 16px; border: none; font-weight: 800; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
        .btn-save-plan:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }

        /* List Styles */
        .plans-v2-list { display: flex; flex-direction: column; gap: 24px; }
        .plan-card-v2 { background: white; border-radius: 24px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
        
        .p-main { display: flex; gap: 20px; margin-bottom: 24px; }
        .p-icon-box { width: 64px; height: 64px; background: #f8fafc; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; border: 1px solid #e2e8f0; }
        .p-header-info { flex: 1; }
        .p-title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .p-title-row h3 { font-size: 22px; font-weight: 800; color: #1e293b; text-transform: lowercase; }
        .btn-delete-v2 { background: #fef2f2; border: none; color: #ef4444; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .btn-delete-v2:hover { background: #fee2e2; }

        .p-meta-row { display: flex; align-items: center; gap: 12px; }
        .p-gh-name { font-size: 13px; font-weight: 700; color: #64748b; text-transform: lowercase; }
        .p-status-badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; }
        .p-status-badge.active { background: #f0fdf4; color: #10b981; }
        .p-status-badge.expired { background: #fff1f2; color: #e11d48; }

        .p-dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #f1f5f9; border-radius: 16px; overflow: hidden; border: 1px solid #f1f5f9; margin-bottom: 20px; }
        .date-item { background: #fcfdfe; padding: 16px 24px; display: flex; flex-direction: column; gap: 4px; }
        .date-item label { font-size: 10px; font-weight: 800; color: #94a3b8; }
        .date-item .val { font-size: 18px; font-weight: 800; color: #1e293b; letter-spacing: 0.5px; }
        .date-item .val.highlight { color: #10b981; }

        .p-notes-box { background: #f0fdfa; border-radius: 16px; padding: 14px 20px; display: flex; gap: 12px; align-items: flex-start; }
        .info-icon { font-size: 14px; }
        .p-notes-box p { font-size: 14px; font-weight: 600; color: #0f766e; margin: 0; line-height: 1.5; }

        .panel-title { font-size: 24px; font-weight: 900; color: #0f172a; margin-bottom: 24px; letter-spacing: -0.02em; }
        .empty-state-v2 { text-align: center; padding: 60px; background: white; border-radius: 24px; color: #94a3b8; font-weight: 600; font-style: italic; border: 2px dashed #f1f5f9; }

        /* Manager Suggestion Panel */
        .manager-suggestion-panel { padding: 32px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 24px; }
        .s-header h3 { font-size: 18px; font-weight: 800; color: #065f46; margin-bottom: 20px; }
        .s-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
        .s-form textarea { min-height: 120px; font-weight: 600; border-radius: 16px; }
        
        .s-history-title { font-size: 12px; font-weight: 900; color: #059669; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
        .s-history { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 8px; }
        .s-history::-webkit-scrollbar { width: 4px; }
        .s-history::-webkit-scrollbar-thumb { background: #d1fae5; border-radius: 10px; }
        
        .s-box { padding: 16px; display: flex; justify-content: space-between; align-items: center; background: white; border: 1px solid #dcfce7; }
        .s-content p { font-size: 14px; font-weight: 700; color: #1e293b; margin: 0 0 4px 0; line-height: 1.4; }
        .s-date { font-size: 11px; color: #94a3b8; font-weight: 700; }
        .no-s { font-size: 12px; color: #94a3b8; text-align: center; font-style: italic; }
        
        .s-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        .status-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 8px; text-transform: uppercase; }
        .status-badge.pending { background: #f8fafc; color: #64748b; }
        .status-badge.accepted { background: #f0fdf4; color: #10b981; }
        .status-badge.rejected { background: #fef2f2; color: #ef4444; }
        
        .no-s-msg { font-size: 13px; color: #94a3b8; font-style: italic; text-align: center; padding: 20px; font-weight: 600; }

        .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .btn-icon.success { background: #f0fdf4; color: #10b981; }
        .btn-icon.danger { background: #fef2f2; color: #ef4444; }

        .farmer-suggestion-view { padding: 24px; margin-bottom: 32px; border: 1px solid #f1f5f9; border-radius: 20px; }
        .farmer-suggestion-view h3 { font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 16px; }
        .farmer-btns { display: flex; gap: 6px; }
      `}</style>
    </MainLayout>
  );
}