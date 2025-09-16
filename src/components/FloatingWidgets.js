import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, Check, MessageCircle } from 'lucide-react';
import { useApp, useAuth } from '../context/CoreContext';
import { useNotifications } from '../context/UIContext';
import styles from './FloatingWidgets.module.css';
import ChatModal from './ChatModal';

const FloatingWidgets = () => {
  const { globalFilters, updateGlobalFilters } = useApp();
  const { getBusinessData } = useAuth();
  const { showWarning } = useNotifications();
  
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load business data and locations
  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        setLoading(true);
        const data = await getBusinessData();
        
        if (data?.business?.id && data?.locations) {
          console.log('📍 FloatingWidgets: Loaded locations:', {
            businessId: data.business.id,
            locationCount: data.locations.length,
            locations: data.locations.map(l => ({
              id: l.id,
              name: l.name || l.displayInfo?.name,
              address: l.address || l.displayInfo?.address
            }))
          });

          setLocations(data.locations);

          // Set selected location
          const location = data.locations.find(l => l.id === globalFilters.selectedLocation);
          if (location) {
            setSelectedLocation(location);
          } else if (data.locations.length > 0) {
            // If no location is selected or selected location not found, select first one
            const defaultLocation = data.locations[0];
            setSelectedLocation(defaultLocation);
            updateGlobalFilters({ selectedLocation: defaultLocation.id });
          }
        }
      } catch (error) {
        console.error('❌ FloatingWidgets: Error loading business data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessData();
  }, [getBusinessData, globalFilters.selectedLocation, updateGlobalFilters]);

  const switchLocation = (id) => {
    const location = locations.find(l => l.id === id);
    if (location) {
      setSelectedLocation(location);
      updateGlobalFilters({ selectedLocation: location.id });
      setOpen(false);
      
      // Show toast notification
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      
      console.log('🔄 Switched to location:', location.name || location.displayInfo?.name);
    }
  };

  // Always render chat. Location switcher gracefully handles loading/no data.

  return (
    <>
      <div className={styles.root}>
        {/* Chat Button */}
        <button 
          className={styles.chatBtn}
          onClick={() => setIsChatOpen(true)}
          title="Chat with Tapid Assistant"
        >
          <MessageCircle size={20} />
        </button>

        {/* Location Switcher */}
        <div className={styles.locWrap} aria-live="polite">
          <button
            className={`${styles.locBtn} ${open ? styles.locBtnActive : ''}`} 
            onClick={() => setOpen(!open)}
            title={`Current location: ${selectedLocation?.name || selectedLocation?.displayInfo?.name || 'No location selected'}`}
          >
            <MapPin size={16} className={styles.locIcon} />
            <span className={styles.locName}>
              {loading ? 'Loading...' : (selectedLocation?.name || selectedLocation?.displayInfo?.name || (locations.length ? 'Select Location' : 'No locations'))}
            </span>
            <ChevronDown 
              size={14} 
              className={`${styles.chevron} ${open ? styles.flip : ''}`} 
            />
          </button>

          {open && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <MapPin size={14} />
                <span>Switch Location</span>
              </div>
              
              {locations.length === 0 ? (
                <div className={styles.emptyState}>No locations found</div>
              ) : (
                locations.map((loc) => (
                  <button
                    key={loc.id}
                    className={loc.id === selectedLocation?.id ? styles.activeOpt : styles.opt}
                    onClick={() => switchLocation(loc.id)}
                  >
                    <div className={styles.locationInfo}>
                      <span className={styles.locationName}>
                        {loc.name || loc.displayInfo?.name}
                      </span>
                      <span className={styles.locationAddress}>
                        {loc.address || loc.displayInfo?.address}
                      </span>
                    </div>
                    {loc.id === selectedLocation?.id && (
                      <Check size={16} className={styles.checkIcon} />
                    )}
                  </button>
                ))
              )}

              <button className={styles.addLocationOpt}>
                <div className={styles.locationInfo}>
                  <span className={styles.locationName}>+ Add New Location</span>
                  <span className={styles.locationAddress}>Create a new business location</span>
                </div>
              </button>
            </div>
          )}

          {showToast && (
            <div className={styles.toast}>
              <MapPin size={14} />
              <span>Switched to {selectedLocation.name || selectedLocation.displayInfo?.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  );
};

export default FloatingWidgets; 