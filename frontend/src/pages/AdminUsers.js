import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { getUsers, registerUser, deleteUser } from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "FARMER",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerUser(newUser);
      setNewUser({ fullName: "", email: "", password: "", role: "FARMER" });
      fetchUsers();
      alert("✅ Kullanıcı başarıyla eklendi.");
    } catch (err) {
      alert("❌ Hata: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (window.confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteUser(email);
        fetchUsers();
      } catch (err) {
        alert("❌ Silme işlemi başarısız.");
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    if (role === "ADMIN") return "badge-danger";
    if (role === "GREENHOUSE_MANAGER") return "badge-info";
    return "badge-success";
  };

  return (
    <MainLayout>
      <div className="admin-page">
        <header className="page-header">
          <div>
            <h1 className="page-title">👥 Kullanıcı Yönetimi</h1>
            <p className="page-subtitle">Sistem yetkilerini ve kullanıcı profillerini yönetin</p>
          </div>
        </header>

        <div className="admin-grid">
          <div className="left-panel">

            <section className="premium-card form-card">
              <div className="card-header">
                <h3>➕ Yeni Kullanıcı Tanımla</h3>
              </div>
              <form onSubmit={handleAddUser} className="user-form">
                <div className="form-group">
                  <label>Ad Soyad</label>
                  <input
                    className="input-glass"
                    placeholder="Ad Soyad"
                    value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>E-Posta</label>
                  <input
                    className="input-glass"
                    type="email"
                    placeholder="user@example.com"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Şifre</label>
                  <input
                    className="input-glass"
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    className="input-glass"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="FARMER">Çiftçi</option>
                    <option value="GREENHOUSE_MANAGER">Yönetici</option>
                    <option value="ADMIN">Sistem Admin</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Oluşturuluyor..." : "Kullanıcıyı Kaydet"}
                </button>
              </form>
            </section>
          </div>

          <div className="right-panel">
            <section className="premium-card list-card">
              <div className="list-header">
                <h3>📋 Kayıtlı Kullanıcılar</h3>
                <div className="filter-controls">
                  <select 
                    className="input-glass filter-select" 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)}
                  >
                    <option value="ALL">Tüm Roller</option>
                    <option value="ADMIN">Admin</option>
                    <option value="GREENHOUSE_MANAGER">Yönetici</option>
                    <option value="FARMER">Çiftçi</option>
                  </select>
                  <input 
                    type="text" 
                    className="input-glass search-input" 
                    placeholder="Kullanıcı ara..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <p className="loading-text">Yükleniyor...</p>
              ) : (
                <div className="table-container">
                  <table className="premium-table">
                    <thead>
                      <tr>
                        <th>Kullanıcı</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr><td colSpan="4" className="empty-row">Kullanıcı bulunamadı.</td></tr>
                      ) : (
                        filteredUsers.map((u) => (
                          <tr key={u.email}>
                            <td>
                              <div className="user-profile">
                                <div className="avatar">{u.fullName?.charAt(0)}</div>
                                <span>{u.fullName}</span>
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>
                              <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                                {u.role === 'GREENHOUSE_MANAGER' ? 'YÖNETİCİ' : u.role}
                              </span>
                            </td>
                            <td>
                              <button className="btn-icon danger" onClick={() => handleDeleteUser(u.email)}>🗑</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .admin-page { animation: fadeIn 0.6s ease-out; }
        .page-header { margin-bottom: 32px; }
        .admin-grid { display: grid; grid-template-columns: 360px 1fr; gap: 32px; }
        
        .user-form { display: flex; flex-direction: column; gap: 16px; }
        
        .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .filter-controls { display: flex; gap: 12px; }
        .filter-select { width: 170px; height: 50px; font-weight: 800; font-size: 15px; color: #1e293b; padding: 0 16px; cursor: pointer; }
        .search-input { width: 280px; height: 50px; font-weight: 700; font-size: 15px; color: #1e293b; padding: 0 16px; }
        
        .table-container { overflow-x: auto; }
        .premium-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
        .premium-table th { text-align: left; padding: 12px 16px; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .premium-table tbody tr { background: var(--glass-bg); transition: transform 0.2s; }
        .premium-table tbody tr:hover { transform: scale(1.01); background: rgba(255,255,255,0.05); }
        .premium-table td { padding: 16px; font-size: 14px; }
        .premium-table td:first-child { border-radius: 12px 0 0 12px; }
        .premium-table td:last-child { border-radius: 0 12px 12px 0; }
        
        .user-profile { display: flex; align-items: center; gap: 12px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: white; }
        
        .badge { padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; }
        .badge-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .badge-info { background: rgba(59, 130, 246, 0.1); color: var(--secondary); }
        .badge-success { background: rgba(34, 197, 94, 0.1); color: var(--primary); }
        
        .empty-row { text-align: center; color: var(--text-muted); padding: 40px; }
        .loading-text { text-align: center; color: var(--text-muted); padding: 40px; }
      `}</style>
    </MainLayout>
  );
}

