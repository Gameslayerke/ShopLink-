import React, { useState, useEffect } from 'react';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('all'); // 'all', 'user', 'single'
  const [userId, setUserId] = useState('');
  const [wishlistId, setWishlistId] = useState('');
  const [singleItem, setSingleItem] = useState(null);

  // Fetch all wishlist items
  const fetchAllWishlists = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://alvins.pythonanywhere.com/wishlist');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setWishlists(data);
      setCurrentView('all');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch wishlist by user ID
  const fetchWishlistByUser = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://alvins.pythonanywhere.com/api/wishlist/user/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setWishlists(data);
      setCurrentView('user');
      setError(null);
    } catch (err) {
      setError(err.message);
      setWishlists([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single wishlist item
  const fetchSingleItem = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://alvins.pythonanywhere.com/wishlist/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSingleItem(data);
      setCurrentView('single');
      setError(null);
    } catch (err) {
      setError(err.message);
      setSingleItem(null);
    } finally {
      setLoading(false);
    }
  };

  // Delete wishlist item
  const deleteWishlistItem = async (id) => {
    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/wishlist/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      
      // Refresh the current view
      if (currentView === 'all') {
        fetchAllWishlists();
      } else if (currentView === 'user') {
        fetchWishlistByUser(userId);
      }
      
      alert('Item deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submissions
  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (userId) {
      fetchWishlistByUser(userId);
    }
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (wishlistId) {
      fetchSingleItem(wishlistId);
    }
  };

  // Fetch all wishlists on component mount
  useEffect(() => {
    fetchAllWishlists();
  }, []);

  // Filter wishlists based on search term
  const filteredWishlists = wishlists.filter(item => {
    if (currentView === 'user') {
      return (
        item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product_id?.toString().includes(searchTerm)
      );
    }
    return (
      item.user_id?.toString().includes(searchTerm) ||
      item.product_id?.toString().includes(searchTerm)
    );
  });

  return (
    <div className="wishlist-container">
      <h1>Wishlist Management</h1>
      
      {/* Navigation and search */}
      <div className="wishlist-controls">
        <button onClick={fetchAllWishlists} className="btn-view-all">
          View All Wishlists
        </button>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {/* Filter forms */}
      <div className="filter-forms">
        <form onSubmit={handleUserSubmit} className="filter-form">
          <input
            type="number"
            placeholder="User ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="filter-input"
          />
          <button type="submit" className="btn-filter">
            Get User Wishlist
          </button>
        </form>
        
        <form onSubmit={handleSingleSubmit} className="filter-form">
          <input
            type="number"
            placeholder="Wishlist Item ID"
            value={wishlistId}
            onChange={(e) => setWishlistId(e.target.value)}
            className="filter-input"
          />
          <button type="submit" className="btn-filter">
            Get Single Item
          </button>
        </form>
      </div>
      
      {/* Error display */}
      {error && <div className="error-message">Error: {error}</div>}
      
      {/* Loading state */}
      {loading && <div className="loading-spinner">Loading...</div>}
      
      {/* Content display */}
      {!loading && (
        <>
          {currentView === 'single' && singleItem ? (
            <div className="single-item-view">
              <h2>Wishlist Item Details</h2>
              <div className="item-details">
                <p><strong>Wishlist ID:</strong> {singleItem.wishlist_id}</p>
                <p><strong>User ID:</strong> {singleItem.user_id}</p>
                <p><strong>Product ID:</strong> {singleItem.product_id}</p>
                <p><strong>Created At:</strong> {new Date(singleItem.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => deleteWishlistItem(singleItem.wishlist_id)}
                className="btn-delete"
              >
                Delete Item
              </button>
              <button 
                onClick={() => setCurrentView('all')}
                className="btn-back"
              >
                Back to All
              </button>
            </div>
          ) : currentView === 'all' ? (
            <>
              <h2>All Wishlist Items</h2>
              {filteredWishlists.length > 0 ? (
                <table className="wishlist-table">
                  <thead>
                    <tr>
                      <th>Wishlist ID</th>
                      <th>User ID</th>
                      <th>Product ID</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWishlists.map((item) => (
                      <tr key={item.wishlist_id}>
                        <td>{item.wishlist_id}</td>
                        <td>{item.user_id}</td>
                        <td>{item.product_id}</td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td>
                          <button 
                            onClick={() => fetchSingleItem(item.wishlist_id)}
                            className="btn-view"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => deleteWishlistItem(item.wishlist_id)}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No wishlist items found.</p>
              )}
            </>
          ) : currentView === 'user' && (
            <>
              <h2>Wishlist for User {userId}</h2>
              {filteredWishlists.length > 0 ? (
                <table className="wishlist-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Price</th>
                      <th>Added On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWishlists.map((item) => (
                      <tr key={item.wishlist_id}>
                        <td>{item.product_name}</td>
                        <td>${item.price}</td>
                        <td>{new Date(item.created_at).toLocaleString()}</td>
                        <td>
                          <button 
                            onClick={() => deleteWishlistItem(item.wishlist_id)}
                            className="btn-delete"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No wishlist items found for this user.</p>
              )}
            </>
          )}
        </>
      )}
      
      {/* Statistics */}
      {!loading && currentView !== 'single' && wishlists.length > 0 && (
        <div className="wishlist-stats">
          <h3>Statistics</h3>
          <p>Total Items: {wishlists.length}</p>
          {currentView === 'user' && (
            <p>Total Value: ${wishlists.reduce((sum, item) => sum + parseFloat(item.price || 0), 0).toFixed(2)}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;