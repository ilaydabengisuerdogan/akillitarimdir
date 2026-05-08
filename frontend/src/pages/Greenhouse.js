import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { getSession } from "../services/auth";
import {
  getGreenhouses,
  createGreenhouse,
  updateGreenhouse,
  deleteGreenhouse,
  getAlertsByGreenhouse,
  createAlert,
  deleteAlert,
  updateAlertStatus
} from "../services/api";

export default function Greenhouse() {
  const user = getSession();
  const navigate = useNavigate();
  const isFarmer = user?.role === "FARMER";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Greenhouse Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [type, setType] = useState("sera");

  // Suggestion State
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedGH, setSelectedGH] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestionMsg, setNewSuggestionMsg] = useState("");

  useEffect(() => {
    if (showModal) {
      setTimeout(() => {
        const L = window.L;
        if (!L) return;
        const map = L.map('map-picker').setView([39.9334, 32.8597], 6); // Turkey center
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        
        let marker;
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          if (marker) map.removeLayer(marker);
          marker = L.marker([lat, lng]).addTo(map);
          
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const addr = data.address;
            const city = addr.province || addr.city || addr.town || addr.village || "";
            const district = addr.district || addr.suburb || addr.town || "";
            
            if (city && district && city !== district) {
              setLocation(`${city}, ${district}`);
            } else {
              setLocation(city || district || `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
            }
          } catch (err) {
            console.error("Geocoding error:", err);
            setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });
      }, 100);
    }
  }, [showModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ownerEmail = user?.role === "FARMER" ? user.email : null;
      const records = await getGreenhouses(ownerEmail);
      setItems(records.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddGreenhouse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createGreenhouse({
        greenhouseName: name,
        location: location,
        area: area ? parseFloat(area) : 0,
        cropType: type,
        ownerEmail: user?.email,
      });
      setShowModal(false);
      setName(""); setLocation(""); setArea("");
      fetchData();
    } catch(err) {
      alert("Hata: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGreenhouse = async (id) => {
    if (window.confirm("Bu alanı silmek istediğinize emin misiniz?")) {
      try {
        await deleteGreenhouse(id);
        fetchData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleOpenSuggestions = async (gh) => {
    setSelectedGH(gh);
    setShowSuggestionModal(true);
    fetchSuggestions(gh.id);
  };

  const fetchSuggestions = async (ghId) => {
    try {
      const alerts = await getAlertsByGreenhouse(ghId);
      setSuggestions(alerts.filter(a => a.alertType === "GENERAL_SUGGESTION"));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestionMsg.trim()) return;
    try {
      await createAlert({
        alertType: "GENERAL_SUGGESTION",
        message: newSuggestionMsg,
        severity: "INFO",
        greenhouseId: selectedGH.id
      });
      setNewSuggestionMsg("");
      fetchSuggestions(selectedGH.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSuggestion = async (id) => {
    if (window.confirm("Bu öneriyi silmek istiyor musunuz?")) {
      try {
        await deleteAlert(id);
        fetchSuggestions(selectedGH.id);
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleUpdateAlertStatus = async (id, status) => {
    try {
      await updateAlertStatus(id, status);
      fetchSuggestions(selectedGH.id);
    } catch(err) {
      console.error(err);
    }
  };

  const handleNavigate = (id, path) => {
    localStorage.setItem("SELECTED_GREENHOUSE_ID", id);
    window.dispatchEvent(new Event("greenhouseChanged"));
    navigate(path);
  };

  const filteredItems = items.filter(i => 
    i.greenhouseName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (type) => {
    const t = type?.toLowerCase();
    if (t === 'sera') return "🌿";
    if (t === 'parsel') return "🌾";
    if (t === 'domates') return "🍅";
    if (t === 'mısır') return "🌽";
    return "🌱";
  };

  return (
    <MainLayout>
      <div className="greenhouse-v2-page">
        {/* HEADER SECTION */}
        <header className="gh-header">
          <div className="gh-header-left">
            <h1 className="gh-title">Üretim Sahalarım</h1>
            <p className="gh-subtitle">Sistem üzerindeki tüm aktif seralarınız</p>
          </div>
          
          <div className="gh-header-right">
            <div className="search-box-v2">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Sera veya konum ara..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {isFarmer && (
              <button className="btn-add-gh" onClick={() => setShowModal(true)}>
                <span className="plus-icon">+</span> Yeni Sera Tanımla
              </button>
            )}
          </div>
        </header>

        {/* MAIN LIST SECTION */}
        <div className="gh-list-v2">
          {loading ? (
            <div className="gh-loading">Veriler yükleniyor...</div>
          ) : filteredItems.length === 0 ? (
            <div className="gh-empty">Henüz bir sera bulunmuyor veya arama ile eşleşmedi.</div>
          ) : (
            <div className="gh-grid-v2">
              {filteredItems.map(item => (
                <div key={item.id} className="gh-card-v2">
                  <div className="gh-card-top">
                    <div className="gh-card-icon-box">
                      <span className="gh-card-icon">{getIcon(item.cropType)}</span>
                    </div>
                    <div className="gh-card-title-box">
                      <h3 className="gh-card-name">{item.greenhouseName?.toLowerCase()}</h3>
                      <div className="gh-card-loc">
                        <span className="loc-icon">📍</span> {item.location?.toLowerCase()}
                      </div>
                    </div>
                    <div className="gh-status-dot"></div>
                  </div>

                    <div className="gh-card-stats">
                      <div className="stat-item">
                        <label>KAPASİTE</label>
                        <div className="val">{item.area || 0} m²</div>
                      </div>
                      <div className="stat-item">
                        <label>DURUM</label>
                        <div className="val status-on"><span className="dot"></span> ON-LINE</div>
                      </div>
                    </div>

                  <div className="gh-card-footer">
                    <button className="btn-gh-details" onClick={() => handleNavigate(item.id, '/dashboard')}>Detaylar</button>
                    <button className="btn-gh-suggestion" onClick={() => handleOpenSuggestions(item)}>💡 Öneriler</button>
                    <button className="btn-gh-del" onClick={() => handleDeleteGreenhouse(item.id)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD MODAL */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content premium-card">
              <h3>Yeni Sera Ekle</h3>
              <form onSubmit={handleAddGreenhouse} className="modal-form">
                <input className="input-glass" placeholder="Sera Adı" value={name} onChange={e => setName(e.target.value)} required />
                
                <div className="map-group">
                  <input className="input-glass" placeholder="Konum (Haritadan seçin)" value={location} onChange={e => setLocation(e.target.value)} required />
                  <div id="map-picker"></div>
                </div>

                <input className="input-glass" type="number" placeholder="Alan (m2)" value={area} onChange={e => setArea(e.target.value)} />
                <select className="input-glass" value={type} onChange={e => setType(e.target.value)}>
                  <option value="sera">🌿 Sera</option>
                  <option value="parsel">🌾 Parsel</option>
                </select>
                <div className="modal-btns">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>İptal</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Ekleniyor..." : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUGGESTION MODAL */}
        {showSuggestionModal && (
          <div className="modal-overlay">
            <div className="modal-content suggestion-modal premium-card">
              <div className="modal-header">
                <h3>💡 {selectedGH?.greenhouseName} - Sera Yöneticisi Önerileri</h3>
                <button className="btn-close" onClick={() => setShowSuggestionModal(false)}>✕</button>
              </div>

              {user?.role === 'GREENHOUSE_MANAGER' && (
                <form onSubmit={handleAddSuggestion} className="suggestion-form">
                  <textarea 
                    className="input-glass"
                    placeholder="Üreticiye yeni bir öneri yazın ve yayınlayın..."
                    value={newSuggestionMsg}
                    onChange={e => setNewSuggestionMsg(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-primary">Öneriyi Yayınla</button>
                </form>
              )}

              <div className="suggestion-history">
                {suggestions.length === 0 ? (
                  <p className="no-suggestions">Henüz bir kayıtlı öneri bulunmuyor.</p>
                ) : (
                  suggestions.map(s => (
                    <div key={s.id} className="suggestion-item glass-panel">
                      <div className="s-info">
                        <p className="s-msg">{s.message}</p>
                        <span className="s-date">{new Date(s.createdAt).toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="s-actions">
                        {user?.role === 'GREENHOUSE_MANAGER' ? (
                          <button className="btn-icon danger" onClick={() => handleDeleteSuggestion(s.id)}>🗑</button>
                        ) : (user?.role === 'FARMER' && s.status === 'PENDING') && (
                          <div className="farmer-actions">
                            <button className="btn-icon success" onClick={() => handleUpdateAlertStatus(s.id, 'ACCEPTED')}>✓</button>
                            <button className="btn-icon danger" onClick={() => handleUpdateAlertStatus(s.id, 'REJECTED')}>✕</button>
                          </div>
                        )}
                        <span className={`status-tag ${s.status?.toLowerCase()}`}>{s.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <style>{`
          .greenhouse-v2-page { animation: fadeIn 0.6s ease-out; color: #1e293b; }
          
          .gh-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
          .gh-title { font-size: 38px; font-weight: 900; margin: 0; color: #0f172a; letter-spacing: -0.04em; }
          .gh-subtitle { font-size: 16px; color: #64748b; margin: 8px 0 0 0; font-weight: 500; }
          
          .gh-header-right { display: flex; gap: 20px; align-items: center; }
          
          .search-box-v2 { position: relative; width: 320px; }
          .search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 14px; opacity: 0.5; }
          .search-box-v2 input { width: 100%; height: 50px; border-radius: 16px; border: 2px solid #e2e8f0; padding-left: 44px; font-size: 14px; font-weight: 600; transition: all 0.2s; }
          .search-box-v2 input:focus { border-color: #10b981; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); outline: none; }
          
          .btn-add-gh { background: #10b981; color: white; border: none; height: 50px; padding: 0 24px; border-radius: 16px; font-weight: 800; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.2s; box-shadow: 0 10px 20px -10px #10b981; }
          .btn-add-gh:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -10px #10b981; }
          
          .gh-grid-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 24px; }
          .gh-card-v2 { background: white; border-radius: 32px; padding: 24px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 20px -5px rgba(0,0,0,0.03); transition: all 0.3s; position: relative; }
          .gh-card-v2:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1); border-color: #10b98122; }
          
          .gh-card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
          .gh-card-icon-box { width: 64px; height: 64px; background: #f8fafc; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; }
          .gh-card-title-box { flex: 1; }
          .gh-card-name { font-size: 24px; font-weight: 900; margin: 0; color: #1e293b; letter-spacing: -0.02em; }
          .gh-card-loc { font-size: 13px; color: #94a3b8; font-weight: 700; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
          .gh-status-dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; position: absolute; top: 32px; right: 32px; box-shadow: 0 0 12px #10b98188; }
          
          .gh-card-stats { background: #f8fafc; border-radius: 24px; display: grid; grid-template-columns: 1fr 1fr; padding: 20px; margin-bottom: 24px; border: 1px solid #f1f5f9; }
          .stat-item label { display: block; font-size: 10px; font-weight: 800; color: #94a3b8; letter-spacing: 1px; margin-bottom: 4px; }
          .stat-item .val { font-size: 18px; font-weight: 800; color: #334155; }
          .val.status-on { color: #10b981; display: flex; align-items: center; gap: 6px; }
          .val.status-on .dot { width: 6px; height: 6px; border-radius: 50%; background: #10b981; }
          
          .gh-card-footer { display: flex; gap: 12px; align-items: center; }
          .btn-gh-details { flex: 1; height: 48px; border-radius: 14px; border: 2px solid #f1f5f9; background: white; color: #64748b; font-weight: 800; cursor: pointer; transition: all 0.2s; }
          .btn-gh-control { flex: 1; height: 48px; border-radius: 14px; border: none; background: #10b981; color: white; font-weight: 800; cursor: pointer; transition: all 0.2s; }
          .btn-gh-del { width: 48px; height: 48px; border-radius: 14px; border: none; background: #fff1f2; color: #e11d48; font-size: 18px; cursor: pointer; transition: all 0.2s; }
          
          .btn-gh-details:hover { background: #f8fafc; border-color: #e2e8f0; color: #1e293b; }
          .btn-gh-suggestion { flex: 1.5; height: 48px; border-radius: 14px; border: none; background: #10b981; color: white; font-weight: 800; cursor: pointer; transition: all 0.2s; }
          .btn-gh-del { width: 48px; height: 48px; border-radius: 14px; border: none; background: #fff1f2; color: #e11d48; font-size: 18px; cursor: pointer; transition: all 0.2s; }
          
          .btn-gh-details:hover { background: #f8fafc; border-color: #e2e8f0; color: #1e293b; }
          .btn-gh-suggestion:hover { transform: scale(1.02); background: #059669; }
          .btn-gh-del:hover { background: #ffe4e6; transform: scale(1.05); }

          /* Suggestion Modal Styles */
          .suggestion-modal { width: 600px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; padding: 32px; }
          .modal-header { display: flex; justify-content: space-between; align-items: center; }
          .btn-close { background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.5; }
          
          .suggestion-form { display: flex; flex-direction: column; gap: 12px; }
          .suggestion-form textarea { min-height: 100px; padding: 16px; font-size: 14px; font-weight: 600; resize: none; }
          
          .suggestion-history { display: flex; flex-direction: column; gap: 12px; }
          .suggestion-item { padding: 16px; display: flex; justify-content: space-between; align-items: flex-start; border-radius: 16px; border: 1px solid #f1f5f9; }
          .s-msg { font-size: 14px; font-weight: 700; color: #1e293b; margin-bottom: 4px; }
          .s-date { font-size: 11px; color: #94a3b8; font-weight: 700; }
          
          .s-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
          .status-tag { font-size: 10px; font-weight: 900; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
          .status-tag.pending { background: #f8fafc; color: #64748b; }
          .status-tag.accepted { background: #f0fdf4; color: #10b981; }
          .status-tag.rejected { background: #fef2f2; color: #ef4444; }
          
          .farmer-actions { display: flex; gap: 6px; }
          .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
          .btn-icon.success { background: #f0fdf4; color: #10b981; }
          .btn-icon.danger { background: #fef2f2; color: #ef4444; }
          .no-suggestions { text-align: center; color: #94a3b8; font-style: italic; font-size: 13px; }

          .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
          .modal-content { width: 500px; padding: 40px; text-align: center; }
          .modal-form { display: flex; flex-direction: column; gap: 16px; margin-top: 24px; }
          .modal-btns { display: flex; gap: 12px; margin-top: 12px; }
          .modal-btns button { flex: 1; }
          
          .map-group { display: flex; flex-direction: column; gap: 10px; }
          #map-picker { height: 200px; border-radius: 16px; border: 1px solid #e2e8f0; }

          @media (max-width: 768px) {
            .gh-header { flex-direction: column; align-items: flex-start; gap: 20px; }
            .gh-header-right { width: 100%; flex-direction: column; }
            .search-box-v2 { width: 100%; }
            .btn-add-gh { width: 100%; justify-content: center; }
          }
        `}</style>
      </div>
    </MainLayout>
  );
}