import React, { useState, useEffect } from 'react';
import './OrderItems.css';

const OrderItems = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: '', price: '' });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all order items
  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        const response = await fetch('https://alvins.pythonanywhere.com/api/order_items');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch order items');
        setOrderItems(data);
        setFilteredItems(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchOrderItems();
  }, []);

  // Filter items based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = orderItems.filter(item => 
        item.order_id.toString().includes(searchTerm) ||
        item.product_id.toString().includes(searchTerm)
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems(orderItems);
    }
  }, [searchTerm, orderItems]);

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enter edit mode
  const handleEdit = (item) => {
    setEditMode(item.order_item_id);
    setEditForm({
      quantity: item.quantity,
      price: item.price
    });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditMode(null);
    setEditForm({ quantity: '', price: '' });
  };

  // Update order item
  const handleUpdate = async (orderItemId) => {
    if (!editForm.quantity && !editForm.price) {
      setError('Please enter quantity or price to update');
      return;
    }

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/api/order_items/${orderItemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update order item');

      // Update local state
      setOrderItems(prev => prev.map(item => 
        item.order_item_id === orderItemId ? { 
          ...item, 
          quantity: editForm.quantity || item.quantity,
          price: editForm.price || item.price 
        } : item
      ));

      setEditMode(null);
      setEditForm({ quantity: '', price: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete order item
  const handleDelete = async (orderItemId) => {
    if (!window.confirm('Are you sure you want to delete this order item?')) return;

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/api/order_items/${orderItemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to delete order item');

      // Update local state
      setOrderItems(prev => prev.filter(item => item.order_item_id !== orderItemId));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading order items...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="order-items-container">
      <div className="order-items-header">
        <h2>Order Items Management</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Order ID or Product ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="refresh-btn" onClick={() => setSearchTerm('')}>
            Clear
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isMobile ? (
        <div className="mobile-order-items-list">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <div key={item.order_item_id} className="mobile-order-item-card">
                <div className="card-header">
                  <span className="order-id">Order #{item.order_id}</span>
                  <span className="product-id">Product #{item.product_id}</span>
                </div>
                <div className="card-body">
                  <div className="item-detail">
                    <span>Quantity:</span>
                    {editMode === item.order_item_id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editForm.quantity}
                        onChange={handleEditChange}
                        min="1"
                      />
                    ) : (
                      <span>{item.quantity}</span>
                    )}
                  </div>
                  <div className="item-detail">
                    <span>Price:</span>
                    {editMode === item.order_item_id ? (
                      <input
                        type="number"
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <span>${item.price}</span>
                    )}
                  </div>
                </div>
                <div className="card-actions">
                  {editMode === item.order_item_id ? (
                    <>
                      <button 
                        className="save-btn"
                        onClick={() => handleUpdate(item.order_item_id)}
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
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(item.order_item_id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">No order items found</div>
          )}
        </div>
      ) : (
        <div className="order-items-table-container">
          <table className="order-items-table">
            <thead>
              <tr>
                <th>Order Item ID</th>
                <th>Order ID</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <tr key={item.order_item_id}>
                    <td>{item.order_item_id}</td>
                    <td>{item.order_id}</td>
                    <td>{item.product_id}</td>
                    <td>
                      {editMode === item.order_item_id ? (
                        <input
                          type="number"
                          name="quantity"
                          value={editForm.quantity}
                          onChange={handleEditChange}
                          min="1"
                        />
                      ) : (
                        item.quantity
                      )}
                    </td>
                    <td>
                      {editMode === item.order_item_id ? (
                        <input
                          type="number"
                          name="price"
                          value={editForm.price}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        `$${item.price}`
                      )}
                    </td>
                    <td className="actions-cell">
                      {editMode === item.order_item_id ? (
                        <>
                          <button 
                            className="save-btn"
                            onClick={() => handleUpdate(item.order_item_id)}
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
                            onClick={() => handleEdit(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => handleDelete(item.order_item_id)}
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
                  <td colSpan="6" className="no-results">No order items found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderItems;