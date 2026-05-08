import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout, getSession } from "../services/auth";
import { getGreenhouses } from "../services/api";

export default function MainLayout({ children }) {
  const navigate = useNavigate();
  const user = getSession();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.role === "ADMIN";
  const isFarmer = user?.role === "FARMER";

  const [greenhouses, setGreenhouses] = useState([]);
  const [selectedGreenhouseId, setSelectedGreenhouseId] = useState(
    localStorage.getItem("SELECTED_GREENHOUSE_ID") || ""
  );

  useEffect(() => {
    const fetchGH = async () => {
      try {
        const ownerEmail = isFarmer ? user.email : null;
        const gh = await getGreenhouses(ownerEmail);
        setGreenhouses(gh);
        
        const currentId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
        const exists = gh.some(g => String(g.id) === String(currentId));

        if (gh.length > 0 && (!currentId || !exists)) {
          localStorage.setItem("SELECTED_GREENHOUSE_ID", gh[0].id);
          setSelectedGreenhouseId(gh[0].id);
          window.dispatchEvent(new Event("greenhouseChanged"));
        }
      } catch(err) {
        console.error(err);
      }
    };
    fetchGH();
  }, [isFarmer, user?.email]);

  useEffect(() => {
    const handleGlobalGHChange = () => {
      const currentId = localStorage.getItem("SELECTED_GREENHOUSE_ID");
      if (currentId) setSelectedGreenhouseId(currentId);
    };
    window.addEventListener("greenhouseChanged", handleGlobalGHChange);
    return () => window.removeEventListener("greenhouseChanged", handleGlobalGHChange);
  }, []);

  const handleGreenhouseChange = (e) => {
    const id = e.target.value;
    localStorage.setItem("SELECTED_GREENHOUSE_ID", id);
    setSelectedGreenhouseId(id);
    window.dispatchEvent(new Event("greenhouseChanged"));
  };

  const [openSubMenus, setOpenSubMenus] = useState({ sensors: false });

  const menuItems = [
    { icon: "📊", name: "Dashboard", path: "/dashboard", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { icon: "🌿", name: "Seralarım", path: "/greenhouse", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { 
      icon: "📈", 
      name: "Sensörler", 
      id: "sensors",
      roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"],
      subItems: [
        { icon: "💧", name: "Sulama", path: "/irrigation", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
        { icon: "💨", name: "Havalandırma", path: "/ventilation", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
        { icon: "💡", name: "Aydınlatma", path: "/lighting", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
      ]
    },
    { icon: "📅", name: "Ekim Takvimi", path: "/calendar", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { icon: "📝", name: "Aktiviteler", path: "/activities", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { icon: "📜", name: "Raporlar", path: "/reports", roles: ["ADMIN"] },
    { icon: "👥", name: "Kullanıcılar", path: "/users", roles: ["ADMIN"] },
    { icon: "🧪", name: "Simülatör", path: "/simulator", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { icon: "🔔", name: "Uyarılar", path: "/notifications", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
    { icon: "⚙️", name: "Ayarlar", path: "/settings", roles: ["FARMER", "GREENHOUSE_MANAGER", "ADMIN"] },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const allSuggestions = [
    ...menuItems.filter(item => item.roles.includes(user?.role)).map(i => {
      return { icon: i.icon, label: i.name, path: i.path, type: 'Sayfa' };
    }),
    ...greenhouses.map(g => ({ icon: "🌿", label: g.greenhouseName, path: `/greenhouse`, type: 'Sera', id: g.id }))
  ];

  const filteredSuggestions = allSuggestions.filter(s => 
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSelectSuggestion = (suggestion) => {
    if (suggestion.type === 'Sera' && suggestion.id) {
      localStorage.setItem("SELECTED_GREENHOUSE_ID", suggestion.id);
      setSelectedGreenhouseId(suggestion.id);
      window.dispatchEvent(new Event("greenhouseChanged"));
    }
    navigate(suggestion.path);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">SeraPanel</span>
          </div>
        </div>

        <div className="sidebar-content">
          {greenhouses.length > 0 && (
            <div className="selector-section">
              <label className="selector-label">
                {isAdmin ? "Sistem Genel Bakış" : "Seçili Alan"}
              </label>
              <select 
                value={selectedGreenhouseId} 
                onChange={handleGreenhouseChange}
                className="select-glass"
              >
                <option value="">-- Alan Seçin --</option>
                {greenhouses.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.greenhouseName} {isAdmin && `(${g.ownerEmail})`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <nav className="nav-menu">
            {menuItems
              .filter(item => item.roles.includes(user?.role))
              .map(item => (
                <div key={item.name} className="nav-item-wrapper">
                  {item.subItems ? (
                    <>
                      <div 
                        className={`nav-link ${openSubMenus[item.id] ? 'active' : ''}`}
                        onClick={() => setOpenSubMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                        style={{cursor: 'pointer'}}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.name}</span>
                        <span className="submenu-arrow" style={{marginLeft: 'auto', fontSize: '10px', transform: openSubMenus[item.id] ? 'rotate(90deg)' : 'none', transition: '0.3s'}}>▶</span>
                      </div>
                      {openSubMenus[item.id] && (
                        <div className="sub-menu">
                          {item.subItems.map(sub => (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              className={({ isActive }) => `nav-link sub ${isActive ? 'active' : ''}`}
                            >
                              <span className="nav-icon" style={{fontSize: '16px'}}>{sub.icon}</span>
                              <span className="nav-label">{sub.name}</span>
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.name}</span>
                    </NavLink>
                  )}
                </div>
              ))}
          </nav>
        </div>

        <div className="sidebar-footer">

          <div className="user-profile">
            <div className="user-avatar" style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '18px',
              boxShadow: '0 8px 16px var(--primary-glow)',
              backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!user?.avatar && (user?.fullName?.charAt(0) || 'U')}
            </div>
            <div className="user-details">
              <div className="user-name" style={{fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)'}}>{user?.fullName || "Kullanıcı"}</div>
              <div className="user-role-badge" style={{fontSize: '10px', fontWeight: '800', color: 'var(--primary-dark)', textTransform: 'uppercase'}}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" style={{marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center'}}>
            <span style={{fontSize: '18px'}}>🚪</span> Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div className="header-search-container">
            <div className="search-wrapper">
              <button 
                className="search-submit-btn"
                onClick={() => filteredSuggestions.length > 0 && handleSelectSuggestion(filteredSuggestions[0])}
                title="Git"
              >
                🔍
              </button>
              <input 
                type="text" 
                className="header-search-input" 
                placeholder="Sistemde ara (Sera, Sayfa...)" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredSuggestions.length > 0) {
                    handleSelectSuggestion(filteredSuggestions[0]);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>
            {showSuggestions && searchQuery && (
              <div className="search-suggestions glass-panel">
                {filteredSuggestions.map((s, idx) => (
                  <div 
                    key={idx} 
                    className="suggestion-item" 
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents input from losing focus too early
                      handleSelectSuggestion(s);
                    }}
                  >
                    <div style={{display: 'flex', alignItems: 'center', gap: '12px', flex: 1}}>
                      <span className="s-type">{s.type}</span>
                      <span className="s-icon">{s.icon}</span>
                      <span className="s-label">{s.label}</span>
                    </div>
                    <span className="s-go-arrow">➜</span>
                  </div>
                ))}
                {filteredSuggestions.length === 0 && <div className="suggestion-empty">Sonuç bulunamadı</div>}
              </div>
            )}
          </div>
          <div className="header-actions">
            {/* Header actions */}
          </div>
        </header>
        <div className="content-inner fade-in">
          {children}
        </div>
      </main>

      <style>{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background: var(--bg-main);
        }

        .sidebar {
          width: 280px;
          background: white;
          border-right: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          z-index: 100;
          box-shadow: 10px 0 30px rgba(0,0,0,0.02);
        }

        .sidebar-header {
          padding: 40px 32px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          font-size: 32px;
          filter: drop-shadow(0 5px 10px var(--primary-glow));
        }

        .logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 24px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary-dark), #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-content {
          flex: 1;
          padding: 0 20px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          overflow-y: auto;
        }

        .selector-section {
          padding: 0 12px;
        }

        .selector-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-secondary);
          margin-bottom: 14px;
          display: block;
          letter-spacing: 1.5px;
        }

        .select-glass {
          width: 100%;
          padding: 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: var(--border-radius-sm);
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          font-weight: 600;
        }

        .select-glass:focus {
          border-color: var(--primary);
          background: white;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 24px;
          border-radius: 16px;
          text-decoration: none;
          color: #0f172a;
          font-weight: 900;
          font-size: 15px;
          transition: all 0.2s ease-in-out;
          opacity: 1 !important;
        }

        .nav-link:hover {
          background: #f8fafc;
          color: #10b981;
        }

        .nav-link.active {
          background: #10b981;
          color: white;
          box-shadow: 0 8px 20px -6px rgba(16, 185, 129, 0.4);
          font-weight: 800;
        }

        .nav-icon {
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
        }

        .sub-menu {
          margin: 4px 0 8px 34px;
          padding-left: 16px;
          border-left: 2px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-link.sub {
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 800;
          color: #334155;
          border-radius: 12px;
          opacity: 1 !important;
        }

        .nav-link.sub:hover {
          background: #f8fafc;
          color: var(--primary-dark);
        }

        .nav-link.sub.active {
          background: var(--primary-soft);
          color: var(--primary-dark);
          box-shadow: none;
        }

        .sidebar-footer {
          padding: 24px;
          background: white;
          border-top: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: auto;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px;
          background: #f8fafc;
          border-radius: 16px;
        }

        .user-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: white;
          font-size: 18px;
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role-badge {
          font-size: 10px;
          color: var(--primary-dark);
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .btn-logout {
          width: 100%;
          padding: 14px;
          background: #fff1f2;
          border: 1px solid #ffe4e6;
          border-radius: var(--border-radius-sm);
          color: #e11d48;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .btn-logout:hover {
          background: #ffe4e6;
          transform: translateY(-2px);
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }

        .top-header {
          height: 80px;
          padding: 0 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 90;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }

        .header-search-container {
          position: relative;
          width: 440px;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 0 20px;
          gap: 14px;
          transition: all 0.3s;
        }

        .search-wrapper:focus-within {
          background: white;
          border-color: var(--primary);
          box-shadow: var(--shadow-soft);
        }

        .search-submit-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: var(--text-muted);
        }

        .header-search-input {
          background: transparent;
          border: none;
          height: 48px;
          color: var(--text-primary);
          width: 100%;
          outline: none;
          font-size: 15px;
          font-weight: 500;
        }

        .search-suggestions {
          position: absolute;
          top: 115%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 20px;
          padding: 12px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 18px;
          border-radius: 14px;
          cursor: pointer;
        }

        .suggestion-item:hover {
          background: var(--primary-soft);
        }

        .s-type {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--primary-dark);
          background: white;
          padding: 4px 10px;
          border-radius: 6px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .s-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .content-inner {
          padding: 48px;
          max-width: 1600px;
          margin: 0 auto;
          width: 100%;
        }
      `}</style>
    </div>
  );
}