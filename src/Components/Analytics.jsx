import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  // State management
  const [analyticsData, setAnalyticsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [newRecord, setNewRecord] = useState({
    metric_name: '',
    metric_value: '',
    user_id: '',
    product_id: '',
    session_id: '',
    source: ''
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chartData, setChartData] = useState([]);

  // Responsive design setup
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Data fetching
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await fetch('https://alvins.pythonanywhere.com/analytics');
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch analytics data');
        setAnalyticsData(data);
        setFilteredData(data);
        prepareChartData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  // Prepare chart data
  const prepareChartData = (data) => {
    const metricsSummary = data.reduce((acc, record) => {
      if (!acc[record.metric_name]) {
        acc[record.metric_name] = 0;
      }
      acc[record.metric_name] += parseFloat(record.metric_value);
      return acc;
    }, {});

    const chartData = Object.keys(metricsSummary).map(metric => ({
      name: metric,
      value: metricsSummary[metric]
    }));

    setChartData(chartData);
  };

  // Search functionality
  useEffect(() => {
    if (searchTerm) {
      const filtered = analyticsData.filter(record => 
        record.analytics_id.toString().includes(searchTerm) ||
        record.metric_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.user_id && record.user_id.toString().includes(searchTerm)) ||
        (record.source && record.source.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(analyticsData);
    }
  }, [searchTerm, analyticsData]);

  // Form handler
  const handleNewRecordChange = (e) => {
    const { name, value } = e.target;
    setNewRecord(prev => ({ ...prev, [name]: value }));
  };

  // Create operation
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRecord.metric_name || !newRecord.metric_value) {
      setError('Metric name and value are required');
      return;
    }

    try {
      const response = await fetch('https://alvins.pythonanywhere.com/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Creation failed');

      setAnalyticsData(prev => [...prev, {
        analytics_id: data.id || prev.length + 1,
        ...newRecord
      }]);
      setNewRecord({
        metric_name: '',
        metric_value: '',
        user_id: '',
        product_id: '',
        session_id: '',
        source: ''
      });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete operation
  const handleDelete = async (analyticsId) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const response = await fetch(`https://alvins.pythonanywhere.com/analytics/${analyticsId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Deletion failed');

      setAnalyticsData(prev => prev.filter(record => record.analytics_id !== analyticsId));
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading analytics data...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>Analytics Dashboard</h2>
        <div className="search-create-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by ID, Metric or Source"
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
            {showCreateForm ? 'Cancel' : 'Add New Record'}
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Data Visualization */}
      <div className="analytics-chart">
        <h3>Metrics Summary</h3>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" name="Total Value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Create New Record Form */}
      {showCreateForm && (
        <div className="create-record-form">
          <h3>Create New Analytics Record</h3>
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Metric Name:</label>
                <input
                  type="text"
                  name="metric_name"
                  value={newRecord.metric_name}
                  onChange={handleNewRecordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Metric Value:</label>
                <input
                  type="number"
                  name="metric_value"
                  value={newRecord.metric_value}
                  onChange={handleNewRecordChange}
                  required
                  step="0.01"
                />
              </div>
              <div className="form-group">
                <label>User ID (optional):</label>
                <input
                  type="number"
                  name="user_id"
                  value={newRecord.user_id}
                  onChange={handleNewRecordChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Product ID (optional):</label>
                <input
                  type="number"
                  name="product_id"
                  value={newRecord.product_id}
                  onChange={handleNewRecordChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Session ID (optional):</label>
                <input
                  type="text"
                  name="session_id"
                  value={newRecord.session_id}
                  onChange={handleNewRecordChange}
                />
              </div>
              <div className="form-group">
                <label>Source (optional):</label>
                <input
                  type="text"
                  name="source"
                  value={newRecord.source}
                  onChange={handleNewRecordChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Create</button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="data-section">
        <h3>Analytics Records ({filteredData.length})</h3>
        {isMobile ? (
          <div className="mobile-records-list">
            {filteredData.length > 0 ? (
              filteredData.map(record => (
                <div key={record.analytics_id} className="mobile-record-card">
                  <div className="card-header">
                    <span className="record-id">ID: {record.analytics_id}</span>
                    <span className="metric-name">{record.metric_name}</span>
                  </div>
                  <div className="card-body">
                    <div className="record-detail">
                      <span>Value:</span>
                      <span>{record.metric_value}</span>
                    </div>
                    {record.user_id && (
                      <div className="record-detail">
                        <span>User ID:</span>
                        <span>{record.user_id}</span>
                      </div>
                    )}
                    {record.source && (
                      <div className="record-detail">
                        <span>Source:</span>
                        <span>{record.source}</span>
                      </div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(record.analytics_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No matching records found</div>
            )}
          </div>
        ) : (
          <div className="records-table-container">
            <table className="records-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Metric Name</th>
                  <th>Value</th>
                  <th>User ID</th>
                  <th>Product ID</th>
                  <th>Session ID</th>
                  <th>Source</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map(record => (
                    <tr key={record.analytics_id}>
                      <td>{record.analytics_id}</td>
                      <td>{record.metric_name}</td>
                      <td>{record.metric_value}</td>
                      <td>{record.user_id || '-'}</td>
                      <td>{record.product_id || '-'}</td>
                      <td>{record.session_id || '-'}</td>
                      <td>{record.source || '-'}</td>
                      <td className="actions-cell">
                        <button 
                          className="delete-btn"
                          onClick={() => handleDelete(record.analytics_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-results">No matching records found</td>
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

export default Analytics;