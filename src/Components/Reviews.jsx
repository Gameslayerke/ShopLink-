import React, { useState, useEffect } from 'react';
import './Reviews.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('all'); // 'all', 'single', 'edit'
  const [reviewId, setReviewId] = useState('');
  const [singleReview, setSingleReview] = useState(null);
  const [editReview, setEditReview] = useState({
    rating: '',
    review_text: ''
  });

  // Fetch all reviews
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://alvins.pythonanywhere.com/reviews');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setReviews(data);
      setCurrentView('all');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single review by ID
  const fetchSingleReview = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`https://alvins.pythonanywhere.com/reviews/${id}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setSingleReview(data);
      setCurrentView('single');
      setError(null);
    } catch (err) {
      setError(err.message);
      setSingleReview(null);
    } finally {
      setLoading(false);
    }
  };

  // Update review
  const updateReview = async (id, reviewData) => {
    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });
      if (!response.ok) throw new Error('Failed to update review');
      const data = await response.json();
      fetchAllReviews();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Delete review
  const deleteReview = async (id) => {
    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/reviews/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete review');
      
      if (currentView === 'all') {
        fetchAllReviews();
      } else if (currentView === 'single') {
        setCurrentView('all');
      }
      
      alert('Review deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle form submissions
  const handleSingleSubmit = (e) => {
    e.preventDefault();
    if (reviewId) {
      fetchSingleReview(reviewId);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateReview(singleReview.review_id, editReview);
      alert('Review updated successfully!');
      setCurrentView('single');
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fetch all reviews on component mount
  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Filter reviews based on search term
  const filteredReviews = reviews.filter(review => {
    const searchLower = searchTerm.toLowerCase();
    return (
      review.user_id.toString().includes(searchTerm) ||
      review.product_id.toString().includes(searchTerm) ||
      review.review_text?.toLowerCase().includes(searchLower) ||
      review.rating.toString().includes(searchTerm)
    );
  });

  // Render star rating
  const renderStars = (rating) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={star <= rating ? 'star filled' : 'star'}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="reviews-container">
      <h1>Reviews Management</h1>
      
      {/* Navigation and search */}
      <div className="reviews-controls">
        <button onClick={fetchAllReviews} className="btn-view-all">
          View All Reviews
        </button>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {/* Filter form */}
      <div className="filter-forms">
        <form onSubmit={handleSingleSubmit} className="filter-form">
          <input
            type="number"
            placeholder="Review ID"
            value={reviewId}
            onChange={(e) => setReviewId(e.target.value)}
            className="filter-input"
          />
          <button type="submit" className="btn-filter">
            Get Review
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
          {currentView === 'single' && singleReview ? (
            <div className="single-review-view">
              <h2>Review Details</h2>
              <div className="review-details">
                <p><strong>Review ID:</strong> {singleReview.review_id}</p>
                <p><strong>User ID:</strong> {singleReview.user_id}</p>
                <p><strong>Product ID:</strong> {singleReview.product_id}</p>
                <p><strong>Rating:</strong> {renderStars(singleReview.rating)} ({singleReview.rating}/5)</p>
                <p><strong>Review Text:</strong> {singleReview.review_text}</p>
                <p><strong>Created At:</strong> {new Date(singleReview.created_at).toLocaleString()}</p>
              </div>
              <div className="review-actions">
                <button 
                  onClick={() => {
                    setEditReview({
                      rating: singleReview.rating,
                      review_text: singleReview.review_text
                    });
                    setCurrentView('edit');
                  }}
                  className="btn-edit"
                >
                  Edit Review
                </button>
                <button 
                  onClick={() => deleteReview(singleReview.review_id)}
                  className="btn-delete"
                >
                  Delete Review
                </button>
                <button 
                  onClick={() => setCurrentView('all')}
                  className="btn-back"
                >
                  Back to All
                </button>
              </div>
            </div>
          ) : currentView === 'edit' ? (
            <div className="edit-review-view">
              <h2>Edit Review</h2>
              <form onSubmit={handleEditSubmit}>
                <div className="form-group">
                  <label>Rating (1-5):</label>
                  <select
                    name="rating"
                    value={editReview.rating}
                    onChange={handleEditChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select rating</option>
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Review Text:</label>
                  <textarea
                    name="review_text"
                    value={editReview.review_text}
                    onChange={handleEditChange}
                    className="form-input"
                    rows="5"
                    required
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    Save Changes
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCurrentView('single')}
                    className="btn-cancel"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <h2>All Reviews</h2>
              {filteredReviews.length > 0 ? (
                <table className="reviews-table">
                  <thead>
                    <tr>
                      <th>Review ID</th>
                      <th>User ID</th>
                      <th>Product ID</th>
                      <th>Rating</th>
                      <th>Review Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.review_id}>
                        <td>{review.review_id}</td>
                        <td>{review.user_id}</td>
                        <td>{review.product_id}</td>
                        <td>{renderStars(review.rating)}</td>
                        <td className="review-preview">
                          {review.review_text?.length > 50 
                            ? `${review.review_text.substring(0, 50)}...` 
                            : review.review_text}
                        </td>
                        <td>
                          <button 
                            onClick={() => fetchSingleReview(review.review_id)}
                            className="btn-view"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => deleteReview(review.review_id)}
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
                <p>No reviews found.</p>
              )}
            </>
          )}
        </>
      )}
      
      {/* Statistics */}
      {!loading && currentView === 'all' && reviews.length > 0 && (
        <div className="reviews-stats">
          <h3>Statistics</h3>
          <p>Total Reviews: {reviews.length}</p>
          <p>Average Rating: {
            (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
          ).toFixed(2)}</p>
          <div className="rating-distribution">
            <h4>Rating Distribution:</h4>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} className="distribution-row">
                <span>{rating} stars:</span>
                <div className="distribution-bar-container">
                  <div 
                    className="distribution-bar"
                    style={{
                      width: `${(reviews.filter(r => r.rating === rating).length / reviews.length) * 100}%`
                    }}
                  />
                </div>
                <span>
                    {reviews.filter(r => r.rating === rating).length} (
                    {Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100)}%
                    )
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;