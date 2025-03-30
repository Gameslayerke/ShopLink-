import React, { useState, useEffect } from 'react';
import './Sellers.css';

const Sellers = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({ store_name: '', approval_status: 'pending' });
  const [newSeller, setNewSeller] = useState({ user_id: '', store_name: '', approval_status: 'pending' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all sellers
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await fetch('https://alvins.pythonanywhere.com/sellers');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch sellers');
        setSellers(data);
        setFilteredSellers(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchSellers();
  }, []);

  // Filter sellers based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = sellers.filter(seller => 
        seller.seller_id.toString().includes(searchTerm) ||
        seller.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.approval_status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSellers(filtered);
    } else {
      setFilteredSellers(sellers);
    }
  }, [searchTerm, sellers]);

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new seller form changes
  const handleNewSellerChange = (e) => {
    const { name, value } = e.target;
    setNewSeller(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enter edit mode
  const handleEdit = (seller) => {
    setEditMode(seller.seller_id);
    setEditForm({
      store_name: seller.store_name,
      approval_status: seller.approval_status
    });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditMode(null);
    setEditForm({ store_name: '', approval_status: 'pending' });
  };

  // Update seller
  const handleUpdate = async (sellerId) => {
    if (!editForm.store_name) {
      setError('Store name is required');
      return;
    }

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/sellers/${sellerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update seller');

      // Update local state
      setSellers(prev => prev.map(seller => 
        seller.seller_id === sellerId ? { 
          ...seller, 
          store_name: editForm.store_name,
          approval_status: editForm.approval_status 
        } : seller
      ));

      setEditMode(null);
      setEditForm({ store_name: '', approval_status: 'pending' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Create new seller
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSeller.user_id || !newSeller.store_name) {
      setError('User ID and Store Name are required');
      return;
    }

    try {
      const response = await fetch('https://alvins.pythonanywhere.com/sellers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSeller)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create seller');

      // Update local state
      setSellers(prev => [...prev, {
        seller_id: data.id || prev.length + 1, // Fallback if ID not returned
        user_id: newSeller.user_id,
        store_name: newSeller.store_name,
        approval_status: newSeller.approval_status
      }]);

      setNewSeller({ user_id: '', store_name: '', approval_status: 'pending' });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete seller
  const handleDelete = async (sellerId) => {
    if (!window.confirm('Are you sure you want to delete this seller?')) return;

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/sellers/${sellerId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete seller');

      // Update local state
      setSellers(prev => prev.filter(seller => seller.seller_id !== sellerId));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading sellers...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="sellers-container">
      <div className="sellers-header">
        <h2>Sellers Management</h2>
        <div className="search-create-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by ID, Store Name or Status"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="refresh-btn" onClick={() => setSearchTerm('')}>
              Clear
            </button>
          </div>
          <button 
            className="create-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Add New Seller'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create New Seller Form */}
      {showCreateForm && (
        <div className="create-seller-form">
          <h3>Create New Seller</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>User ID:</label>
              <input
                type="number"
                name="user_id"
                value={newSeller.user_id}
                onChange={handleNewSellerChange}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Store Name:</label>
              <input
                type="text"
                name="store_name"
                value={newSeller.store_name}
                onChange={handleNewSellerChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Approval Status:</label>
              <select
                name="approval_status"
                value={newSeller.approval_status}
                onChange={handleNewSellerChange}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Create</button>
            </div>
          </form>
        </div>
      )}

      {isMobile ? (
        <div className="mobile-sellers-list">
          {filteredSellers.length > 0 ? (
            filteredSellers.map(seller => (
              <div key={seller.seller_id} className="mobile-seller-card">
                <div className="card-header">
                  <span className="seller-id">ID: {seller.seller_id}</span>
                  <span className={`status ${seller.approval_status}`}>
                    {seller.approval_status}
                  </span>
                </div>
                <div className="card-body">
                  <div className="seller-detail">
                    <span>User ID:</span>
                    <span>{seller.user_id}</span>
                  </div>
                  <div className="seller-detail">
                    <span>Store Name:</span>
                    {editMode === seller.seller_id ? (
                      <input
                        type="text"
                        name="store_name"
                        value={editForm.store_name}
                        onChange={handleEditChange}
                        required
                      />
                    ) : (
                      <span>{seller.store_name}</span>
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  {editMode === seller.seller_id ? (
                    <>
                      <div className="status-select">
                        <select
                          name="approval_status"
                          value={editForm.approval_status}
                          onChange={handleEditChange}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      <button 
                        className="save-btn"
                        onClick={() => handleUpdate(seller.seller_id)}
                      >
                        Save
                      </button>
                      <button 
                        className="cancel-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(seller)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(seller.seller_id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No sellers found</div>
          )}
        </div>
      ) : (
        <div className="sellers-table-container">
          <table className="sellers-table">
            <thead>
              <tr>
                <th>Seller ID</th>
                <th>User ID</th>
                <th>Store Name</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.length > 0 ? (
                filteredSellers.map(seller => (
                  <tr key={seller.seller_id}>
                    <td>{seller.seller_id}</td>
                    <td>{seller.user_id}</td>
                    <td>
                      {editMode === seller.seller_id ? (
                        <input
                          type="text"
                          name="store_name"
                          value={editForm.store_name}
                          onChange={handleEditChange}
                          required
                        />
                      ) : (
                        seller.store_name
                      )}
                    </td>
                    <td>
                      {editMode === seller.seller_id ? (
                        <select
                          name="approval_status"
                          value={editForm.approval_status}
                          onChange={handleEditChange}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      ) : (
                        <span className={`status ${seller.approval_status}`}>
                          {seller.approval_status}
                        </span>
                      )}
                    </td>
                    <td className="actions-cell">
                      {editMode === seller.seller_id ? (
                        <>
                          <button 
                            className="save-btn"
                            onClick={() => handleUpdate(seller.seller_id)}
                          >
                            Save
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEdit(seller)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(seller.seller_id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-results">No sellers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Sellers;