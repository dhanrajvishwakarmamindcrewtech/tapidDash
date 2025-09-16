import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  Calendar, 
  TrendingUp, 
  Gift,
  CheckCircle,
  AlertCircle,
  Euro
} from 'lucide-react';
import styles from '../SettingsPage.module.css';

export default function Billing({
  settings,
  onSettingsChange,
  currentPlanRef,
  paymentMethodsRef,
  billingHistoryRef,
}) {
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  // Local form state that updates immediately
  const [formData, setFormData] = useState({
    paymentMethods: settings.paymentMethods || []
  });

  // Sync with settings when they change from parent
  useEffect(() => {
    setFormData({
      paymentMethods: settings.paymentMethods || []
    });
  }, [settings]);

  // Helper function to update both local state and notify parent
  const updateSettings = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (onSettingsChange) {
      onSettingsChange(updates);
    }
  };

  // Mock billing data
  const planDetails = {
    name: 'Subscription Plan',
    description: '1% transaction fee',
    nextBilling: '15th of each month',
    status: 'Active'
  };

  const earlyAdopterCredit = {
    amount: 50,
    description: 'Early Adopter Bonus',
    expiresDate: 'August 2025',
  };

  const currentMonth = new Date().toLocaleDateString('en-IE', { month: 'long', year: 'numeric' });
  
  const billingData = {
    transactionVolume: 2847.50,
    transactionFee: 28.48,
    creditApplied: -50.00,
    totalDue: 0.00,
    remainingCredit: 21.52
  };

  // Use formData for payment methods, fallback to mock data if empty
  const paymentMethods = formData.paymentMethods.length > 0 ? formData.paymentMethods : [
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiryMonth: '12',
      expiryYear: '26',
      holderName: 'John Doe',
      isDefault: true
    }
  ];

  const billingHistory = [
    {
      id: 1,
      date: '2025-05-15',
      description: 'Monthly transaction fees',
      transactionVolume: 3250.00,
      fee: 32.50,
      credit: -50.00,
      total: 0.00,
      status: 'Paid'
    },
    {
      id: 2,
      date: '2025-04-15',
      description: 'Monthly transaction fees',
      transactionVolume: 2890.75,
      fee: 28.91,
      credit: -50.00,
      total: 0.00,
      status: 'Paid'
    },
    {
      id: 3,
      date: '2025-03-15',
      description: 'Monthly transaction fees',
      transactionVolume: 2156.25,
      fee: 21.56,
      credit: -50.00,
      total: 0.00,
      status: 'Paid'
    }
  ];

  const getCardIcon = (type) => {
    return <CreditCard size={20} className={styles.cardIcon} />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const addPaymentMethod = (cardData) => {
    const newCard = {
      id: Date.now(),
      type: cardData.type || 'visa',
      last4: cardData.number.replace(/\s/g, '').slice(-4),
      expiryMonth: cardData.expiry.split('/')[0],
      expiryYear: cardData.expiry.split('/')[1],
      holderName: cardData.name,
      isDefault: formData.paymentMethods.length === 0
    };
    
    const updatedMethods = [...formData.paymentMethods, newCard];
    updateSettings({ paymentMethods: updatedMethods });
    setShowAddCardModal(false);
  };

  const removePaymentMethod = (methodId) => {
    const updatedMethods = formData.paymentMethods.filter(method => method.id !== methodId);
    updateSettings({ paymentMethods: updatedMethods });
  };

  return (
    <>
      <div className={styles.sectionContent}>
        <div className={styles.subsection} ref={currentPlanRef}>
          <h3 className={styles.subsectionTitle}>Current Plan</h3>
          
          <div className={styles.planOverview}>
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <h4 className={styles.planName}>{planDetails.name}</h4>
                  <div className={styles.planDescription}>{planDetails.description}</div>
                  <div className={styles.planMeta}>
                    <span className={styles.planStatus}>
                      <CheckCircle size={16} />
                      {planDetails.status}
                    </span>
                    <span className={styles.nextBilling}>
                      Next billing: {planDetails.nextBilling}
                    </span>
                  </div>
                </div>
                <div className={styles.planActions}>
                  <button className={styles.secondaryButton}>
                    View Details
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.creditCard}>
              <div className={styles.creditHeader}>
                <Gift size={20} className={styles.creditIcon} />
                <div className={styles.creditInfo}>
                  <h4 className={styles.creditTitle}>Early Adopter Credit</h4>
                  <div className={styles.creditAmount}>{formatCurrency(earlyAdopterCredit.amount)}</div>
                </div>
              </div>
              <div className={styles.creditDetails}>
                <div className={styles.creditItem}>
                  <span>Remaining Credit:</span>
                  <span className={styles.creditValue}>{formatCurrency(billingData.remainingCredit)}</span>
                </div>
                <div className={styles.creditItem}>
                  <span>Status:</span>
                  <span className={styles.creditStatus}>{earlyAdopterCredit.expiresDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.currentBilling}>
            <h4 className={styles.billingTitle}>Current Month Summary ({currentMonth})</h4>
            <div className={styles.billingGrid}>
              <div className={styles.billingMetric}>
                <div className={styles.metricIcon}>
                  <TrendingUp size={20} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Transaction Volume</div>
                  <div className={styles.metricValue}>{formatCurrency(billingData.transactionVolume)}</div>
                </div>
              </div>
              
              <div className={styles.billingMetric}>
                <div className={styles.metricIcon}>
                  <Euro size={20} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Transaction Fee (1%)</div>
                  <div className={styles.metricValue}>{formatCurrency(billingData.transactionFee)}</div>
                </div>
              </div>
              
              <div className={styles.billingMetric}>
                <div className={styles.metricIcon}>
                  <Gift size={20} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Credit Applied</div>
                  <div className={styles.metricValue} style={{color: '#10b981'}}>
                    {formatCurrency(billingData.creditApplied)}
                  </div>
                </div>
              </div>
              
              <div className={styles.billingMetric}>
                <div className={styles.metricIcon}>
                  <CheckCircle size={20} />
                </div>
                <div className={styles.metricInfo}>
                  <div className={styles.metricLabel}>Total Due</div>
                  <div className={styles.metricValue} style={{color: '#10b981', fontSize: '18px', fontWeight: '600'}}>
                    {formatCurrency(billingData.totalDue)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.subsection} ref={paymentMethodsRef}>
          <h3 className={styles.subsectionTitle}>Payment Methods</h3>
          
          <div className={styles.paymentMethodsList}>
            {paymentMethods.map((method) => (
              <div key={method.id} className={styles.paymentMethod}>
                <div className={styles.paymentMethodInfo}>
                  {getCardIcon(method.type)}
                  <div className={styles.cardDetails}>
                    <div className={styles.cardNumber}>
                      •••• •••• •••• {method.last4}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.cardExpiry}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </span>
                      <span className={styles.cardHolder}>{method.holderName}</span>
                    </div>
                  </div>
                </div>
                
                <div className={styles.paymentMethodStatus}>
                  {method.isDefault && (
                    <span className={styles.defaultBadge}>Default</span>
                  )}
                </div>
                
                <div className={styles.paymentMethodActions}>
                  <button className={styles.iconButton} title="Edit card">
                    <Edit3 size={16} />
                  </button>
                  <button 
                    className={styles.iconButton} 
                    title="Remove card"
                    onClick={() => removePaymentMethod(method.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button 
            className={styles.secondaryButton}
            onClick={() => setShowAddCardModal(true)}
          >
            <Plus size={16} />
            Add Payment Method
          </button>

          <div className={styles.paymentNote}>
            <AlertCircle size={16} />
            <span>Your payment method will only be charged if your monthly fees exceed your available credit balance.</span>
          </div>
        </div>

        <div className={styles.subsection} ref={billingHistoryRef}>
          <h3 className={styles.subsectionTitle}>Billing History</h3>
          
          <div className={styles.billingHistoryTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableHeaderCell}>Date</div>
              <div className={styles.tableHeaderCell}>Description</div>
              <div className={styles.tableHeaderCell}>Volume</div>
              <div className={styles.tableHeaderCell}>Fee</div>
              <div className={styles.tableHeaderCell}>Credit</div>
              <div className={styles.tableHeaderCell}>Total</div>
              <div className={styles.tableHeaderCell}>Status</div>
              <div className={styles.tableHeaderCell}>Actions</div>
            </div>
            
            {billingHistory.map((invoice) => (
              <div key={invoice.id} className={styles.tableRow}>
                <div className={styles.tableCell}>
                  {formatDate(invoice.date)}
                </div>
                <div className={styles.tableCell}>
                  {invoice.description}
                </div>
                <div className={styles.tableCell}>
                  {formatCurrency(invoice.transactionVolume)}
                </div>
                <div className={styles.tableCell}>
                  {formatCurrency(invoice.fee)}
                </div>
                <div className={styles.tableCell} style={{color: '#10b981'}}>
                  {formatCurrency(invoice.credit)}
                </div>
                <div className={styles.tableCell} style={{fontWeight: '600'}}>
                  {formatCurrency(invoice.total)}
                </div>
                <div className={styles.tableCell}>
                  <span className={styles.statusBadge}>
                    {invoice.status}
                  </span>
                </div>
                <div className={styles.tableCell}>
                  <button className={styles.iconButton} title="Download invoice">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.tableFooter}>
            <span className={styles.tableInfo}>
              Showing {billingHistory.length} of {billingHistory.length} invoices
            </span>
            <button className={styles.secondaryButton}>
              <Download size={16} />
              Export All
            </button>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddCardModal && (
        <AddCardModal
          onClose={() => setShowAddCardModal(false)}
          onAddCard={addPaymentMethod}
        />
      )}
    </>
  );
}

// Modal component for adding payment methods
function AddCardModal({ onClose, onAddCard }) {
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardData.number && cardData.expiry && cardData.cvc && cardData.name) {
      onAddCard(cardData);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '');
    return v.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Add Payment Method</h3>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeModal}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Card Number</label>
              <input
                type="text"
                className={styles.input}
                placeholder="1234 5678 9012 3456"
                value={cardData.number}
                onChange={e => setCardData(prev => ({ 
                  ...prev, 
                  number: formatCardNumber(e.target.value) 
                }))}
                maxLength="19"
                required
              />
            </div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Expiry Date</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="MM/YY"
                  value={cardData.expiry}
                  onChange={e => setCardData(prev => ({ 
                    ...prev, 
                    expiry: formatExpiry(e.target.value) 
                  }))}
                  maxLength="5"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>CVC</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="123"
                  value={cardData.cvc}
                  onChange={e => setCardData(prev => ({ 
                    ...prev, 
                    cvc: e.target.value.replace(/\D/g, '') 
                  }))}
                  maxLength="4"
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Cardholder Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="John Doe"
                value={cardData.name}
                onChange={e => setCardData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button
              type="button"
              onClick={onClose}
              className={styles.secondaryButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.primaryButton}
            >
              Add Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}