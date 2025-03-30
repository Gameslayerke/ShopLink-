import React, { useState, useEffect } from 'react';
import './Coupons.css';

const Coupons = () => {
  // State management
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_percentage: '',
    expiration_date: '',
    min_order_value: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await fetch('https://alvins.pythonanywhere.com/coupons');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch coupons');
        setCoupons(data);
        setFilteredCoupons(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = coupons.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.coupon_id.toString().includes(searchTerm)
      );
      setFilteredCoupons(filtered);
    } else {
      setFilteredCoupons(coupons);
    }
  }, [searchTerm, coupons]);

  // Form handler
  const handleNewCouponChange = (e) => {
    const { name, value } = e.target;
    setNewCoupon(prev => ({ ...prev, [name]: value }));
  };

  // Create operation
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount_percentage || !newCoupon.expiration_date) {
      setError('Code, discount percentage, and expiration date are required');
      return;
    }

    try {
      const response = await fetch('https://alvins.pythonanywhere.com/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Creation failed');

      setCoupons(prev => [...prev, {
        coupon_id: data.id || prev.length + 1,
        ...newCoupon
      }]);
      setNewCoupon({
        code: '',
        discount_percentage: '',
        expiration_date: '',
        min_order_value: ''
      });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete operation
  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/coupons/${couponId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deletion failed');

      setCoupons(prev => prev.filter(coupon => coupon.coupon_id !== couponId));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Status indicator
  const getCouponStatus = (expirationDate) => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    return expDate < today ? 'Expired' : 'Active';
  };

  if (loading) return <div className="loading">Loading coupons...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="coupons-container">
      <div className="coupons-header">
        <h2>Coupon Management</h2>
        <div className="search-create-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by code or ID"
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
            {showCreateForm ? 'Cancel' : 'Create Coupon'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Create Coupon Form */}
      {showCreateForm && (
        <div className="create-coupon-form">
          <h3>Create New Coupon</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Coupon Code:</label>
                <input
                  type="text"
                  name="code"
                  value={newCoupon.code}
                  onChange={handleNewCouponChange}
                  required
                  maxLength="20"
                />
              </div>
              <div className="form-group">
                <label>Discount Percentage:</label>
                <input
                  type="number"
                  name="discount_percentage"
                  value={newCoupon.discount_percentage}
                  onChange={handleNewCouponChange}
                  required
                  min="1"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Expiration Date:</label>
                <input
                  type="date"
                  name="expiration_date"
                  value={newCoupon.expiration_date}
                  onChange={handleNewCouponChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Minimum Order Value (optional):</label>
                <input
                  type="number"
                  name="min_order_value"
                  value={newCoupon.min_order_value}
                  onChange={handleNewCouponChange}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Create Coupon</button>
            </div>
          </form>
        </div>
      )}

      {/* Coupons List */}
      <div className="coupons-list-section">
        <h3>Available Coupons ({filteredCoupons.length})</h3>
        {isMobile ? (
          <div className="mobile-coupons-list">
            {filteredCoupons.length > 0 ? (
              filteredCoupons.map(coupon => (
                <div key={coupon.coupon_id} className="mobile-coupon-card">
                  <div className="card-header">
                    <span className="coupon-code">{coupon.code}</span>
                    <span className={`status ${getCouponStatus(coupon.expiration_date).toLowerCase()}`}>
                      {getCouponStatus(coupon.expiration_date)}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="coupon-detail">
                      <span>Discount:</span>
                      <span>{coupon.discount_percentage}%</span>
                    </div>
                    <div className="coupon-detail">
                      <span>Expires:</span>
                      <span>{new Date(coupon.expiration_date).toLocaleDateString()}</span>
                    </div>
                    {coupon.min_order_value > 0 && (
                      <div className="coupon-detail">
                        <span>Min. Order:</span>
                        <span>${coupon.min_order_value}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(coupon.coupon_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No coupons found</div>
            )}
          </div>
        ) : (
          <div className="coupons-table-container">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Expiration</th>
                  <th>Min. Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map(coupon => (
                    <tr key={coupon.coupon_id}>
                      <td>{coupon.coupon_id}</td>
                      <td>{coupon.code}</td>
                      <td>{coupon.discount_percentage}%</td>
                      <td>{new Date(coupon.expiration_date).toLocaleDateString()}</td>
                      <td>{coupon.min_order_value ? `$${coupon.min_order_value}` : '-'}</td>
                      <td>
                        <span className={`status ${getCouponStatus(coupon.expiration_date).toLowerCase()}`}>
                          {getCouponStatus(coupon.expiration_date)}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(coupon.coupon_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-results">No coupons found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;