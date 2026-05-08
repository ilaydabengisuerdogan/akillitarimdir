import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { getAlerts } from "../services/api";

export default function SuggestionsAdmin() {
  const [suggestions, setSuggestions] = useState([]);

  const loadSuggestions = async () => {
    try {
      const data = await getAlerts();
      
      const mappedData = data.map(a => ({
        id: a.id,
        section: a.alertType,
        date: new Date(a.createdAt).toLocaleString(),
        message: a.message,
        createdBy: "Yönetici",
        status: "Aktif"
      }));
      
      setSuggestions(mappedData.reverse());
    } catch(err) {
      console.error("Öneriler çekilemedi", err);
    }
  };

  useEffect(() => {
    loadSuggestions();
    const interval = setInterval(loadSuggestions, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <div style={{ padding: "40px", color: "white", minHeight: "100vh" }}>
        <h2 style={{ fontSize: "28px", borderBottom: "2px solid #22c55e", paddingBottom: "10px" }}>
          📋 Tüm Sistem Önerileri
        </h2>

        {suggestions.length === 0 ? (
          <div style={{ marginTop: "20px", padding: "20px", background: "rgba(255,255,255,0.05)", borderRadius: "10px" }}>
            <p>⚠️ Sisteme kayıtlı öneri bulunamadı.</p>
            <small>Lütfen manager hesabıyla giriş yapıp bir öneri eklediğinizden emin olun.</small>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
            {suggestions.map((s) => (
              <div key={s.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={styles.badge}>{s.section}</span>
                  <small style={{ opacity: 0.6 }}>{s.date}</small>
                </div>
                <p style={{ fontSize: "18px", margin: "15px 0", fontStyle: "italic" }}>"{s.message}"</p>
                <div style={{ fontSize: "14px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px" }}>
                  👤 Yazan: <strong>{s.createdBy}</strong> 
                  <span style={{ float: "right", color: "#fbbf24" }}>● {s.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

const styles = {
  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  badge: {
    background: "#3b82f6",
    padding: "3px 10px",
    borderRadius: "5px",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase"
  }
};