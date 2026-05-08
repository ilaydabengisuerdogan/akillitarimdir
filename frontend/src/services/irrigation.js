import { createIrrigationRecord, getIrrigationRecords } from "../services/api";
import { useState, useEffect, useRef } from "react";
import MainLayout from "../components/MainLayout";
import { getSession } from "../services/auth";

import {
  getSuggestions,
  updateSuggestion,
} from "../services/suggestion";

export default function Irrigation() {
  const user = getSession();
  const isFarmer = user?.email === "farmer@test.com";

  const STORAGE_KEY = "irrigation_state";

  const [soil, setSoil] = useState(0);
  const [status, setStatus] = useState("");
  const [records, setRecords] = useState([]);

  const [suggestions, setSuggestions] = useState(getSuggestions());

  const [autoIrrigation, setAutoIrrigation] = useState(false);
  const [manualIrrigation, setManualIrrigation] = useState(false);

  const [autoTimeLeft, setAutoTimeLeft] = useState(null);
  const [manualTimeLeft, setManualTimeLeft] = useState(null);

  const [selectedTime, setSelectedTime] = useState(1);

  const selectedTimeRef = useRef(1);
  const soilRef = useRef(0);

  const loadRecords = () => {
    getIrrigationRecords()
      .then((data) => {
        console.log("GELEN KAYITLAR:", data);
        setRecords(data);
      })
      .catch((err) => console.error("Sulama kayıtları alınamadı:", err));
  };

  useEffect(() => {
    selectedTimeRef.current = selectedTime;
  }, [selectedTime]);

  useEffect(() => {
    soilRef.current = soil;
  }, [soil]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const value = Math.floor(20 + Math.random() * 60);
      setSoil(value);

      if (value < 30) setStatus("🚨 Sulama Gerekli");
      else if (value < 50) setStatus("⚠️ Takip Edilmeli");
      else setStatus("✅ Yeterli Nem");
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved);
      setAutoIrrigation(parsed.autoIrrigation);
      setManualIrrigation(parsed.manualIrrigation);
      setAutoTimeLeft(parsed.autoTimeLeft);
      setManualTimeLeft(parsed.manualTimeLeft);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        autoIrrigation,
        manualIrrigation,
        autoTimeLeft,
        manualTimeLeft,
      })
    );
  }, [autoIrrigation, manualIrrigation, autoTimeLeft, manualTimeLeft]);

  useEffect(() => {
    const accepted = suggestions.find(
      (s) => s.status === "ACCEPTED" && s.section === "irrigation"
    );

    if (accepted && !autoIrrigation) {
      setAutoIrrigation(true);
      setAutoTimeLeft(selectedTimeRef.current * 60);

      updateSuggestion(accepted.id, "DONE");
      setSuggestions([...getSuggestions()]);
    }
  }, [suggestions, autoIrrigation]);

  useEffect(() => {
    if (!autoIrrigation || autoTimeLeft === null) return;

    const interval = setInterval(() => {
      setAutoTimeLeft((prev) => {
        if (prev <= 1) {
          setAutoIrrigation(false);
          alert("⛔ Otomatik sulama bitti");
          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoIrrigation, autoTimeLeft]);

  const toggleManualIrrigation = () => {
    if (!manualIrrigation) {
      setManualIrrigation(true);
      setManualTimeLeft(selectedTimeRef.current * 60);

      createIrrigationRecord({
        greenhouseId: 2,
        waterAmount: selectedTimeRef.current * 10,
        irrigationType: "MANUAL",
      })
        .then(() => loadRecords())
        .catch((err) => console.error("HATA:", err));
    } else {
      setManualIrrigation(false);
      setManualTimeLeft(null);
    }
  };

  useEffect(() => {
    if (!manualIrrigation || manualTimeLeft === null) return;

    const interval = setInterval(() => {
      setManualTimeLeft((prev) => {
        if (prev <= 1) {
          setManualIrrigation(false);
          alert("⛔ Manuel sulama bitti");
          return null;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [manualIrrigation, manualTimeLeft]);

  const handleAccept = (id) => {
    updateSuggestion(id, "ACCEPTED");
    setSuggestions([...getSuggestions()]);
  };

  const handleReject = (id) => {
    updateSuggestion(id, "REJECTED");
    setSuggestions([...getSuggestions()]);
  };

  return (
    <MainLayout>
      <div style={styles.page}>
        <div style={styles.overlay}></div>

        <div style={styles.container}>
          <h1>💧 Sulama Kontrol Sistemi</h1>

          <div style={styles.card}>
            <h2>%{soil}</h2>
            <p>{status}</p>

            <p>🤖 Otomatik: {autoIrrigation ? "AÇIK" : "KAPALI"}</p>
            <p>💧 Manuel: {manualIrrigation ? "AÇIK" : "KAPALI"}</p>

            <select
              value={selectedTime}
              onChange={(e) => setSelectedTime(Number(e.target.value))}
            >
              <option value={1}>1 dk</option>
              <option value={3}>3 dk</option>
              <option value={5}>5 dk</option>
            </select>

            {autoTimeLeft && <p>🤖 Kalan: {autoTimeLeft} sn</p>}
            {manualTimeLeft && <p>💧 Kalan: {manualTimeLeft} sn</p>}
          </div>

          <button
            onClick={toggleManualIrrigation}
            style={{
              ...styles.button,
              background: manualIrrigation ? "#ef4444" : "#3b82f6",
            }}
          >
            {manualIrrigation ? "⛔ Durdur" : "💧 Manuel Başlat"}
          </button>

          {suggestions
            .filter((s) => s.section === "irrigation")
            .map((s) => (
              <div key={s.id} style={styles.log}>
                <p>{s.message}</p>
                <p>Durum: {s.status}</p>

                {s.status === "PENDING" && isFarmer && (
                  <>
                    <button
                      onClick={() => handleAccept(s.id)}
                      style={styles.btnGreen}
                    >
                      ✔ Kabul
                    </button>

                    <button
                      onClick={() => handleReject(s.id)}
                      style={styles.btnRed}
                    >
                      ❌ Reddet
                    </button>
                  </>
                )}
              </div>
            ))}

          <h3>📜 İşlem Geçmişi</h3>

          {records.length === 0 ? (
            <p>Henüz kayıt yok.</p>
          ) : (
            records.map((r) => (
              <div key={r.id} style={styles.log}>
                <p>💧 {r.irrigationType} Sulama</p>
                <small>
                  {r.irrigationTime} - {r.greenhouseName} - Su:{" "}
                  {r.waterAmount}
                </small>
              </div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    backgroundImage:
      "url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6')",
    backgroundSize: "cover",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
  },

  container: {
    position: "relative",
    zIndex: 2,
    padding: 25,
    color: "#f1f5f9",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,
  },

  button: {
    padding: "10px 15px",
    border: "none",
    color: "white",
    borderRadius: 10,
    cursor: "pointer",
  },

  log: {
    background: "rgba(255,255,255,0.08)",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
  },

  btnGreen: {
    background: "#22c55e",
    border: "none",
    padding: "5px 10px",
    marginRight: 5,
    color: "white",
  },

  btnRed: {
    background: "#ef4444",
    border: "none",
    padding: "5px 10px",
    color: "white",
  },
};