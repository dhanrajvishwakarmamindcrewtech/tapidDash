import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  Plus, 
  Search, 
  CheckCircle, 
  CreditCard, 
  Smartphone, 
  Zap, 
  Store, 
  ShoppingCart, 
  Diamond,
  BarChart3,
  Link2
} from 'lucide-react';
import SumUpService from '../services/sumupService';
import SquareService from '../services/squareService';
import styles from '../screens/SignIn/SignInScreen.module.css';

// POS Terminals Configuration
const POS_TERMINALS = [
  // Available Providers
  {
    id: 'sumup',
    name: 'SumUp',
    description: 'Popular card reader and payment terminal',
    icon: CreditCard,
    features: ['Contactless payments', 'Mobile app integration'],
    service: SumUpService,
    status: 'available'
  },
  {
    id: 'square',
    name: 'Square',
    description: 'Complete point-of-sale system',
    icon: Smartphone,
    features: ['Full POS system', 'Analytics dashboard'],
    service: SquareService,
    status: 'available'
  },
  // Coming Soon Providers
  {
    id: 'clover',
    name: 'Clover',
    description: 'Flexible POS for retail, restaurants, and services',
    icon: Store,
    features: ['Customizable hardware', 'App marketplace'],
    status: 'coming_soon'
  },
  {
    id: 'shopify',
    name: 'Shopify POS',
    description: 'POS for e-commerce and brick-and-mortar',
    icon: ShoppingCart,
    features: ['Unified online/offline sales', 'Inventory sync'],
    status: 'coming_soon'
  },
  {
    id: 'toast',
    name: 'Toast',
    description: 'Restaurant-focused POS system',
    icon: Zap,
    features: ['Order management', 'Table service', 'Online ordering'],
    status: 'coming_soon'
  },
  {
    id: 'stripe',
    name: 'Stripe Terminal',
    description: 'Developer-friendly in-person payments',
    icon: CreditCard,
    features: ['Custom hardware', 'API-first'],
    status: 'coming_soon'
  },
  {
    id: 'lightspeed',
    name: 'Lightspeed',
    description: 'POS for retail, restaurants, and golf',
    icon: Diamond,
    features: ['Multi-location', 'Inventory management'],
    status: 'coming_soon'
  },
  {
    id: 'vend',
    name: 'Vend',
    description: 'Cloud-based retail POS',
    icon: BarChart3,
    features: ['Inventory', 'Customer loyalty', 'E-commerce'],
    status: 'coming_soon'
  },
  {
    id: 'eposnow',
    name: 'Epos Now',
    description: 'POS for hospitality and retail',
    icon: Store,
    features: ['Cloud-based', 'Reporting', 'Integrations'],
    status: 'coming_soon'
  },
  {
    id: 'revel',
    name: 'Revel Systems',
    description: 'iPad POS for restaurants and retail',
    icon: Smartphone,
    features: ['Mobile', 'Inventory', 'CRM'],
    status: 'coming_soon'
  },
  {
    id: 'oracle',
    name: 'Oracle MICROS',
    description: 'Enterprise POS for hospitality',
    icon: Store,
    features: ['Enterprise', 'Table management', 'Reporting'],
    status: 'coming_soon'
  },
  {
    id: 'touchbistro',
    name: 'TouchBistro',
    description: 'iPad POS for restaurants',
    icon: Smartphone,
    features: ['Tableside ordering', 'Menu management'],
    status: 'coming_soon'
  },
  {
    id: 'posnation',
    name: 'POS Nation',
    description: 'Custom POS for small business',
    icon: Store,
    features: ['Custom hardware', 'Support'],
    status: 'coming_soon'
  },
  {
    id: 'shopkeep',
    name: 'ShopKeep',
    description: 'Cloud-based POS for retail and restaurants',
    icon: ShoppingCart,
    features: ['Inventory', 'Employee management'],
    status: 'coming_soon'
  },
  {
    id: 'bindo',
    name: 'Bindo POS',
    description: 'iPad POS for retail',
    icon: Smartphone,
    features: ['Inventory', 'CRM', 'E-commerce'],
    status: 'coming_soon'
  },
  // Special Other option
  {
    id: 'other',
    name: 'Other',
    description: "Is your POS terminal in the 'Coming Soon' list? Select this option and we'll use ML to match your transactions!",
    icon: Link2,
    features: ['Custom integration available'],
    status: 'available'
  }
];

