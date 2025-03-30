import React, { useState, useEffect, useCallback } from 'react';
import './AdminAuth.css';

const AdminAuth = () => {
  // State for login
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // State for admin management
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ 
    email: '', 
    username: '', 
    password: '', 
    role: 'admin' 
  });
  const [error, setError] = useState('');

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch admins function with useCallback
  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('https://alvins.pythonanywhere.com/api/admin/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch admins');
      }
      
      setAdmins(data.admins);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  // Decode token to get admin info
  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setCurrentAdmin(decoded);
        if (decoded.role === 'super_admin') {
          fetchAdmins();
        }
      } catch (e) {
        console.error("Token decoding failed:", e);
        setError("Invalid session. Please login again.");
        handleLogout();
      }
    }
  }, [token, fetchAdmins]);

  // Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://alvins.pythonanywhere.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      setToken(data.token);
      localStorage.setItem('adminToken', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('https://alvins.pythonanywhere.com/api/admin/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAdmin)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add admin');
      }
      
      setNewAdmin({ email: '', username: '', password: '', role: 'admin' });
      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete admin (super_admin only)
  const deleteAdmin = async (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        const response = await fetch(`https://alvins.pythonanywhere.com/api/admin/delete/${adminId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to delete admin');
        }
        
        await fetchAdmins();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setCurrentAdmin(null);
    setAdmins([]);
    setError('');
  };

  return (
    <div className="admin-auth-container">
      {!token ? (
        <div className="login-form">
          <h2>Admin Login</h2>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
        </div>
      ) : (
        <div className="admin-management">
          <div className="admin-header">
            <div className="admin-info">
              <h2>
                Welcome, {currentAdmin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}!
              </h2>
              <small>{currentAdmin?.email}</small>
            </div>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {currentAdmin?.role === 'super_admin' && (
            <>
              <div className="add-admin-form">
                <h3>Add New Admin</h3>
                <form onSubmit={addAdmin}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                        required
                        autoComplete="new-email"
                      />
                    </div>
                    <div className="form-group">
                      <label>Username:</label>
                      <input
                        type="text"
                        value={newAdmin.username}
                        onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                        required
                        autoComplete="new-username"
                      />
                    </div>
                    <div className="form-group">
                      <label>Password:</label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                        required
                        minLength="6"
                        autoComplete="new-password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role:</label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                      >
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="add-button">Add Admin</button>
                  </div>
                </form>
              </div>

              <div className="admin-list">
                <div className="list-header">
                  <h3>Admin List</h3>
                  <button onClick={fetchAdmins} className="refresh-button">
                    Refresh
                  </button>
                </div>
                {isMobile ? (
                  <div className="mobile-admin-list">
                    {admins.map(admin => (
                      <div key={admin.admin_id} className="mobile-admin-card">
                        <div className="admin-details">
                          <div className="admin-main">
                            <strong>{admin.username}</strong>
                            <span className={`role ${admin.role}`}>{admin.role}</span>
                          </div>
                          <div className="admin-secondary">
                            <small>{admin.email}</small>
                            <small>{new Date(admin.created_at).toLocaleDateString()}</small>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteAdmin(admin.admin_id)}
                          className="delete-button"
                          disabled={admin.role === 'super_admin' && currentAdmin.admin_id === admin.admin_id}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Email</th>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.map(admin => (
                          <tr key={admin.admin_id}>
                            <td>{admin.admin_id}</td>
                            <td>{admin.email}</td>
                            <td>{admin.username}</td>
                            <td className={`role ${admin.role}`}>
                              {admin.role}
                            </td>
                            <td>{new Date(admin.created_at).toLocaleString()}</td>
                            <td>
                              <button 
                                onClick={() => deleteAdmin(admin.admin_id)}
                                className="delete-button"
                                disabled={admin.role === 'super_admin' && currentAdmin.admin_id === admin.admin_id}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminAuth;