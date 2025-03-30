import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FiSearch, FiFilter, FiUser, FiMail, FiCheck, FiTrash2, 
  FiSend, FiArrowLeft, FiMessageSquare, FiInbox 
} from 'react-icons/fi';
import './MessagingCenter.css';

const MessagingCenter = () => {
  const API_BASE_URL = 'https://alvins.pythonanywhere.com';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState({
    user_id: '',
    message: ''
  });
  const [viewMode, setViewMode] = useState('all');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Check for mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/notifications`;
      
      if (viewMode === 'user' && userIdFilter) {
        url = `${API_BASE_URL}/notifications/user/${userIdFilter}`;
      }
      
      const response = await axios.get(url);
      let filteredMessages = response.data;
      
      if (viewMode === 'unread') {
        filteredMessages = filteredMessages.filter(m => !m.is_read);
      }

      if (searchTerm) {
        filteredMessages = filteredMessages.filter(m => 
          m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.user_id.toString().includes(searchTerm)
        );
      }
      
      setMessages(filteredMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch messages');
      setLoading(false);
    }
  }, [viewMode, userIdFilter, searchTerm]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/notifications`, newMessage);
      setNewMessage({ user_id: '', message: '' });
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${messageId}/read`);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to mark as read');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_BASE_URL}/notifications/${messageId}`);
      setSelectedMessage(null);
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete message');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' · ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  if (loading) return (
    <div className="messaging-center loading">
      <div className="spinner"></div>
      Loading messages...
    </div>
  );
  
  if (error) return (
    <div className="messaging-center error">
      <FiInbox size={24} />
      <p>Error: {error}</p>
    </div>
  );

  return (
    <div className={`messaging-center ${isMobileView ? 'mobile' : ''}`}>
      {(!isMobileView || showSidebar) && (
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>
              <FiMail className="icon" />
              Admin Messaging
            </h2>
            {isMobileView && (
              <button className="close-sidebar" onClick={toggleSidebar}>
                <FiArrowLeft />
              </button>
            )}
            <div className="search-bar">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="filter-controls">
            <button 
              className={`filter-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              <FiInbox className="icon" />
              All Messages
            </button>
            <button 
              className={`filter-btn ${viewMode === 'unread' ? 'active' : ''}`}
              onClick={() => setViewMode('unread')}
            >
              <FiMail className="icon" />
              Unread Only
            </button>
            <div className="user-filter">
              <FiUser className="icon" />
              <input
                type="number"
                placeholder="User ID"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
              />
              <button 
                className={`filter-btn ${viewMode === 'user' ? 'active' : ''}`}
                onClick={() => setViewMode('user')}
                disabled={!userIdFilter}
              >
                <FiFilter className="icon" />
                Filter
              </button>
            </div>
          </div>

          <div className="message-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                <FiInbox size={32} />
                <p>No messages found</p>
              </div>
            ) : (
              messages.map(message => (
                <div 
                  key={message.notification_id} 
                  className={`message-preview ${message.is_read ? '' : 'unread'} ${selectedMessage?.notification_id === message.notification_id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    if (isMobileView) setShowSidebar(false);
                  }}
                >
                  <div className="message-header">
                    <span className="user-id">
                      <FiUser className="icon" />
                      User #{message.user_id}
                    </span>
                    <span className="timestamp">{formatDate(message.created_at)}</span>
                    {!message.is_read && <span className="unread-badge">New</span>}
                  </div>
                  <div className="message-content">
                    <FiMessageSquare className="icon" />
                    {message.message.length > 50 
                      ? `${message.message.substring(0, 50)}...` 
                      : message.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={`main-content ${!showSidebar && isMobileView ? 'expanded' : ''}`}>
        {isMobileView && !showSidebar && (
          <button className="back-to-list" onClick={toggleSidebar}>
            <FiArrowLeft className="icon" />
            Back to Messages
          </button>
        )}

        {selectedMessage ? (
          <div className="message-detail">
            <div className="message-detail-header">
              <h3>
                <FiUser className="icon" />
                Message to User #{selectedMessage.user_id}
              </h3>
              <div className="message-actions">
                {!selectedMessage.is_read && (
                  <button 
                    className="action-btn mark-read"
                    onClick={() => handleMarkAsRead(selectedMessage.notification_id)}
                  >
                    <FiCheck className="icon" />
                    Mark as Read
                  </button>
                )}
                <button 
                  className="action-btn delete"
                  onClick={() => handleDeleteMessage(selectedMessage.notification_id)}
                >
                  <FiTrash2 className="icon" />
                  Delete
                </button>
              </div>
            </div>
            <div className="message-meta">
              <span>
                <FiMail className="icon" />
                Sent: {formatDate(selectedMessage.created_at)}
              </span>
              <span className={`status ${selectedMessage.is_read ? 'read' : 'unread'}`}>
                {selectedMessage.is_read ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="message-text">
              {selectedMessage.message}
            </div>
          </div>
        ) : (
          <div className="no-message-selected">
            <div className="empty-icon">
              <FiMail size={48} />
            </div>
            <h3>Select a message to view</h3>
            <p>Or send a new message below</p>
          </div>
        )}

        <div className="new-message-form">
          <h3>
            <FiSend className="icon" />
            Send New Message
          </h3>
          <form onSubmit={handleSendMessage}>
            <div className="form-group">
              <label>
                <FiUser className="icon" />
                User ID:
              </label>
              <input
                type="number"
                name="user_id"
                value={newMessage.user_id}
                onChange={(e) => setNewMessage({...newMessage, user_id: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>
                <FiMessageSquare className="icon" />
                Message:
              </label>
              <textarea
                name="message"
                value={newMessage.message}
                onChange={(e) => setNewMessage({...newMessage, message: e.target.value})}
                required
                placeholder="Type your message here..."
              />
            </div>
            <button type="submit" className="send-btn">
              <FiSend className="icon" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MessagingCenter;