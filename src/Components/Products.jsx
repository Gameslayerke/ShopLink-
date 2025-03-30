import React, { useState, useEffect, useCallback } from 'react';
import './Products.css';

const Products = () => {

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    product_desc: '',
    product_cost: '',
    product_photo: null,
    previewImage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_BASE_URL = 'https://alvins.pythonanywhere.com';
  const IMAGE_BASE_URL = `${API_BASE_URL}/static/images`;

  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification({ show: false, message: '', type: '' });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/getproducts`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data);
      hideNotification();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [hideNotification, showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const fetchProduct = async (id) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      
      const data = await response.json();
      setFormData({
        ...data,
        previewImage: data.product_photo ? `${IMAGE_BASE_URL}/${data.product_photo}` : ''
      });
      setIsEditing(true);
      hideNotification();
      if (isMobile) {
        document.querySelector('.product-form-container').scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        product_photo: file,
        previewImage: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formPayload = new FormData();
    formPayload.append('product_name', formData.product_name);
    formPayload.append('product_desc', formData.product_desc);
    formPayload.append('product_cost', formData.product_cost);
    
    if (formData.product_photo instanceof File) {
      formPayload.append('product_photo', formData.product_photo);
    }

    try {
      const endpoint = isEditing 
        ? `${API_BASE_URL}/api/products/${formData.product_id}`
        : `${API_BASE_URL}/api/addproduct`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(endpoint, { method, body: formPayload });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }

      showNotification(
        isEditing ? 'Product updated successfully' : 'Product added successfully',
        'success'
      );
      resetForm();
      fetchProducts();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      showNotification('Product deleted successfully', 'success');
      setProducts(prev => prev.filter(product => product.product_id !== id));
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      product_name: '',
      product_desc: '',
      product_cost: '',
      product_photo: null,
      previewImage: ''
    });
    setIsEditing(false);
  };

  const calculateTotalWorth = () => {
    return products.reduce((total, product) => {
      return total + (parseFloat(product.product_cost) || 0);
    }, 0).toFixed(2);
  };

  const toggleShowAllProducts = () => {
    setShowAllProducts(!showAllProducts);
  };

  const displayedProducts = showAllProducts ? products : products.slice(0, isMobile ? 3 : 5);

  return (
    <div className="products-management">
      <header className="management-header">
        <h2>Product Inventory</h2>
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </header>

      {}
      <div className="product-summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Worth</h3>
          <p>Ksh {calculateTotalWorth()}</p>
        </div>
        <button 
          onClick={toggleShowAllProducts}
          className="toggle-products-btn"
        >
          {showAllProducts ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="products-list-container">
        <div className="list-header">
          <h3>{showAllProducts ? 'All Products' : 'Recent Products'}</h3>
          <button 
            onClick={() => document.querySelector('.product-form-container').scrollIntoView({ behavior: 'smooth' })}
            className="add-new-btn"
          >
            {isMobile ? '+' : '+ Add New Product'}
          </button>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="loading-state">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <div className="table-responsive">
            {isMobile ? (
              <div className="mobile-products-list">
                {displayedProducts.map(product => (
                  <div key={product.product_id} className="mobile-product-card">
                    <div className="mobile-product-image">
                      {product.product_photo && (
                        <img 
                          src={`${IMAGE_BASE_URL}/${product.product_photo}`} 
                          alt={product.product_name}
                        />
                      )}
                    </div>
                    <div className="mobile-product-details">
                      <h4>{product.product_name}</h4>
                      <p>Ksh {parseFloat(product.product_cost).toFixed(2)}</p>
                      <p className="description">{product.product_desc}</p>
                    </div>
                    <div className="mobile-product-actions">
                      <button 
                        onClick={() => fetchProduct(product.product_id)}
                        disabled={isLoading}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteProduct(product.product_id)}
                        disabled={isLoading}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Product</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedProducts.map(product => (
                    <tr key={product.product_id}>
                      <td>{product.product_id}</td>
                      <td className="product-cell">
                        {product.product_photo && (
                          <img 
                            src={`${IMAGE_BASE_URL}/${product.product_photo}`} 
                            alt={product.product_name}
                            className="product-thumbnail"
                          />
                        )}
                        <span>{product.product_name}</span>
                      </td>
                      <td>{product.product_desc}</td>
                      <td>Ksh {parseFloat(product.product_cost).toFixed(2)}</td>
                      <td className="action-buttons">
                        <button 
                          onClick={() => fetchProduct(product.product_id)}
                          disabled={isLoading}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteProduct(product.product_id)}
                          disabled={isLoading}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <div className="product-form-container">
        <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
        
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="product_name">Product Name</label>
              <input
                id="product_name"
                type="text"
                name="product_name"
                value={formData.product_name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="product_cost">Price (Ksh)</label>
              <input
                id="product_cost"
                type="number"
                name="product_cost"
                value={formData.product_cost}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group span-2">
              <label htmlFor="product_desc">Description</label>
              <textarea
                id="product_desc"
                name="product_desc"
                value={formData.product_desc}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group span-2">
              <label htmlFor="product_photo">Product Image</label>
              <input
                id="product_photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required={!isEditing}
              />
              {formData.previewImage && (
                <div className="image-preview">
                  <img src={formData.previewImage} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? 'Processing...' : (isEditing ? 'Update Product' : 'Add Product')}
            </button>
            {isEditing && (
              <button 
                type="button" 
                onClick={resetForm}
                disabled={isLoading}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Products;