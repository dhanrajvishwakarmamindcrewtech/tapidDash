import React, { useRef, useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Edit3, 
  FileText, 
  ExternalLink, 
  Calendar, 
  Utensils,
  Clock,
  MapPin,
  Phone,
  Globe,
  Download,
  Eye,
  Plus,
  Trash2
} from 'lucide-react';
import styles from '../SettingsPage.module.css';

export default function Resources({
  settings,
  onSettingsChange,
  menuUploadRef,
  reservationLinksRef,
  socialMediaRef,
  operationalInfoRef,
  currentUser
}) {
  const menuInputRef = useRef(null);
  
  // Local form state that updates immediately
  const [formData, setFormData] = useState({
    menuPdf: settings.menuPdf || null,
    openTableUrl: settings.openTableUrl || '',
    resyUrl: settings.resyUrl || '',
    uberEatsUrl: settings.uberEatsUrl || '',
    doorDashUrl: settings.doorDashUrl || '',
    phoneOrderNumber: settings.phoneOrderNumber || '',
    onlineOrderingUrl: settings.onlineOrderingUrl || '',
    socialMedia: settings.socialMedia || [],
    parkingInfo: settings.parkingInfo || '',
    specialHours: settings.specialHours || '',
    dressCode: settings.dressCode || '',
    cuisineType: settings.cuisineType || '',
    priceRange: settings.priceRange || '',
    specialFeatures: settings.specialFeatures || []
  });

  // Sync with settings when they change from parent
  useEffect(() => {
    setFormData({
      menuPdf: settings.menuPdf || null,
      openTableUrl: settings.openTableUrl || '',
      resyUrl: settings.resyUrl || '',
      uberEatsUrl: settings.uberEatsUrl || '',
      doorDashUrl: settings.doorDashUrl || '',
      phoneOrderNumber: settings.phoneOrderNumber || '',
      onlineOrderingUrl: settings.onlineOrderingUrl || '',
      socialMedia: settings.socialMedia || [],
      parkingInfo: settings.parkingInfo || '',
      specialHours: settings.specialHours || '',
      dressCode: settings.dressCode || '',
      cuisineType: settings.cuisineType || '',
      priceRange: settings.priceRange || '',
      specialFeatures: settings.specialFeatures || []
    });
  }, [settings]);

  // Helper function to update both local state and notify parent
  const updateSettings = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (onSettingsChange) {
      onSettingsChange(updates);
    }
  };

  const handleMenuUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      const menuData = {
        file: file,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file)
      };
      updateSettings({ menuPdf: menuData });
    }
  };

  const handleMenuDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const menuData = {
        file: file,
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file)
      };
      updateSettings({ menuPdf: menuData });
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const removeMenu = () => {
    updateSettings({ menuPdf: null });
  };

  const addSocialLink = () => {
    const newLink = { platform: '', url: '', display: true };
    const updatedLinks = [...formData.socialMedia, newLink];
    updateSettings({ socialMedia: updatedLinks });
  };

  const updateSocialLink = (index, field, value) => {
    const updatedLinks = formData.socialMedia.map((link, i) => 
      i === index ? { ...link, [field]: value } : link
    );
    updateSettings({ socialMedia: updatedLinks });
  };

  const removeSocialLink = (index) => {
    const updatedLinks = formData.socialMedia.filter((_, i) => i !== index);
    updateSettings({ socialMedia: updatedLinks });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const socialPlatforms = [
    'Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 
    'Yelp', 'Google My Business', 'Tripadvisor', 'Foursquare', 'Other'
  ];

  return (
    <div className={styles.sectionContent}>
      {/* Menu Upload Section */}
      <div className={styles.subsection} ref={menuUploadRef}>
        <h3 className={styles.subsectionTitle}>Menu & Documents</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Menu (PDF)</label>
          {formData.menuPdf ? (
            <div className={styles.uploadedDocument}>
              <div className={styles.documentPreview}>
                <FileText size={24} className={styles.documentIcon} />
                <div className={styles.documentInfo}>
                  <div className={styles.documentName}>{formData.menuPdf.name}</div>
                  <div className={styles.documentMeta}>
                    {formatFileSize(formData.menuPdf.size)} • 
                    Uploaded {new Date(formData.menuPdf.uploadDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={styles.documentActions}>
                <button
                  type="button"
                  onClick={() => window.open(formData.menuPdf.url, '_blank')}
                  className={styles.documentActionButton}
                  title="View PDF"
                >
                  <Eye size={16} />
                </button>
                <a
                  href={formData.menuPdf.url}
                  download={formData.menuPdf.name}
                  className={styles.documentActionButton}
                  title="Download PDF"
                >
                  <Download size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => menuInputRef.current.click()}
                  className={styles.documentActionButton}
                  title="Replace PDF"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  type="button"
                  onClick={removeMenu}
                  className={styles.documentActionButton}
                  title="Remove PDF"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div
              className={styles.uploadArea}
              onDrop={handleMenuDrop}
              onDragOver={handleDragOver}
              onClick={() => menuInputRef.current.click()}
            >
              <FileText size={24} />
              <span>Drop your menu PDF here or click to upload</span>
              <small>PDF up to 10MB</small>
            </div>
          )}
          <input
            type="file"
            accept=".pdf"
            hidden
            ref={menuInputRef}
            onChange={handleMenuUpload}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Additional Documents</label>
          <div className={styles.documentGrid}>
            <div className={styles.documentType}>
              <Utensils size={20} />
              <span>Wine List</span>
              <button className={styles.uploadDocButton}>Upload</button>
            </div>
            <div className={styles.documentType}>
              <Calendar size={20} />
              <span>Event Menu</span>
              <button className={styles.uploadDocButton}>Upload</button>
            </div>
            <div className={styles.documentType}>
              <FileText size={20} />
              <span>Catering Menu</span>
              <button className={styles.uploadDocButton}>Upload</button>
            </div>
          </div>
        </div>
      </div>

      {/* Reservation Links Section */}
      <div className={styles.subsection} ref={reservationLinksRef}>
        <h3 className={styles.subsectionTitle}>Reservation & Ordering</h3>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <ExternalLink size={16} />
              OpenTable URL
            </label>
            <input
              type="url"
              className={styles.input}
              value={formData.openTableUrl}
              onChange={e => updateSettings({ openTableUrl: e.target.value })}
              placeholder="https://www.opentable.com/your-restaurant"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <ExternalLink size={16} />
              Resy URL
            </label>
            <input
              type="url"
              className={styles.input}
              value={formData.resyUrl}
              onChange={e => updateSettings({ resyUrl: e.target.value })}
              placeholder="https://resy.com/cities/your-restaurant"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Utensils size={16} />
              Uber Eats URL
            </label>
            <input
              type="url"
              className={styles.input}
              value={formData.uberEatsUrl}
              onChange={e => updateSettings({ uberEatsUrl: e.target.value })}
              placeholder="https://www.ubereats.com/store/your-restaurant"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Utensils size={16} />
              DoorDash URL
            </label>
            <input
              type="url"
              className={styles.input}
              value={formData.doorDashUrl}
              onChange={e => updateSettings({ doorDashUrl: e.target.value })}
              placeholder="https://www.doordash.com/store/your-restaurant"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Phone size={16} />
              Phone Order Number
            </label>
            <input
              type="tel"
              className={styles.input}
              value={formData.phoneOrderNumber}
              onChange={e => updateSettings({ phoneOrderNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Globe size={16} />
              Online Ordering URL
            </label>
            <input
              type="url"
              className={styles.input}
              value={formData.onlineOrderingUrl}
              onChange={e => updateSettings({ onlineOrderingUrl: e.target.value })}
              placeholder="https://order.yourbusiness.com"
            />
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className={styles.subsection} ref={socialMediaRef}>
        <h3 className={styles.subsectionTitle}>Social Media & Reviews</h3>
        
        <div className={styles.socialLinksContainer}>
          {formData.socialMedia.map((link, index) => (
            <div key={index} className={styles.socialLinkItem}>
              <select
                className={styles.select}
                value={link.platform}
                onChange={e => updateSocialLink(index, 'platform', e.target.value)}
              >
                <option value="">Select Platform</option>
                {socialPlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
              
              <input
                type="url"
                className={styles.input}
                value={link.url}
                onChange={e => updateSocialLink(index, 'url', e.target.value)}
                placeholder="https://..."
              />
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={link.display}
                  onChange={e => updateSocialLink(index, 'display', e.target.checked)}
                />
                Display
              </label>
              
              <button
                type="button"
                onClick={() => removeSocialLink(index)}
                className={styles.iconButton}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addSocialLink}
            className={styles.addSocialButton}
          >
            <Plus size={16} />
            Add Social Link
          </button>
        </div>
      </div>

      {/* Operational Information Section */}
      <div className={styles.subsection} ref={operationalInfoRef}>
        <h3 className={styles.subsectionTitle}>Operational Information</h3>
        
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              <MapPin size={16} />
              Parking Information
            </label>
            <textarea
              className={styles.textarea}
              rows="3"
              value={formData.parkingInfo}
              onChange={e => updateSettings({ parkingInfo: e.target.value })}
              placeholder="Street parking available, valet service offered..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              <Clock size={16} />
              Special Hours Notes
            </label>
            <textarea
              className={styles.textarea}
              rows="3"
              value={formData.specialHours}
              onChange={e => updateSettings({ specialHours: e.target.value })}
              placeholder="Holiday hours, seasonal changes, special events..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Dress Code</label>
            <select
              className={styles.select}
              value={formData.dressCode}
              onChange={e => updateSettings({ dressCode: e.target.value })}
            >
              <option value="">Select Dress Code</option>
              <option value="Casual">Casual</option>
              <option value="Smart Casual">Smart Casual</option>
              <option value="Business Casual">Business Casual</option>
              <option value="Formal">Formal</option>
              <option value="Black Tie">Black Tie</option>
              <option value="No Dress Code">No Dress Code</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Cuisine Type</label>
            <input
              type="text"
              className={styles.input}
              value={formData.cuisineType}
              onChange={e => updateSettings({ cuisineType: e.target.value })}
              placeholder="Italian, Mediterranean, Fusion..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Price Range</label>
            <select
              className={styles.select}
              value={formData.priceRange}
              onChange={e => updateSettings({ priceRange: e.target.value })}
            >
              <option value="">Select Price Range</option>
              <option value="$">$ (Under €15 per person)</option>
              <option value="$$">$$ (€15-30 per person)</option>
              <option value="$$$">$$$ (€30-60 per person)</option>
              <option value="$$$$">$$$$ (€60+ per person)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Special Features</label>
            <div className={styles.checkboxGrid}>
              {[
                'WiFi Available',
                'Pet Friendly',
                'Family Friendly',
                'Wheelchair Accessible',
                'Outdoor Seating',
                'Private Dining',
                'Live Music',
                'Happy Hour',
                'Brunch Available',
                'Late Night Dining',
                'BYOB',
                'Reservations Required'
              ].map(feature => (
                <label key={feature} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.specialFeatures.includes(feature)}
                    onChange={e => {
                      const features = formData.specialFeatures || [];
                      const updatedFeatures = e.target.checked
                        ? [...features, feature]
                        : features.filter(f => f !== feature);
                      updateSettings({ specialFeatures: updatedFeatures });
                    }}
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}