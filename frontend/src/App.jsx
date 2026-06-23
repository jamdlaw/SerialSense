import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'approved'
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fetchRecords = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/inspections');
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      try {
        const response = await fetch('http://localhost:5001/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRecords(prev => [data.record, ...prev]);
        } else {
          alert('Upload failed. Check server logs.');
        }
      } catch (error) {
        console.error('Upload Error:', error);
        alert('Network or server error');
      } finally {
        setIsUploading(false);
        event.target.value = null;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateRecord = async (newStatus) => {
    const snInput = document.getElementById(`sn-${selectedRecord._id}`);
    const stInput = document.getElementById(`st-${selectedRecord._id}`);
    
    const updatedStatus = newStatus || stInput.value;
    const updatedSn = snInput.value;

    try {
      const response = await fetch(`http://localhost:5001/api/inspections/${selectedRecord._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: updatedSn, status: updatedStatus })
      });

      if (response.ok) {
        const updatedRecord = await response.json();
        setRecords(prev => prev.map(r => r._id === updatedRecord._id ? updatedRecord : r));
        setSelectedRecord(updatedRecord);
        if (updatedStatus !== 'pending_review') setActiveTab('approved');
        else setActiveTab('pending');
      }
    } catch (error) {
      console.error('Update Error:', error);
    }
  };

  const pendingRecords = records.filter(r => r.status === 'pending_review');
  const approvedRecords = records.filter(r => r.status !== 'pending_review');
  const displayRecords = activeTab === 'pending' ? pendingRecords : approvedRecords;

  return (
    <div className="app-container">
      <header className="header" style={{ justifyContent: 'space-between' }}>
        <h1>SerialSense</h1>
        <div>
          <input 
            type="file" 
            accept="image/*" 
            id="admin-upload" 
            style={{ display: 'none' }} 
            onChange={handleUpload} 
            disabled={isUploading}
          />
          <label htmlFor="admin-upload" className="btn btn-primary" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'inline-block' }}>
            {isUploading ? 'Analyzing...' : 'Upload Photo'}
          </label>
        </div>
      </header>

      <main className="main-content">
        {/* Left Column: List */}
        <section className="glass-panel table-container">
          <div className="table-header" style={{ display: 'flex', gap: '16px' }}>
            <button 
              className={`btn ${activeTab === 'pending' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Review ({pendingRecords.length})
            </button>
            <button 
              className={`btn ${activeTab === 'approved' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              Approved ({approvedRecords.length})
            </button>
          </div>
          
          <div style={{ overflowY: 'auto' }}>
            {displayRecords.map(record => (
              <div 
                key={record._id} 
                className={`table-row ${selectedRecord?._id === record._id ? 'active' : ''}`}
                onClick={() => setSelectedRecord(record)}
              >
                <div>
                  <div className="row-label">Status</div>
                  <span className={`badge ${record.status}`}>{record.status.replace('_', ' ')}</span>
                </div>
                <div>
                  <div className="row-label">Serial Number</div>
                  <div className="row-value">{record.serialNumber || 'Unreadable'}</div>
                </div>
                <div>
                  <div className="row-label">Confidence</div>
                  <div className="row-value">{(record.confidenceScore * 100).toFixed(1)}%</div>
                </div>
                <div>
                  <div className="row-label">Date</div>
                  <div className="row-value" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(record.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {displayRecords.length === 0 && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No records found.
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Viewer & Override Form */}
        <section className="glass-panel viewer-container">
          {selectedRecord ? (
            <>
              <div className="image-display">
                {selectedRecord.imageUrl.startsWith('data:') ? (
                   <img src={selectedRecord.imageUrl} alt="Inspection" />
                ) : (
                   <img src={selectedRecord.imageUrl} alt="Inspection" onError={(e) => { e.target.src = 'https://via.placeholder.com/800x600?text=Image+Unavailable'; }} />
                )}
              </div>
              <div className="override-form">
                <h3 style={{ marginBottom: '16px' }}>Review Data</h3>
                <div className="form-group">
                  <label>Serial Number</label>
                  <input 
                    type="text" 
                    id={`sn-${selectedRecord._id}`}
                    className="form-control" 
                    defaultValue={selectedRecord.serialNumber || ''} 
                    key={`sn-${selectedRecord._id}`}
                    placeholder="Enter serial number..."
                  />
                </div>
                <div className="form-group">
                  <label>Inspection Status</label>
                  <select 
                    id={`st-${selectedRecord._id}`}
                    className="form-control select-control" 
                    defaultValue={selectedRecord.status === 'pending_review' ? 'pass' : selectedRecord.status}
                    key={`st-${selectedRecord._id}`}
                  >
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                    <option value="pending_review">Pending Review</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" onClick={() => handleUpdateRecord()}>Save & Approve</button>
                  {selectedRecord.status !== 'pending_review' && (
                     <button className="btn" onClick={() => handleUpdateRecord('pending_review')}>Re-flag for Review</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              Select an inspection record to view details.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
