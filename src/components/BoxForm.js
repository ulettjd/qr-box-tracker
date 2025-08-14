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
  itemType: 'BOX',
  condition: '',
  assemblyRequired: false,
  protectionType: '',
  image: null,
  packed: false,
  status: 'PACKED',
  dateCreated: new Date().toISOString()
});

  const [imagePreview, setImagePreview] = useState(null);
  const [existingBoxKey, setExistingBoxKey] = useState(null);

  useEffect(() => {
    // Find existing box by looking for matching originalBoxId, company, and moveId
    const foundBoxKey = Object.keys(boxes).find(key => {
      const box = boxes[key];
      return (
        box.originalBoxId === boxId && 
        box.company === company && 
        box.moveId === moveId
      ) || key === `${company}-${moveId}-${boxId}`;
    });

    if (foundBoxKey && boxes[foundBoxKey]) {
      // Load existing box data
      const existingBox = boxes[foundBoxKey];
      setFormData(existingBox);
      setExistingBoxKey(foundBoxKey);
      
      if (existingBox.image) {
        setImagePreview(existingBox.image);
      }
    } else {
      // Create new box with proper structure
      const newBoxKey = `${company}-${moveId}-${boxId}`;
      setExistingBoxKey(newBoxKey);
      setFormData(prev => ({
        ...prev,
        boxId: newBoxKey,
        company,
        moveId,
        originalBoxId: boxId,
      }));
    }
  }, [boxId, boxes, company, moveId]);

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
    
    // Ensure we have the proper structure
    const boxData = {
      ...formData,
      boxId: existingBoxKey,
      company,
      moveId,
      originalBoxId: boxId,
      lastUpdated: new Date().toISOString(),
      lastUpdatedBy: 'CUSTOMER'
    };

    // Update using the existing key (or new key if it's a new box)
    updateBox(existingBoxKey, boxData);
    
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
            
        <div className="form-group">
          <label htmlFor="itemType">Item Type *</label>
          <select
            id="itemType"
            name="itemType"
            value={formData.itemType || 'BOX'}
            onChange={handleInputChange}
            required
            className="select-input"
          >
            <option value="BOX">📦 Box</option>
            <option value="FURNITURE">🪑 Furniture</option>
            <option value="APPLIANCE">🔌 Appliance</option>
          </select>
        </div>
              
        <div className="form-group">
          <label>Fragile Status *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="fragile"
                value="false"
                checked={formData.fragile === false}
                onChange={(e) => setFormData(prev => ({ ...prev, fragile: false }))}
              />
              <span className="radio-text">📦 Not Fragile</span>
            </label>
            
            <label className="radio-label">
              <input
                type="radio"
                name="fragile"
                value="true"
                checked={formData.fragile === true}
                onChange={(e) => setFormData(prev => ({ ...prev, fragile: true }))}
              />
              <span className="radio-text">🔴 FRAGILE</span>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">
            {formData.itemType === 'BOX' ? 'Box Description' : 
            formData.itemType === 'FURNITURE' ? 'Furniture Description' :
            'Item Description'}
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={
              formData.itemType === 'BOX' ? "e.g., Kitchen dishes, Office supplies" :
              formData.itemType === 'FURNITURE' ? "e.g., Dining table, Office chair" :
              "e.g., Microwave, Refrigerator"
              }
            className="text-input"
          />
        </div>

        {formData.itemType === 'BOX' && (
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
        )}

        {(formData.itemType === 'FURNITURE' || formData.itemType === 'APPLIANCE') && (
          <>
            <div className="form-group">
              <label htmlFor="condition">Condition *</label>
              <select
                id="condition"
                name="condition"
                value={formData.condition || ''}
                onChange={handleInputChange}
                required
                className="select-input"
              >
                <option value="">Select condition</option>
                <option value="EXCELLENT">Excellent</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="DAMAGED">Damaged</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assembly Required</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="assemblyRequired"
                    value="false"
                    checked={formData.assemblyRequired === false}
                    onChange={(e) => setFormData(prev => ({ ...prev, assemblyRequired: false }))}
                  />
                  <span className="radio-text">No Assembly</span>
                </label>
                
                <label className="radio-label">
                  <input
                    type="radio"
                    name="assemblyRequired"
                    value="true"
                    checked={formData.assemblyRequired === true}
                    onChange={(e) => setFormData(prev => ({ ...prev, assemblyRequired: true }))}
                  />
                  <span className="radio-text">🔧 Assembly Required</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="protectionType">Protection/Wrapping</label>
              <select
                id="protectionType"
                name="protectionType"
                value={formData.protectionType || ''}
                onChange={handleInputChange}
                className="select-input"
              >
                <option value="">No special protection</option>
                <option value="BLANKETS">Moving blankets</option>
                <option value="BUBBLE_WRAP">Bubble wrap</option>
                <option value="SHRINK_WRAP">Shrink wrap</option>
                <option value="CARDBOARD">Cardboard protection</option>
              </select>
            </div>
          </>
        )}

          <div className="form-group">
            <label htmlFor="image">Box Photo (Coming Soon)</label>
              <input
              type="file"
               id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input disabled"
              disabled
          />
          <p className="coming-soon-text">Photo upload will be available in a future update</p>

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

        <div className="form-group">
          <label>Packing Status *</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="packed"
                value="false"
                checked={formData.packed === false}
                onChange={(e) => setFormData(prev => ({ ...prev, packed: false }))}
              />
              <span className="radio-text">📦 Not Packed Yet</span>
            </label>
            
            <label className="radio-label">
              <input
                type="radio"
                name="packed"
                value="true"
                checked={formData.packed === true}
                onChange={(e) => setFormData(prev => ({ ...prev, packed: true }))}
              />
              <span className="radio-text">✅ Packed</span>
            </label>
          </div>
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
