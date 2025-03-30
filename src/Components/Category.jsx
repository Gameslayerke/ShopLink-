import React, { useState, useEffect } from 'react';
import './Category.css';

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState({
    category_id: '',
    category_name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://alvins.pythonanywhere.com/categories');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch categories');
      setCategories(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single category by ID
  const fetchCategoryById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/categories/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Category not found');
      setCurrentCategory(data);
      setIsEditing(true);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create or update category
  const saveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = isEditing 
      ? `https://alvins.pythonanywhere.com/categories/${currentCategory.category_id}`
      : 'https://alvins.pythonanywhere.com/categories';
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_name: currentCategory.category_name
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Operation failed');
      
      setSuccess(data.message);
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 3000);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setLoading(true);
      try {
        const response = await fetch(`https://alvins.pythonanywhere.com/categories/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Delete failed');
        setSuccess(data.message);
        fetchCategories();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setTimeout(() => {
          setSuccess('');
          setError('');
        }, 3000);
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setCurrentCategory({
      category_id: '',
      category_name: ''
    });
    setIsEditing(false);
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory({
      ...currentCategory,
      [name]: value
    });
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="category-management">
      <h2>Category Management</h2>
      
      {/* Success/Error Messages */}
      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      {/* Category Form */}
      <div className="category-form">
        <h3>{isEditing ? 'Edit Category' : 'Add New Category'}</h3>
        <form onSubmit={saveCategory}>
          <div className="form-group">
            <label htmlFor="category_name">Category Name:</label>
            <input
              type="text"
              id="category_name"
              name="category_name"
              value={currentCategory.category_name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isEditing ? 'Update' : 'Create')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} disabled={loading}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Categories List */}
      <div className="categories-list">
        <h3>Existing Categories</h3>
        {loading && !categories.length ? (
          <p>Loading categories...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.category_id}>
                  <td>{category.category_id}</td>
                  <td>{category.category_name}</td>
                  <td className="actions">
                    <button 
                      onClick={() => fetchCategoryById(category.category_id)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCategory(category.category_id)}
                      disabled={loading}
                      className="delete"
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
    </div>
  );
};

export default Category;