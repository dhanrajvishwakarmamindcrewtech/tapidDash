import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  Zap,
  Crown,
  Users,
  Building2,
  FileText,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CreditCard as CardIcon,
  Receipt,
  Clock,
  Star,
  X
} from 'lucide-react';
import styles from './SettingsPage.module.css';

// Context imports
import { useApp, useSettings, useAuth } from '../../context/CoreContext';
import { useNotifications } from '../../context/UIContext';

const BillingPage = () => {
  // Context hooks
  const { user } = useApp();
  const { settings, saveSettings } = useSettings();
  const { showSuccess, showError, showWarning, showInfo } = useNotifications();
  const { getBusinessData } = useAuth();

  // Local state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInvoicesModal, setShowInvoicesModal] = useState(false);

  // Billing data state
  const [currentPlan, setCurrentPlan] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Mock billing data for now
  const mockCurrentPlan = {
    id: 'learning',
    name: 'Learning & Optimization',
    phase: 2,
    price: 0, // Will be calculated based on transactions
    currency: 'EUR',
    interval: 'month',
    status: 'active',
    features: [
      'Full feature access',
      'Data gathering & analysis',
      'Loyalty campaign optimization',
      'Transaction tracking',
      'Basic insights',
      'Customer behavior analysis'
    ],
    nextBilling: '2024-02-15T00:00:00Z',
    usage: {
      locations: 3,
      maxLocations: 10,
      customers: 1250,
      maxCustomers: 5000,
      storage: 2.5,
      maxStorage: 10,
      transactions: 8500,
      transactionValue: 42500,
      monthlyFee: 25.50
    },
    pricing: {
      model: 'transaction-based',
      percentage: 1,
      cap: 30,
      trackedTransactions: 8500,
      totalValue: 42500
    }
  };

  const mockPaymentMethods = [
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
      holderName: 'John Smith'
    }
  ];

  const mockBillingHistory = [
    {
      id: '1',
      date: '2024-01-15T00:00:00Z',
      amount: 25.50,
      currency: 'EUR',
      status: 'paid',
      description: 'Learning Phase - January 2024',
      invoiceNumber: 'INV-2024-001',
      details: '8,500 transactions • €42,500 value • 1% fee'
    },
    {
      id: '2',
      date: '2023-12-15T00:00:00Z',
      amount: 0,
      currency: 'EUR',
      status: 'paid',
      description: 'Free Onboarding - December 2023',
      invoiceNumber: 'INV-2023-012',
      details: 'Setup month • No charge'
    },
    {
      id: '3',
      date: '2023-11-15T00:00:00Z',
      amount: 0,
      currency: 'EUR',
      status: 'paid',
      description: 'Free Onboarding - November 2023',
      invoiceNumber: 'INV-2023-011',
      details: 'Setup month • No charge'
    },
    {
      id: '4',
      date: '2023-10-15T00:00:00Z',
      amount: 0,
      currency: 'EUR',
      status: 'paid',
      description: 'Free Onboarding - October 2023',
      invoiceNumber: 'INV-2023-010',
      details: 'Setup month • No charge'
    },
    {
      id: '5',
      date: '2023-09-15T00:00:00Z',
      amount: 0,
      currency: 'EUR',
      status: 'paid',
      description: 'Free Onboarding - September 2023',
      invoiceNumber: 'INV-2023-009',
      details: 'Setup month • No charge'
    },
    {
      id: '6',
      date: '2023-08-15T00:00:00Z',
      amount: 0,
      currency: 'EUR',
      status: 'paid',
      description: 'Free Onboarding - August 2023',
      invoiceNumber: 'INV-2023-008',
      details: 'Setup month • No charge'
    }
  ];

  // Load billing data
  useEffect(() => {
    const loadBillingData = async () => {
      try {
        setDataLoading(true);
        setDataError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentPlan(mockCurrentPlan);
        setPaymentMethods(mockPaymentMethods);
        setBillingHistory(mockBillingHistory);
        
      } catch (error) {
        console.error('❌ BILLING: Error loading billing data:', error);
        setDataError('Failed to load billing data');
      } finally {
        setDataLoading(false);
      }
    };

    loadBillingData();
  }, []);

  const handleAddPaymentMethod = () => {
    showWarning('Adding payment methods coming soon!');
  };

  const handleChangePlan = () => {
    showWarning('Plan changes coming soon!');
  };

  const handleDownloadInvoice = (invoiceId) => {
    showSuccess(`Invoice ${invoiceId} downloaded successfully`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'paid':
        return '#059669';
      case 'pending':
        return '#d97706';
      case 'overdue':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'paid': return 'Paid';
      case 'pending': return 'Pending';
      case 'overdue': return 'Overdue';
      default: return 'Unknown';
    }
  };

  const getCardBrandIcon = (brand) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      default:
        return '💳';
    }
  };

  const getUsagePercentage = (current, max) => {
    return Math.round((current / max) * 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return '#dc2626';
    if (percentage >= 75) return '#d97706';
    return '#059669';
  };

  // Usage metrics for KPI cards
  const usageMetrics = [
    {
      title: 'Current Phase',
      value: currentPlan?.name || 'Free Onboarding',
      change: `Phase ${currentPlan?.phase || 1} of 3`,
      icon: Crown,
      color: currentPlan?.phase === 1 ? '#10b981' : currentPlan?.phase === 2 ? '#f59e0b' : '#3b82f6'
    },
    {
      title: 'Monthly Fee',
      value: formatCurrency(currentPlan?.usage?.monthlyFee || 0, currentPlan?.currency),
      change: `${currentPlan?.pricing?.percentage || 1}% of tracked transactions`,
      icon: DollarSign,
      color: currentPlan?.usage?.monthlyFee > 0 ? '#059669' : '#6b7280'
    },
    {
      title: 'Tracked Transactions',
      value: `${(currentPlan?.usage?.transactions || 0).toLocaleString()}`,
      change: `€${(currentPlan?.usage?.transactionValue || 0).toLocaleString()} total value`,
      icon: TrendingUp,
      color: '#3b82f6'
    },
    {
      title: 'Monthly Cap',
      value: `€${currentPlan?.pricing?.cap || 30}`,
      change: currentPlan?.phase === 1 ? 'Free onboarding' : 'Maximum monthly fee',
      icon: Shield,
      color: currentPlan?.phase === 1 ? '#10b981' : '#6b7280'
    }
  ];

  // Get first 2 invoices for preview
  const previewInvoices = billingHistory?.slice(0, 2) || [];
  const hasMoreInvoices = billingHistory?.length > 2;

  return (
    <div className={styles.container}>
      {/* Main Content */}
      <div className={styles.content}>
        {/* Header */}
        <div className={styles.contentHeader}>
          <div className={styles.headerContent}>
            <h2 className={styles.contentTitle}>
              Billing & Usage
            </h2>
            <p className={styles.contentSubtitle}>
              Manage your subscription, payment methods, and view usage
            </p>
          </div>
        </div>

        {/* Usage Overview Cards */}
        <div className={styles.teamOverview}>
          {usageMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className={styles.overviewCard}>
                <div className={styles.overviewIcon} style={{ color: metric.color }}>
                  <IconComponent size={24} />
                </div>
                <div className={styles.overviewContent}>
                  <div className={styles.overviewValue}>{metric.value}</div>
                  <div className={styles.overviewLabel}>{metric.title}</div>
                  <div className={styles.overviewChange} style={{ color: metric.color }}>
                    {metric.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current Plan Section */}
        <div className={styles.teamSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Current Plan</h3>
            <div className={styles.sectionBadge}>
              {currentPlan?.status || 'Active'}
            </div>
          </div>
          
          {currentPlan && (
            <div className={styles.planCard}>
              <div className={styles.planHeader}>
                <div className={styles.planInfo}>
                  <div className={styles.planIcon}>
                    <Crown size={24} />
                  </div>
                  <div className={styles.planDetails}>
                    <div className={styles.planName}>{currentPlan.name}</div>
                    <div className={styles.planPrice}>
                      {currentPlan.phase === 1 ? 'Free' : `${currentPlan.pricing.percentage}% of transactions`}
                    </div>
                    <div className={styles.planNextBilling}>
                      Next billing: {formatDate(currentPlan.nextBilling)}
                    </div>
                  </div>
                </div>
                <div className={styles.planStatus}>
                  <div 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(currentPlan.status) }}
                  >
                    {getStatusText(currentPlan.status)}
                  </div>
                </div>
              </div>
              
              <div className={styles.planFeatures}>
                <div className={styles.featuresLabel}>Plan Features:</div>
                <div className={styles.featuresList}>
                  {currentPlan.features.map((feature, index) => (
                    <div key={index} className={styles.featureItem}>
                      <CheckCircle size={16} />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              {currentPlan.phase > 1 && (
                <div className={styles.pricingDetails}>
                  <div className={styles.pricingLabel}>Pricing Details:</div>
                  <div className={styles.pricingGrid}>
                    <div className={styles.pricingItem}>
                      <div className={styles.pricingValue}>
                        {currentPlan.usage.transactions.toLocaleString()}
                      </div>
                      <div className={styles.pricingLabel}>Tracked Transactions</div>
                    </div>
                    <div className={styles.pricingItem}>
                      <div className={styles.pricingValue}>
                        €{currentPlan.usage.transactionValue.toLocaleString()}
                      </div>
                      <div className={styles.pricingLabel}>Total Value</div>
                    </div>
                    <div className={styles.pricingItem}>
                      <div className={styles.pricingValue}>
                        {formatCurrency(currentPlan.usage.monthlyFee, currentPlan.currency)}
                      </div>
                      <div className={styles.pricingLabel}>This Month's Fee</div>
                    </div>
                    <div className={styles.pricingItem}>
                      <div className={styles.pricingValue}>
                        €{currentPlan.pricing.cap}
                      </div>
                      <div className={styles.pricingLabel}>Monthly Cap</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Methods and Recent Invoices Row */}
        <div className={styles.billingRow}>
          {/* Payment Methods Section */}
          <div className={styles.teamSection}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionHeaderContent}>
                <h3 className={styles.sectionTitle}>Payment Methods</h3>
                <div className={styles.sectionBadge}>
                  {paymentMethods?.length || 0} method{paymentMethods?.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className={styles.sectionActions}>
                <button 
                  className={styles.sectionActionButton}
                  onClick={() => showInfo('Edit payment method coming soon!')}
                  title="Edit payment method"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button 
                  className={styles.sectionActionButton}
                  onClick={() => showWarning('Update plan coming soon!')}
                  title="Update plan"
                >
                  <Zap size={16} />
                  Update Plan
                </button>
              </div>
            </div>
            
            <div className={styles.paymentMethodsList}>
              {paymentMethods?.map((method) => (
                <div key={method.id} className={styles.paymentMethodCard}>
                  <div className={styles.paymentMethodInfo}>
                    <div className={styles.paymentMethodIcon}>
                      {getCardBrandIcon(method.brand)}
                    </div>
                    <div className={styles.paymentMethodDetails}>
                      <div className={styles.paymentMethodName}>
                        {method.brand.toUpperCase()} •••• {method.last4}
                        {method.isDefault && (
                          <span className={styles.defaultBadge}>Default</span>
                        )}
                      </div>
                      <div className={styles.paymentMethodExpiry}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </div>
                      <div className={styles.paymentMethodHolder}>
                        {method.holderName}
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.paymentMethodActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => showInfo('Edit payment method coming soon!')}
                      title="Edit payment method"
                    >
                      <Edit size={16} />
                    </button>
                    {!method.isDefault && (
                      <button 
                        className={styles.actionButton}
                        onClick={() => showWarning('Remove payment method coming soon!')}
                        title="Remove payment method"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invoices Section */}
          <div className={styles.teamSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Invoices</h3>
              <div className={styles.sectionBadge}>
                {billingHistory?.length || 0} invoices
              </div>
            </div>
            
            <div className={styles.invoicesList}>
              {previewInvoices.map((invoice) => (
                <div key={invoice.id} className={styles.invoiceCard}>
                  <div className={styles.invoiceInfo}>
                    <div className={styles.invoiceIcon}>
                      <Receipt size={20} />
                    </div>
                    <div className={styles.invoiceDetails}>
                      <div className={styles.invoiceDescription}>
                        {invoice.description}
                      </div>
                      <div className={styles.invoiceNumber}>
                        {invoice.invoiceNumber}
                      </div>
                      <div className={styles.invoiceDate}>
                        {formatDate(invoice.date)}
                      </div>
                                          {invoice.details && (
                      <div className={styles.invoiceTransactionDetails}>
                        {invoice.details}
                      </div>
                    )}
                    </div>
                  </div>
                  
                  <div className={styles.invoiceAmount}>
                    <div className={styles.amountValue}>
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </div>
                    <div 
                      className={styles.invoiceStatus}
                      style={{ backgroundColor: getStatusColor(invoice.status) }}
                    >
                      {getStatusText(invoice.status)}
                    </div>
                  </div>
                  
                  <div className={styles.invoiceActions}>
                    <button 
                      className={styles.actionButton}
                      onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                      title="Download invoice"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              {hasMoreInvoices && (
                <button 
                  className={styles.viewMoreButton}
                  onClick={() => setShowInvoicesModal(true)}
                >
                  <Receipt size={16} />
                  View All Invoices ({billingHistory.length})
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Modal */}
      {showInvoicesModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>All Invoices</h3>
              <button 
                className={styles.modalClose}
                onClick={() => setShowInvoicesModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.modalInvoicesList}>
                {billingHistory?.map((invoice) => (
                  <div key={invoice.id} className={styles.modalInvoiceCard}>
                    <div className={styles.modalInvoiceInfo}>
                      <div className={styles.modalInvoiceIcon}>
                        <Receipt size={20} />
                      </div>
                      <div className={styles.modalInvoiceDetails}>
                        <div className={styles.modalInvoiceDescription}>
                          {invoice.description}
                        </div>
                        <div className={styles.modalInvoiceNumber}>
                          {invoice.invoiceNumber}
                        </div>
                        <div className={styles.modalInvoiceDate}>
                          {formatDate(invoice.date)}
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.modalInvoiceAmount}>
                      <div className={styles.modalAmountValue}>
                        {formatCurrency(invoice.amount, invoice.currency)}
                      </div>
                      <div 
                        className={styles.modalInvoiceStatus}
                        style={{ backgroundColor: getStatusColor(invoice.status) }}
                      >
                        {getStatusText(invoice.status)}
                      </div>
                    </div>
                    
                    <div className={styles.modalInvoiceActions}>
                      <button 
                        className={styles.modalActionButton}
                        onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                        title="Download invoice"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPage; 