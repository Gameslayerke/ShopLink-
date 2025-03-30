import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiUsers, FiEdit2, FiTrash2, FiSearch, 
  FiX, FiSave 
} from 'react-icons/fi';
import './Users.css';

const Users = () => {
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
    username: '',
    phone: '',
    role: ''
  });

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://alvins.pythonanywhere.com/api/users');
      setUsers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single user by ID
  const fetchUserById = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`https://alvins.pythonanywhere.com/api/users/${userId}`);
      setSelectedUser(response.data);
      setFormData(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch user details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async () => {
    try {
      setLoading(true);
      await axios.put(
        `https://alvins.pythonanywhere.com/api/users/${formData.user_id}`,
        { phone: formData.phone }
      );
      await fetchUsers();
      setEditMode(false);
      setError('');
    } catch (err) {
      setError('Failed to update user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await axios.delete(`https://alvins.pythonanywhere.com/api/users/${userId}`);
        await fetchUsers();
        if (selectedUser && selectedUser.user_id === userId) {
          setSelectedUser(null);
        }
        setError('');
      } catch (err) {
        setError('Failed to delete user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Initialize
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.user_id && user.user_id.toString().includes(searchTerm))
  );

  return (
    <div className="users-container">
      {/* Header */}
      <header className="users-header">
        <h1><FiUsers /> User Management</h1>
      </header>

      {/* Search and User List */}
      <div className="users-list-container">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading && <div className="loading">Loading users...</div>}
        {error && <div className="error">{error}</div>}

        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="actions">
                  <button 
                    onClick={() => fetchUserById(user.user_id)}
                    className="view-btn"
                  >
                    <FiEdit2 /> View
                  </button>
                  <button 
                    onClick={() => deleteUser(user.user_id)}
                    className="delete-btn"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Panel */}
      {selectedUser && (
        <div className="user-detail-panel">
          <div className="panel-header">
            <h2>User Details</h2>
            <button onClick={() => {
              setSelectedUser(null);
              setEditMode(false);
            }} className="close-btn">
              <FiX />
            </button>
          </div>

          {editMode ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Email:</label>
                <input 
                  type="text" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Username:</label>
                <input 
                  type="text" 
                  name="username" 
                  value={formData.username || ''} 
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone || ''} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Role:</label>
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role || ''} 
                  onChange={handleInputChange}
                  disabled
                />
              </div>
              <div className="form-actions">
                <button onClick={() => setEditMode(false)} className="cancel-btn">
                  Cancel
                </button>
                <button onClick={updateUser} className="save-btn">
                  <FiSave /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="user-details">
              <p><strong>ID:</strong> {selectedUser.user_id}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>Role:</strong> {selectedUser.role || 'N/A'}</p>
              <p><strong>Created At:</strong> {new Date(selectedUser.created_at).toLocaleString()}</p>
              
              <div className="detail-actions">
                <button onClick={() => setEditMode(true)} className="edit-btn">
                  <FiEdit2 /> Edit
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Users;