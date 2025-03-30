import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiImage, FiUpload, FiTrash2, FiToggleLeft, FiToggleRight,
  FiPlus, FiX, FiAlertCircle 
} from 'react-icons/fi';
import './Carousel.css';

const Carousel = () => {
  // State management
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch all carousels
  const fetchCarousels = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://alvins.pythonanywhere.com/carousels');
      setCarousels(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch carousel images');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Upload new carousel image
  const uploadCarousel = async () => {
    if (!file) {
      setError('Please select an image file');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadProgress(0);
      const response = await axios.post('https://alvins.pythonanywhere.com/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.message === "Image uploaded successfully") {
        setShowUploadModal(false);
        setFile(null);
        setPreviewImage(null);
        fetchCarousels();
      }
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    } finally {
      setUploadProgress(0);
    }
  };

  // Toggle carousel status
  const toggleCarouselStatus = async (imageId) => {
    try {
      await axios.put(`https://alvins.pythonanywhere.com/carousel/toggle/${imageId}`);
      fetchCarousels();
    } catch (err) {
      setError('Failed to toggle carousel status');
      console.error(err);
    }
  };

  // Delete carousel
  const deleteCarousel = async (imageId) => {
    if (window.confirm('Are you sure you want to delete this carousel image?')) {
      try {
        await axios.delete(`https://alvins.pythonanywhere.com/delete/${imageId}`);
        fetchCarousels();
      } catch (err) {
        setError('Failed to delete carousel');
        console.error(err);
      }
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Revoke previous object URL to avoid memory leaks
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Initialize
  useEffect(() => {
    fetchCarousels();
  }, []);

  // Group carousels by status
  const activeCarousels = carousels.filter(c => c.is_active === 1);
  const inactiveCarousels = carousels.filter(c => c.is_active === 0);

  return (
    <div className="carousel-container">
      {/* Header */}
      <header className="carousel-header">
        <h1><FiImage /> Carousel Management</h1>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="upload-btn"
        >
          <FiPlus /> Add Image
        </button>
      </header>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <FiAlertCircle /> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          Loading carousel images...
        </div>
      )}

      {/* Active Carousels */}
      <section className="carousel-section">
        <h2>Active Carousel Images</h2>
        {activeCarousels.length > 0 ? (
          <div className="carousel-grid">
            {activeCarousels.map(carousel => (
              <div key={carousel.id} className="carousel-card">
                <img 
                  src={carousel.image_url} 
                  alt={`Carousel ${carousel.id}`}
                  className="carousel-image"
                />
                <div className="carousel-actions">
                  <button
                    onClick={() => toggleCarouselStatus(carousel.id)}
                    className="toggle-btn active"
                  >
                    <FiToggleRight /> Active
                  </button>
                  <button
                    onClick={() => deleteCarousel(carousel.id)}
                    className="delete-btn"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-carousels">No active carousel images</p>
        )}
      </section>

      {/* Inactive Carousels */}
      <section className="carousel-section">
        <h2>Inactive Carousel Images</h2>
        {inactiveCarousels.length > 0 ? (
          <div className="carousel-grid">
            {inactiveCarousels.map(carousel => (
              <div key={carousel.id} className="carousel-card">
                <img 
                  src={carousel.image_url} 
                  alt={`Carousel ${carousel.id}`}
                  className="carousel-image"
                />
                <div className="carousel-actions">
                  <button
                    onClick={() => toggleCarouselStatus(carousel.id)}
                    className="toggle-btn inactive"
                  >
                    <FiToggleLeft /> Inactive
                  </button>
                  <button
                    onClick={() => deleteCarousel(carousel.id)}
                    className="delete-btn"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-carousels">No inactive carousel images</p>
        )}
      </section>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="upload-modal">
            <div className="modal-header">
              <h3>Upload New Carousel Image</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setFile(null);
                  if (previewImage) {
                    URL.revokeObjectURL(previewImage);
                    setPreviewImage(null);
                  }
                }}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>

            <div className="upload-content">
              {previewImage ? (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                </div>
              ) : (
                <div className="upload-area">
                  <FiUpload className="upload-icon" />
                  <p>Select an image to upload</p>
                  <input
                    type="file"
                    id="carousel-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="carousel-upload" className="file-label">
                    Choose File
                  </label>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setFile(null);
                    if (previewImage) {
                      URL.revokeObjectURL(previewImage);
                      setPreviewImage(null);
                    }
                  }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadCarousel}
                  disabled={!file || uploadProgress > 0}
                  className="upload-submit-btn"
                >
                  <FiUpload /> Upload Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Carousel;