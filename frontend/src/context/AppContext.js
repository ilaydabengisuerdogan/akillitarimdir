import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [suggestion, setSuggestion] = useState(null);
  const [selectedGhId, setSelectedGhId] = useState(localStorage.getItem("SELECTED_GREENHOUSE_ID") || "");

  // Bütün seraların canlı verilerini tutan ana state
  const [ghStates, setGhStates] = useState(() => {
    const saved = localStorage.getItem("GH_STATES");
    return saved ? JSON.parse(saved) : {};
  });

  // Seçili seranın verilerini kolay erişim için ayırıyoruz
  const currentData = ghStates[selectedGhId] || {
    temp: 24.0,
    hum: 55.0,
    soil: 40.0,
    light: 800.0,
    climateMode: "OFF",
    lightingMode: "OFF",
    irrigationStatus: false
  };

  useEffect(() => {
    localStorage.setItem("GH_STATES", JSON.stringify(ghStates));
    localStorage.setItem("SELECTED_GREENHOUSE_ID", selectedGhId);
  }, [ghStates, selectedGhId]);

  // Dinleyici: Yan panelden sera değişince burayı da güncelle
  useEffect(() => {
    const handleGhChange = () => {
      setSelectedGhId(localStorage.getItem("SELECTED_GREENHOUSE_ID") || "");
    };
    window.addEventListener("greenhouseChanged", handleGhChange);
    return () => window.removeEventListener("greenhouseChanged", handleGhChange);
  }, []);

  // Helper function to update current GH state
  const updateCurrentGh = (updates) => {
    if (!selectedGhId) return;
    setGhStates(prev => ({
      ...prev,
      [selectedGhId]: {
        ...(prev[selectedGhId] || currentData),
        ...updates
      }
    }));
  };

  // Global Simulation Effects
  useEffect(() => {
    if (!selectedGhId) return;

    let interval = setInterval(() => {
      setGhStates(prev => {
        const gh = prev[selectedGhId] || currentData;
        let newTemp = gh.temp;
        let newHum = gh.hum;
        let newSoil = gh.soil;
        let newLight = gh.light;

        // Temperature & Humidity drift based on Ventilation mode
        if (gh.climateMode === "HEAT") {
          newTemp = Math.min(newTemp + 0.3, 40);
          newHum = Math.max(newHum - 0.2, 20);
        } else if (gh.climateMode === "COOL") {
          newTemp = Math.max(newTemp - 0.3, 5);
          newHum = Math.min(newHum + 0.4, 95);
        } else {
          if (newTemp > 24.5) newTemp -= 0.05;
          else if (newTemp < 23.5) newTemp += 0.05;
          if (newHum > 56) newHum -= 0.1;
          else if (newHum < 54) newHum += 0.1;
        }

        // Soil Moisture drift based on Irrigation
        if (gh.irrigationStatus) {
          newSoil = Math.min(newSoil + 0.8, 99);
        } else {
          newSoil = Math.max(newSoil - 0.05, 10);
        }

        // Light Level drift based on Lighting mode
        if (gh.lightingMode === "ON") {
          newLight = Math.min(newLight + 100, 5000);
        } else {
          newLight = Math.max(newLight - 40, 200);
        }

        return {
          ...prev,
          [selectedGhId]: { ...gh, temp: newTemp, hum: newHum, soil: newSoil, light: newLight }
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedGhId, ghStates]);

  return (
    <AppContext.Provider
      value={{
        suggestion,
        setSuggestion,
        selectedGhId,
        // Individual getters for easy access (mapped to current selected GH)
        globalTemp: currentData.temp,
        globalHum: currentData.hum,
        globalSoil: currentData.soil,
        globalLight: currentData.light,
        climateMode: currentData.climateMode,
        lightingMode: currentData.lightingMode,
        irrigationStatus: currentData.irrigationStatus,
        // Unified setters
        setGlobalTemp: (val) => updateCurrentGh({ temp: typeof val === 'function' ? val(currentData.temp) : val }),
        setGlobalHum: (val) => updateCurrentGh({ hum: typeof val === 'function' ? val(currentData.hum) : val }),
        setGlobalSoil: (val) => updateCurrentGh({ soil: typeof val === 'function' ? val(currentData.soil) : val }),
        setGlobalLight: (val) => updateCurrentGh({ light: typeof val === 'function' ? val(currentData.light) : val }),
        setClimateMode: (val) => updateCurrentGh({ climateMode: val }),
        setLightingMode: (val) => updateCurrentGh({ lightingMode: val }),
        setIrrigationStatus: (val) => updateCurrentGh({ irrigationStatus: val }),
        // Others
        showSim: localStorage.getItem("SIM_MODE") === "true",
        setShowSim: (val) => {
          localStorage.setItem("SIM_MODE", val);
          window.location.reload(); // Re-trigger simulation state
        }
      }}
    >
      {children}
    </AppContext.Provider>
  );
}