import React, { useState, useEffect } from 'react';
import './Offer.css';

const Offer = () => {
  // State for offers and form data
  const [offers, setOffers] = useState([]);
  const [formData, setFormData] = useState({
    product_name: '',
    product_desc: '',
    original_price: 0,
    discount_percentage: 0,
    offer_code: '',
    category: '',
    start_date: '',
    end_date: '',
    status: 'active',
    product_photo: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState(null);

  // Fetch all offers on component mount
  useEffect(() => {
    fetchOffers();
  }, []);

  // Fetch all offers
  const fetchOffers = async () => {
    try {
      const response = await fetch('https://alvins.pythonanywhere.com/api/getOfferProducts');
      const data = await response.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      product_photo: e.target.files[0]
    });
  };

  // Submit form (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null) {
        form.append(key, formData[key]);
      }
    });

    try {
      if (isEditing) {
        await fetch(`https://alvins.pythonanywhere.com/api/updateOfferProduct/${currentOfferId}`, {
          method: 'PUT',
          body: form,
        });
      } else {
        await fetch('https://alvins.pythonanywhere.com/api/addOfferProduct', {
          method: 'POST',
          body: form,
        });
      }
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  // Edit an offer
  const handleEdit = (offer) => {
    setFormData({
      product_name: offer.title,
      product_desc: offer.description,
      original_price: offer.original_price,
      discount_percentage: offer.discount_percentage,
      offer_code: offer.offer_code,
      category: offer.category,
      start_date: offer.start_date,
      end_date: offer.end_date,
      status: offer.status,
      product_photo: null
    });
    setCurrentOfferId(offer.id);
    setIsEditing(true);
  };

  // Delete an offer
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await fetch(`/api/deleteOfferProduct/${id}`, { method: 'DELETE' });
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      product_name: '',
      product_desc: '',
      original_price: 0,
      discount_percentage: 0,
      offer_code: '',
      category: '',
      start_date: '',
      end_date: '',
      status: 'active',
      product_photo: null
    });
    setCurrentOfferId(null);
    setIsEditing(false);
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    const original = parseFloat(formData.original_price) || 0;
    const discount = parseFloat(formData.discount_percentage) || 0;
    return (original - (original * discount / 100)).toFixed(2);
  };

  return (
    <div className="offer-container">
      <h2>{isEditing ? 'Edit Offer' : 'Manage Offers'}</h2>

      {isEditing ? (
        // Edit/Create Form
        <form onSubmit={handleSubmit} className="offer-form">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="product_desc"
              value={formData.product_desc}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Original Price</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleInputChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label>Discounted Price</label>
              <input
                type="text"
                value={calculateDiscountedPrice()}
                readOnly
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Offer Code</label>
              <input
                type="text"
                name="offer_code"
                value={formData.offer_code}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              {isEditing ? 'Update Offer' : 'Create Offer'}
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        // Offers List
        <>
          <button 
            onClick={() => setIsEditing(true)} 
            className="btn-add"
          >
            Add New Offer
          </button>

          <table className="offers-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Original Price</th>
                <th>Discounted Price</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td>
                    {offer.image && (
                      <img 
                        src={offer.image_url} 
                        alt={offer.title} 
                        className="offer-image"
                      />
                    )}
                  </td>
                  <td>{offer.title}</td>
                  <td>Ksh{offer.original_price}</td>
                  <td>Ksh{offer.discounted_price}</td>
                  <td>{offer.discount_percentage}%</td>
                  <td>
                    <span className={`status-badge ${offer.status}`}>
                      {offer.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEdit(offer)} 
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(offer.id)} 
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Offer;