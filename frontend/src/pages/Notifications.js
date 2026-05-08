import React, { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import { getAlertsByGreenhouse } from "../services/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const ghId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
      if (!ghId) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      try {
        const alerts = await getAlertsByGreenhouse(ghId);
        setNotifications(alerts.reverse());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
    window.addEventListener("greenhouseChanged", fetchLogs);
    return () => window.removeEventListener("greenhouseChanged", fetchLogs);
  }, []);

  const getSeverityClass = (sev) => {
    if (sev === "CRITICAL" || sev === "DANGER") return "danger";
    if (sev === "WARNING") return "warning";
    return "info";
  };

  return (
    <MainLayout>
      <div className="notifications-page">
        <header className="page-header">
          <h1 className="page-title">🔔 Bildirimler & Uyarılar</h1>
          <p className="page-subtitle">Sistem tarafından üretilen tüm kritik mesajlar ve geçmiş kayıtlar</p>
        </header>

        <section className="premium-card logs-card">
          {loading ? (
            <p className="loading-text">Yükleniyor...</p>
          ) : notifications.length === 0 ? (
            <div className="empty-logs">
              <span>📭</span>
              <p>Şu an için herhangi bir bildirim bulunmuyor.</p>
            </div>
          ) : (
            <div className="logs-list">
              {notifications.map((n) => (
                <div key={n.id} className={`log-item glass-panel ${getSeverityClass(n.severity)}`}>
                  <div className="log-icon">
                    {n.severity === "CRITICAL" ? "🚨" : n.severity === "WARNING" ? "⚠️" : "ℹ️"}
                  </div>
                  <div className="log-content">
                    <div className="log-header">
                      <span className="log-type">{n.alertType}</span>
                      <span className="log-date">{new Date(n.timestamp || Date.now()).toLocaleString()}</span>
                    </div>
                    <p className="log-msg">{n.message}</p>
                  </div>
                  <div className={`log-badge ${getSeverityClass(n.severity)}`}>{n.severity}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .notifications-page { animation: fadeIn 0.6s ease-out; }
        .logs-card { padding: 32px; min-height: 500px; }
        
        .empty-logs { text-align: center; padding: 100px 0; color: var(--text-muted); }
        .empty-logs span { font-size: 64px; display: block; margin-bottom: 16px; opacity: 0.5; }

        .logs-list { display: flex; flex-direction: column; gap: 16px; }
        .log-item { padding: 20px 24px; display: flex; align-items: center; gap: 20px; border-left: 4px solid var(--secondary); transition: transform 0.2s; }
        .log-item:hover { transform: translateX(8px); }
        
        .log-item.danger { border-left-color: var(--danger); }
        .log-item.warning { border-left-color: var(--accent); }

        .log-icon { font-size: 24px; width: 48px; height: 48px; background: rgba(255,255,255,0.05); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        
        .log-content { flex: 1; }
        .log-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .log-type { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .log-date { font-size: 11px; color: var(--text-muted); }
        .log-msg { font-size: 15px; color: var(--text-primary); font-weight: 600; }

        .log-badge { font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; }
        .log-badge.danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .log-badge.warning { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
        .log-badge.info { background: rgba(59, 130, 246, 0.1); color: var(--secondary); }
      `}</style>
    </MainLayout>
  );
}
