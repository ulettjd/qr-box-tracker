

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ROOMS = [
  'Living Room',
  'Kitchen',
  'Bedroom 1',
  'Bedroom 2',
  'Bedroom 3',
  'Bathroom',
  'Office',
  'Garage',
  'Basement',
  'Attic',
  'Dining Room',
  'Laundry Room',
  'Other'
];

const BoxForm = ({ boxes, updateBox }) => {
const { company, moveId, boxId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    room: '',
    fragile: false,
    description: '',
    contents: '',
    image: null,
    packed: false,
    dateCreated: new Date().toISOString()
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    // Load existing box data if it exists
    if (boxes[boxId]) {
      setFormData(boxes[boxId]);
      if (boxes[boxId].image) {
        setImagePreview(boxes[boxId].image);
      }
    }
  }, [boxId, boxes]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        setImagePreview(imageData);
        setFormData(prev => ({
          ...prev,
          image: imageData
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
  setImagePreview(null);
  setFormData(prev => ({
    ...prev,
    image: null
  }));
  // Clear the file input
  const fileInput = document.getElementById('image');
  if (fileInput) {
    fileInput.value = '';
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
const boxData = {
  ...formData,
  boxId: `${company}-${moveId}-${boxId}`,
  company,
  moveId,
  originalBoxId: boxId,
  lastUpdated: new Date().toISOString()
};
    updateBox(boxId, boxData);
    
    // Show success message and redirect
    alert('Box information saved successfully!');
    navigate('/dashboard');
  };

  const goBack = () => {
    navigate('/');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="box-form">
      <div className="header">
        <button onClick={goBack} className="back-button">
          ← Back to Scanner
        </button>
        <h1>Box #{boxId}</h1>
        <button onClick={goToDashboard} className="dashboard-button">
          📊 Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="room">Destination Room *</label>
          <select
            id="room"
            name="room"
            value={formData.room}
            onChange={handleInputChange}
            required
            className="select-input"
          >
            <option value="">Select a room</option>
            {ROOMS.map(room => (
              <option key={room} value={room}>{room}</option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="fragile"
              checked={formData.fragile}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">
              {formData.fragile ? '🔴 FRAGILE' : '📦 Not Fragile'}
            </span>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="description">Box Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., Kitchen dishes, Office supplies"
            className="text-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="contents">Contents List</label>
          <textarea
            id="contents"
            name="contents"
            value={formData.contents}
            onChange={handleInputChange}
            placeholder="List the items in this box..."
            rows="4"
            className="textarea-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Box Photo (Optional)</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
      {imagePreview && (
          <div className="image-preview">
          <img src={imagePreview} alt="Box preview" />
          <button 
            type="button" 
            onClick={removeImage} 
            className="remove-image-button"
     >
      🗑️ Remove Photo
    </button>
  </div>
)}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="packed"
              checked={formData.packed}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">
              {formData.packed ? '✅ Packed' : '📦 Not Packed Yet'}
            </span>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            💾 Save Box Information
          </button>
        </div>
      </form>
    </div>
  );
};

export default BoxForm;
