import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { getSession } from "../services/auth";
import { 
  getTreatmentRecordsByGreenhouse, 
  createTreatmentRecord, 
  deleteTreatmentRecord,
  getAlertsByGreenhouse,
  createAlert,
  updateAlertStatus,
  deleteAlert
} from "../services/api";

export default function Activities() {
  const user = getSession();
  const isManager = user?.role === "GREENHOUSE_MANAGER";
  const isAdmin = user?.role === "ADMIN";

  const [list, setList] = useState([]);
  const [type, setType] = useState("GÜBRELEME");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [suggestions, setSuggestions] = useState([]);
  const [newSuggestionMsg, setNewSuggestionMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    if (!ghId) return;

    setLoading(true);
    try {
      const [records, alerts] = await Promise.all([
        getTreatmentRecordsByGreenhouse(ghId),
        getAlertsByGreenhouse(ghId)
      ]);

      setList(records.map(r => ({
        id: r.id,
        owner: r.appliedBy || "Sistem",
        type: r.treatmentType,
        note: r.notes,
        date: r.appliedDate ? new Date(r.appliedDate).toLocaleString("tr-TR") : new Date().toLocaleString("tr-TR"),
      })).reverse());

      setSuggestions(alerts.filter(a => a.alertType === "ACTIVITY_SUGGESTION"));
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

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");

    setSubmitting(true);
    try {
      await createTreatmentRecord({
        treatmentType: type,
        productName: "Genel",
        amount: "1.0",
        notes: note,
        appliedDate: date,
        greenhouseId: Number(ghId)
      });
      setNote("");
      fetchData();
    } catch(err) {
      alert("Hata: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      try {
        await deleteTreatmentRecord(id);
        fetchData();
      } catch(err) {
        console.error(err);
      }
    }
  };

  const handleAddSuggestion = async (e) => {
    e.preventDefault();
    if (!newSuggestionMsg.trim()) return;
    const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
    try {
      await createAlert({
        alertType: "ACTIVITY_SUGGESTION",
        message: newSuggestionMsg,
        severity: "INFO",
        greenhouseId: ghId ? Number(ghId) : 1
      });
      setNewSuggestionMsg("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestionAction = async (id, status) => {
    try {
      await updateAlertStatus(id, status);
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

  const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
  if (!ghId) {
    return (
      <MainLayout>
        <div className="empty-state">
          <div className="premium-card">
            <h2>Aktivite Kayıtları</h2>
            <p>Lütfen işlem kayıtlarını görmek için bir sera seçin.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="activities-page">
        <header className="page-header">
          <div>
            <h1 className="page-title">🧪 Bakım & Aktivite Kayıtları</h1>
            <p className="page-subtitle">İlaçlama, gübreleme ve diğer bakım süreçlerini dökümante edin</p>
          </div>
        </header>

        <div className="activities-grid">
          <div className="left-panel">
            {user?.role === "FARMER" && (
              <section className="premium-card form-card">
                <div className="card-header">
                  <h3>➕ Yeni Kayıt Ekle</h3>
                </div>
                <form onSubmit={handleAddActivity} className="activity-form">
                  <div className="form-group">
                    <label>İşlem Türü</label>
                    <select className="input-glass" value={type} onChange={e => setType(e.target.value)}>
                      <option value="GÜBRELEME">🌿 Gübreleme</option>
                      <option value="İLAÇLAMA">🧪 İlaçlama</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Uygulama Tarihi</label>
                    <input type="date" className="input-glass" value={date} onChange={e => setDate(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Notlar / Açıklama</label>
                    <textarea 
                      className="input-glass" 
                      placeholder="Yapılan işlemin detaylarını buraya yazın..." 
                      value={note} 
                      onChange={e => setNote(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? "Kaydediliyor..." : "İşlemi Kaydet"}
                  </button>
                </form>
              </section>
            )}

            {(isAdmin || isManager) && (
              <section className="premium-card info-card-admin">
                <div className="card-header">
                  <h3>ℹ️ {isManager ? "Danışman Modu" : "İzleme Modu"}</h3>
                </div>
                <p style={{fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6'}}>
                  {isManager 
                    ? "Yönetici olarak bakım kaydı ekleyemezsiniz. Önerilerinizi aşağıdaki 'Uzman Önerileri' panelinden iletebilirsiniz."
                    : "Admin hesabı ile aktivite kaydı oluşturulamaz. Tüm geçmiş kayıtları inceleyebilir veya silebilirsiniz."}
                </p>
              </section>
            )}

            <section className="premium-card suggestions-card">
              <div className="card-header">
                <h3>💡 {isManager ? "Önerileri Yönet" : "Uzman Önerileri"}</h3>
              </div>
              {isManager && (
                <form onSubmit={handleAddSuggestion} className="suggestion-form">
                  <input className="input-glass" placeholder="Bakım önerisi..." value={newSuggestionMsg} onChange={e => setNewSuggestionMsg(e.target.value)} />
                  <button type="submit" className="btn-primary btn-sm">Yayınla</button>
                </form>
              )}
              <div className="suggestion-list">
                {suggestions.length === 0 ? (
                  <p className="empty-text">Henüz öneri bulunmuyor.</p>
                ) : (
                  suggestions.map((s) => (
                    <div key={s.id} className="suggestion-item glass-panel">
                      <div className="s-info">
                        <p className="s-msg">📢 {s.message}</p>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                          <span className={`s-status ${s.status.toLowerCase()}`}>{s.status}</span>
                          <span style={{fontSize: '10px', color: 'var(--text-muted)'}}>• {new Date(s.createdAt || Date.now()).toLocaleString("tr-TR")}</span>
                        </div>
                      </div>
                      <div className="s-actions">
                        {isManager ? (
                          <button className="btn-icon danger" onClick={() => handleDeleteSuggestion(s.id)}>🗑</button>
                        ) : (user?.role === "FARMER" && s.status === "PENDING") && (
                          <>
                            <button className="btn-icon success" onClick={() => handleSuggestionAction(s.id, "ACCEPTED")}>✓</button>
                            <button className="btn-icon danger" onClick={() => handleSuggestionAction(s.id, "REJECTED")}>✕</button>
                          </>
                        )}
                        {s.status !== "PENDING" && (
                          <span className={`s-badge ${s.status.toLowerCase()}`}>{s.status}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="right-panel">
            <section className="premium-card list-card">
              <div className="card-header">
                <h3>📋 İşlem Geçmişi</h3>
              </div>
              
              <div className="activity-timeline">
                {loading ? (
                  <p className="loading-text">Yükleniyor...</p>
                ) : list.length === 0 ? (
                  <p className="empty-text">Henüz bir aktivite kaydı bulunmuyor.</p>
                ) : (
                  list.map((i) => (
                    <div key={i.id} className="activity-item glass-panel">
                      <div className="ai-icon">
                        {i.type === "GÜBRELEME" ? "🌿" : i.type === "İLAÇLAMA" ? "🧪" : "📝"}
                      </div>
                      <div className="ai-content">
                        <div className="ai-header">
                          <div className="ai-title">
                            <h4>{i.type} İşlemi</h4>
                            <span className="ai-user">👤 {i.owner}</span>
                          </div>
                          <button className="btn-icon danger sm" onClick={() => handleDeleteActivity(i.id)}>🗑</button>
                        </div>
                        <p className="ai-note">{i.note}</p>
                        <span className="ai-date">📅 {i.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .activities-page { animation: fadeIn 0.6s ease-out; }
        .page-header { margin-bottom: 32px; }
        .activities-grid { display: grid; grid-template-columns: 360px 1fr; gap: 32px; }
        
        .form-card { margin-bottom: 24px; }
        .activity-form { display: flex; flex-direction: column; gap: 16px; }
        textarea.input-glass { min-height: 100px; resize: none; padding-top: 12px; }

        .suggestions-card .card-header { margin-bottom: 16px; }
        .suggestion-form { display: flex; gap: 10px; margin-bottom: 20px; }
        .suggestion-list { display: flex; flex-direction: column; gap: 12px; }
        .suggestion-item { padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
        .s-info { flex: 1; }
        .s-msg { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
        .s-status { font-size: 10px; font-weight: 800; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; }
        .s-status.pending { color: var(--accent); background: rgba(245, 158, 11, 0.1); }
        .s-status.accepted { color: var(--primary); background: rgba(16, 185, 129, 0.1); }
        .s-status.rejected { color: var(--danger); background: rgba(239, 68, 68, 0.1); }
        .s-actions { display: flex; gap: 8px; align-items: center; }
        .s-badge { font-size: 9px; font-weight: 900; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
        .s-badge.pending { color: var(--accent); background: rgba(245, 158, 11, 0.1); }
        .s-badge.accepted { color: var(--primary); background: rgba(16, 185, 129, 0.1); }
        .s-badge.rejected { color: var(--danger); background: rgba(239, 68, 68, 0.1); }

        .activity-timeline { display: flex; flex-direction: column; gap: 16px; }
        .activity-item { padding: 20px; display: flex; gap: 20px; border-left: 4px solid var(--primary); }
        .ai-icon { width: 48px; height: 48px; border-radius: 14px; background: rgba(34, 197, 94, 0.1); display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .ai-content { flex: 1; }
        .ai-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .ai-title h4 { font-size: 17px; margin: 0; color: white; }
        .ai-user { font-size: 11px; color: var(--text-muted); }
        .ai-note { font-size: 14px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px; }
        .ai-date { font-size: 12px; color: var(--text-muted); font-weight: 600; }

        .btn-icon { width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .btn-icon.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .btn-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--primary); }
        .btn-icon.sm { width: 24px; height: 24px; font-size: 12px; }

        .empty-text { text-align: center; color: var(--text-muted); padding: 40px; font-style: italic; }
        .empty-state { height: 60vh; display: flex; align-items: center; justify-content: center; }
      `}</style>
    </MainLayout>
  );
}