const POSModal = ({ 
  isOpen, 
  onClose, 
  selectedTerminals, 
  setSelectedTerminals,
  connectedTerminals,
  setConnectedTerminals,
  onTerminalConnect 
}) => {
  const [posModalStep, setPosModalStep] = useState('initial');
  const [posSearchTerm, setPosSearchTerm] = useState('');
  const [selectedTerminalIds, setSelectedTerminalIds] = useState(new Set());
  const [connectingTerminal, setConnectingTerminal] = useState(null);
  const [otherMerchantName, setOtherMerchantName] = useState('');
  const [showMLMessage, setShowMLMessage] = useState(false);
  const [pendingOtherId, setPendingOtherId] = useState(null);

  // Filter POS terminals based on search term
  const filteredPOSTerminals = POS_TERMINALS.filter(provider => {
    const searchLower = posSearchTerm.toLowerCase();
    return (
      provider.name.toLowerCase().includes(searchLower) ||
      provider.description.toLowerCase().includes(searchLower) ||
      provider.features.some(feature => 
        feature.toLowerCase().includes(searchLower)
      )
    );
  });

  // Handle terminal selection
  const handleTerminalSelection = (terminalId) => {
    setSelectedTerminalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(terminalId)) {
        newSet.delete(terminalId);
      } else {
        newSet.add(terminalId);
      }
      return newSet;
    });
  };

  // Add selected terminals to the list
  const handleAddSelectedTerminals = () => {
    const newTerminals = Array.from(selectedTerminalIds).map(id => {
      const terminal = POS_TERMINALS.find(t => t.id === id);
      return {
        ...terminal,
        status: 'pending',
        addedAt: new Date().toISOString()
      };
    });
    
    setSelectedTerminals(prev => [...prev, ...newTerminals]);
    setSelectedTerminalIds(new Set());
    setPosModalStep('management');
  };

  // Remove terminal from the list
  const handleRemoveTerminal = (terminalId) => {
    setSelectedTerminals(prev => prev.filter(t => t.id !== terminalId));
    setConnectedTerminals(prev => {
      const newSet = new Set(prev);
      newSet.delete(terminalId);
      return newSet;
    });
  };

  // Connect to SumUp
  const connectToSumUp = async () => {
    try {
      setConnectingTerminal('SumUp');
      const oauthUrl = SumUpService.generateOAuthUrl();
      console.log('🔗 Redirecting to SumUp OAuth...');
      window.open(oauthUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ SumUp OAuth Error:', error);
      setConnectingTerminal(null);
      alert('Failed to connect to SumUp. Please try again.');
    }
  };

  // Connect to Square
  const connectToSquare = async () => {
    try {
      setConnectingTerminal('Square');
      const oauthUrl = SquareService.generateOAuthUrl();
      console.log('🔗 Redirecting to Square OAuth...');
      window.open(oauthUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('❌ Square OAuth Error:', error);
      setConnectingTerminal(null);
      alert('Failed to connect to Square. Please try again.');
    }
  };

  // Generic connect handler
  const handleConnectProvider = async (providerId) => {
    setConnectingTerminal(providerId);
    try {
      const provider = POS_TERMINALS.find(t => t.id === providerId);
      if (provider && provider.service && provider.service.generateOAuthUrl) {
        const oauthUrl = provider.service.generateOAuthUrl();
        console.log(`[POS] Connecting to ${provider.name}:`, oauthUrl);
        window.open(oauthUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('No connect logic for provider:', providerId);
      }
    } catch (err) {
      console.error(`Failed to initiate connection for ${providerId}:`, err);
    } finally {
      setConnectingTerminal(null);
    }
  };

  // Handle Other merchant name submission (connect)
  const handleOtherSubmit = (terminal) => {
    if (otherMerchantName.trim()) {
      setPendingOtherId(terminal.id);
      setShowMLMessage(true);
    }
  };

  // Handle ML message confirmation
  const handleMLMessageConfirm = () => {
    setShowMLMessage(false);
    // Update the 'Other' terminal to connected and set the merchant name
    setSelectedTerminals(prev => prev.map(t => {
      if (t.id === 'other' && t.status === 'pending') {
        return {
          ...t,
          name: `Other - ${otherMerchantName}`,
          description: `Custom integration for ${otherMerchantName}`,
          merchantName: otherMerchantName,
          status: 'connected',
        };
      }
      return t;
    }));
    setOtherMerchantName('');
    setPendingOtherId(null);
    setPosModalStep('management');
  };

  // Connect terminal
  const connectTerminal = (terminal) => {
    if (terminal.id === 'sumup') {
      connectToSumUp();
    } else if (terminal.id === 'square') {
      connectToSquare();
    } else {
      handleConnectProvider(terminal.id);
    }
  };

  if (!isOpen) return null;

  // Initial/Maintenance Step
  if (posModalStep === 'initial') {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>POS Terminal Management</h3>
            <button 
              onClick={onClose}
              className={styles.posModalClose}
              aria-label="Close POS modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.posInfoSection}>
              <div className={styles.posInfoIcon}>
                <CreditCard size={32} />
              </div>
              <div>
                <h4 className={styles.posInfoTitle}>Connect Your POS Terminals</h4>
                <p className={styles.posInfoDescription}>
                  Add and manage your Point of Sale terminals. Connect multiple terminals to sync your sales data, customer information, and transaction history across all your locations.
                </p>
              </div>
            </div>

            {selectedTerminals.length === 0 ? (
              <div className={styles.posEmptyState}>
                <CreditCard size={48} className={styles.emptyStateIcon} />
                <h4 className={styles.emptyStateTitle}>No POS Terminals Added</h4>
                <p className={styles.emptyStateDescription}>
                  Start by adding your POS terminals to begin syncing your business data.
                </p>
                <button
                  onClick={() => setPosModalStep('selection')}
                  className={styles.primaryButton}
                >
                  <Plus size={18} />
                  Add POS Terminal
                </button>
              </div>
            ) : (
              <div className={styles.terminalManagementSection}>
                <div className={styles.managementHeader}>
                  <h4 className={styles.managementTitle}>Your POS Terminals</h4>
                  <button
                    onClick={() => setPosModalStep('selection')}
                    className={styles.addMoreButton}
                  >
                    <Plus size={16} />
                    Add More
                  </button>
                </div>
                
                <div className={styles.terminalList}>
                  {selectedTerminals.map(terminal => (
                    <div key={terminal.id} className={styles.terminalCard}>
                      <div className={styles.terminalContent}>
                        <div className={styles.terminalIcon}>
                          {React.createElement(terminal.icon, { size: 24 })}
                        </div>
                        <div className={styles.terminalInfo}>
                          <h5 className={styles.terminalName}>{terminal.name}</h5>
                          <p className={styles.terminalDescription}>{terminal.description}</p>
                        </div>
                      </div>
                      <div className={styles.terminalActions}>
                        {terminal.status === 'pending' && (
                          <button
                            className={styles.connectTerminalButton}
                            onClick={() => connectTerminal(terminal)}
                          >
                            Connect
                          </button>
                        )}
                        {terminal.status === 'connected' && (
                          <div className={styles.connectedBadge}>
                            <CheckCircle size={16} />
                            <span>Connected</span>
                          </div>
                        )}
                        <button
                          onClick={() => handleRemoveTerminal(terminal.id)}
                          className={styles.removeTerminalButton}
                          aria-label={`Remove ${terminal.name}`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.secondaryButton}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Selection Step
  if (posModalStep === 'selection') {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <button 
              onClick={() => setPosModalStep('initial')}
              className={styles.backButton}
              aria-label="Back to POS management"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <h3 className={styles.modalTitle}>Select POS Terminals</h3>
            <button 
              onClick={onClose}
              className={styles.posModalClose}
              aria-label="Close POS modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.posInfoSection}>
              <div className={styles.posInfoIcon}>
                <Plus size={32} />
              </div>
              <div>
                <h4 className={styles.posInfoTitle}>Choose Your POS Terminals</h4>
                <p className={styles.posInfoDescription}>
                  Select the POS terminals you want to connect. You can select multiple terminals and connect them individually later.
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className={styles.posSearchContainer}>
              <div className={styles.searchInputWrapper}>
                <Search size={18} className={styles.searchIcon} />
                <input
                  type="text"
                  value={posSearchTerm}
                  onChange={(e) => setPosSearchTerm(e.target.value)}
                  className={styles.posSearchInput}
                  placeholder="Search POS providers..."
                  aria-label="Search POS providers"
                />
                {posSearchTerm && (
                  <button
                    onClick={() => setPosSearchTerm('')}
                    className={styles.clearSearchButton}
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              {posSearchTerm && (
                <div className={styles.searchResultsInfo}>
                  {filteredPOSTerminals.length === 0 ? (
                    <span className={styles.noResults}>No providers found</span>
                  ) : (
                    <span className={styles.resultsCount}>
                      {filteredPOSTerminals.length} provider{filteredPOSTerminals.length !== 1 ? 's' : ''} found
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* POS Providers List - Scrollable */}
            <div className={styles.posListContainer}>
              {filteredPOSTerminals.length === 0 && !posSearchTerm ? (
                <div className={styles.posEmptyState}>
                  <CreditCard size={48} className={styles.emptyStateIcon} />
                  <h4 className={styles.emptyStateTitle}>No POS Providers Available</h4>
                  <p className={styles.emptyStateDescription}>
                    We're working on adding more POS providers. Contact us to request your preferred provider.
                  </p>
                </div>
              ) : filteredPOSTerminals.length === 0 && posSearchTerm ? (
                <div className={styles.posNoResults}>
                  <Search size={48} className={styles.noResultsIcon} />
                  <h4 className={styles.noResultsTitle}>No providers found</h4>
                  <p className={styles.noResultsDescription}>
                    Try searching for a different term or contact us to request your POS provider.
                  </p>
                  <button
                    onClick={() => setPosSearchTerm('')}
                    className={styles.clearSearchLink}
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  {/* Available Providers */}
                  {filteredPOSTerminals.filter(provider => provider.status === 'available').length > 0 && (
                    <div className={styles.providerSection}>
                      <h4 className={styles.providerSectionTitle}>Available Now</h4>
                      {filteredPOSTerminals
                        .filter(provider => provider.status === 'available')
                        .map(provider => (
                          <div
                            key={provider.id}
                            className={`${styles.posListItem} ${styles.posListItemSelection} ${
                              provider.id === 'other' ? styles.posListItemOther : ''
                            } ${selectedTerminalIds.has(provider.id) ? styles.posListItemSelected : ''}`}
                            onClick={() => handleTerminalSelection(provider.id)}
                          >
                            <div className={styles.posListItemContent}>
                              <div className={styles.posListItemIcon}>
                                {React.createElement(provider.icon, { size: 24 })}
                              </div>
                              <div className={styles.posListItemInfo}>
                                <h4 className={styles.posListItemName}>{provider.name}</h4>
                                <p className={styles.posListItemDescription}>{provider.description}</p>
                                <div className={styles.posListItemFeatures}>
                                  {provider.features.map((feature, idx) => (
                                    <span key={idx} className={styles.posListItemFeature}>
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className={styles.posListItemActions}>
                              <div className={styles.selectionCheckbox}>
                                {selectedTerminalIds.has(provider.id) ? (
                                  <CheckCircle size={20} className={styles.selectedCheck} />
                                ) : (
                                  <div className={styles.unselectedCheck} />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Coming Soon Providers */}
                  {filteredPOSTerminals.filter(provider => provider.status === 'coming_soon').length > 0 && (
                    <div className={styles.providerSection}>
                      <h4 className={styles.providerSectionTitle}>Coming Soon</h4>
                      {filteredPOSTerminals
                        .filter(provider => provider.status === 'coming_soon')
                        .map(provider => (
                          <div
                            key={provider.id}
                            className={`${styles.posListItem} ${styles.posListItemComingSoon}`}
                          >
                            <div className={styles.posListItemContent}>
                              <div className={styles.posListItemIcon}>
                                {React.createElement(provider.icon, { size: 24 })}
                              </div>
                              <div className={styles.posListItemInfo}>
                                <h4 className={styles.posListItemName}>{provider.name}</h4>
                                <p className={styles.posListItemDescription}>{provider.description}</p>
                                <div className={styles.posListItemFeatures}>
                                  {provider.features.map((feature, idx) => (
                                    <span key={idx} className={styles.posListItemFeature}>
                                      {feature}
                                    </span>
                                  ))}
                                </div>
                                <div className={styles.comingSoonBadge}>
                                  <span>Coming Soon</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className={styles.modalFooterFixed}>
            <button
              className={styles.secondaryButton}
              onClick={() => setPosModalStep('initial')}
            >
              Cancel
            </button>
            <button
              className={`${styles.primaryButton} ${selectedTerminalIds.size === 0 ? styles.disabled : ''}`}
              onClick={handleAddSelectedTerminals}
              disabled={selectedTerminalIds.size === 0}
            >
              Add Selected ({selectedTerminalIds.size})
            </button>
          </div>
        </div>
      </div>
    );
  }



  // ML Message Modal
  if (showMLMessage) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3 className={styles.modalTitle}>Machine Learning Integration</h3>
            <button 
              onClick={() => setShowMLMessage(false)}
              className={styles.posModalClose}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div className={styles.posInfoSection}>
              <div className={styles.posInfoIcon}>
                <Zap size={32} />
              </div>
              <div>
                <h4 className={styles.posInfoTitle}>Our Secret Sauce</h4>
                <p className={styles.posInfoDescription}>
                  We use an internal Machine Learning algorithm to match transactions with your merchant name. 
                  Since we don't have your Merchant ID, our ML system will learn the naming conventions from your transaction data.
                </p>
                <div className={styles.mlWarning}>
                  <p><strong>Important:</strong> It may take up to 2 weeks before the ML learns the naming conversion 100% accurately.</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.8 }}>
                    This option is perfect if your POS terminal is in the "Coming Soon" list above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button
              className={styles.primaryButton}
              onClick={handleMLMessageConfirm}
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Management Step
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>POS Terminal Management</h3>
          <button 
            onClick={onClose}
            className={styles.posModalClose}
            aria-label="Close POS modal"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.modalBody}>
          <div className={styles.posInfoSection}>
            <div className={styles.posInfoIcon}>
              <CreditCard size={32} />
            </div>
            <div>
              <h4 className={styles.posInfoTitle}>Manage Your POS Terminals</h4>
              <p className={styles.posInfoDescription}>
                Connect your selected POS terminals individually. Each terminal will be connected separately to ensure secure data synchronization.
              </p>
            </div>
          </div>

          <div className={styles.terminalManagementSection}>
            <div className={styles.managementHeader}>
              <h4 className={styles.managementTitle}>Your POS Terminals</h4>
              <button
                onClick={() => setPosModalStep('selection')}
                className={styles.addMoreButton}
              >
                <Plus size={16} />
                Add More
              </button>
            </div>
            
            <div className={styles.terminalList}>
              {selectedTerminals.map(terminal => (
                <div key={terminal.id} className={styles.terminalCard}>
                  <div className={styles.terminalContent}>
                    <div className={styles.terminalIcon}>
                      {React.createElement(terminal.icon, { size: 24 })}
                    </div>
                    <div className={styles.terminalInfo}>
                      <h5 className={styles.terminalName}>{terminal.name}</h5>
                      <p className={styles.terminalDescription}>{terminal.description}</p>
                      {terminal.id === 'other' && terminal.status === 'pending' && (
                        <div className={styles.otherInputSection}>
                          <input
                            type="text"
                            value={otherMerchantName}
                            onChange={(e) => setOtherMerchantName(e.target.value)}
                            className={styles.otherTextInput}
                            placeholder="Enter your merchant name..."
                          />
                          <button
                            className={`${styles.otherConnectButton} ${!otherMerchantName.trim() ? styles.disabled : ''}`}
                            onClick={() => handleOtherSubmit(terminal)}
                            disabled={!otherMerchantName.trim()}
                          >
                            Connect
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.terminalActions}>
                    {terminal.status === 'pending' && terminal.id !== 'other' && (
                      <button
                        className={styles.connectTerminalButton}
                        onClick={() => connectTerminal(terminal)}
                      >
                        Connect
                      </button>
                    )}
                    {terminal.status === 'connected' && (
                      <div className={styles.connectedBadge}>
                        <CheckCircle size={16} />
                        <span>Connected</span>
                      </div>
                    )}
                    <button
                      onClick={() => handleRemoveTerminal(terminal.id)}
                      className={styles.removeTerminalButton}
                      aria-label={`Remove ${terminal.name}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.secondaryButton}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSModal; 