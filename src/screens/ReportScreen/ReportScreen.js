// ReportsPage.js - Refactored to use ReportsContext
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  TrendingUp,
  Users,
  Gift,
  Star,
  FileText,
  X,
  Download,
  Mail,
  Calendar,
  RefreshCw,
  Settings,
  Bell,
  Share2,
  Filter,
  Check
} from 'lucide-react';
import { useApp } from '../../context/CoreContext';
import { useReports } from '../../context/BusinessDataContext';
import { useNotifications } from '../../context/UIContext';
import styles from './ReportsPage.module.css';
import connectedModalStyles from '../../components/ConnectedTerminalModal.module.css';

const ReportsPage = () => {
  // Context hooks
  const { 
    globalFilters, 
    updateGlobalFilters, 
    getBusinessInfo, 
    getCurrentLocation,
    getHealthStatus 
  } = useApp();
  
  const {
    // State
    loading,
    error,
    currentView,
    generatedReports,
    filters: reportFilters,
    
    // Calculated data
    overviewMetrics,
    
    // Actions
    updateFilters,
    toggleView,
    exportReportsData
  } = useReports();
  
  const { showError } = useNotifications();

  // Local UI state only
  const [selectedReportType, setSelectedReportType] = useState('general');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showDataRequirementModal, setShowDataRequirementModal] = useState(false);
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [connectForm, setConnectForm] = useState({
    frequency: 'weekly',
    recipients: [''],
    sendToMe: true,
    dataScope: {
      campaignOverview: true,
      boosterPerformance: false,
      customerSegments: false,
      averageSpend: false,
      redemptionFunnel: false,
      locationStats: false
    }
  });

  // Mock existing scheduled reports - in real app this would come from API
  const [scheduledReports, setScheduledReports] = useState([
    // Test data - remove this in production
    {
      id: 1,
      frequency: 'weekly',
      recipients: ['team@company.com', 'manager@company.com'],
      createdAt: '2024-01-15',
      dataScope: {
        campaignOverview: true,
        boosterPerformance: true,
        customerSegments: false,
        averageSpend: false,
        redemptionFunnel: false,
        locationStats: false
      }
    }
  ]);

  // Get business info from context
  const businessInfo = getBusinessInfo();
  const currentLocation = getCurrentLocation();
  const healthStatus = getHealthStatus();

  // Icon mapping for metrics
  const iconMap = {
    TrendingUp,
    Users,
    Gift,
    Star
  };

  // Update report filters when global filters change
  useEffect(() => {
    updateFilters({
      dateRange: globalFilters.dateRange,
      location: globalFilters.selectedLocation
    });
  }, [globalFilters, updateFilters]);

  const openReportModal = (reportType) => {
    setSelectedReportType(reportType);
    setShowDataRequirementModal(true);
  };

  // Handle report selection
  const handleReportSelection = (reportType) => {
    setSelectedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportType)) {
        newSet.delete(reportType);
      } else {
        newSet.add(reportType);
      }
      return newSet;
    });
  };

  // Handle generate report
  const handleGenerateReport = () => {
    if (selectedReports.size === 0) {
      showError('Please select at least one report type to generate');
      return;
    }
    
    // Show data requirement modal for now
    setShowDataRequirementModal(true);
  };

  // Handle component errors
  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h3>Failed to load reports</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Modern Header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Reports</span>
            </div>
            <div className={styles.greetingPill}>Analytics & Performance Insights</div>
          </div>
          <div className={styles.lastUpdated}>
            <RefreshCw size={14} />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Report Generation */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Generate Reports</h2>
            <p className={styles.sectionDescription}>
              Select the reports you want to include • 
              Showing data for last {globalFilters.dateRange} days
            </p>
          </div>
          
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading report data...</p>
            </div>
          ) : (
            <>
              {/* Selection Controls */}
              <div className={styles.selectionControls}>
                <div className={styles.selectionInfo}>
                  <span className={styles.selectedCount}>
                    {selectedReports.size} of {overviewMetrics.length} selected
                  </span>
                </div>
                <div className={styles.selectionActions}>
                  <button 
                    className={`${styles.generateReportButton} ${selectedReports.size === 0 ? styles.disabled : ''}`}
                    onClick={handleGenerateReport}
                    disabled={selectedReports.size === 0}
                  >
                    <FileText size={18} />
                    Generate Report{selectedReports.size > 1 ? 's' : ''} ({selectedReports.size})
                  </button>
                </div>
              </div>

              {/* Report Selection Grid */}
              <div className={styles.analyticsGrid4}>
                {overviewMetrics.map((metric, index) => {
                  const Icon = iconMap[metric.icon];
                  const isSelected = selectedReports.has(metric.reportType);
                  
                  return (
                    <div 
                      key={index} 
                      className={`${styles.analyticsCard} ${isSelected ? styles.selectedCard : ''}`}
                      onClick={() => handleReportSelection(metric.reportType)}
                    >
                      <div className={styles.analyticsCardContent}>
                        <div className={styles.cardHeader}>
                          <span>{metric.title}</span>
                        </div>
                        <div className={styles.cardDesc}>Generate detailed {metric.title.toLowerCase()} analysis and insights.</div>
                      </div>
                      <div className={styles.analyticsCardFooter}>
                        <div className={styles.analyticsValueCard}>
                          <span className={styles.analyticsValue}>{metric.value}</span>
                          <div className={styles.progressLabel}>
                            <span className={`${styles.changeValue} ${styles[metric.trend]}`}>
                              {metric.change}
                            </span>
                            <span className={styles.changePeriod}>{metric.period}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Generated Reports Section */}
          {generatedReports.length > 0 && (
            <div className={styles.generatedReportsSection}>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#232428', margin: '0 0 1.2rem 0', textAlign: 'left', paddingBottom: '0.0rem' }}>Recent Reports</div>
              <div className={styles.generatedReportsList}>
                {generatedReports.slice(0, 3).map(report => (
                  <div 
                    key={report.id} 
                    className={styles.analyticsCard}
                    style={{ marginBottom: '1rem' }}
                  >
                    <div className={styles.analyticsCardContent}>
                      <div className={styles.cardHeader}>
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report
                      </div>
                      <div className={styles.cardDesc}>
                        Generated on {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={styles.analyticsCardFooter}>
                    <button 
                        className={styles.primaryButton}
                        style={{ minWidth: 140 }}
                      disabled={report.status !== 'completed'}
                    >
                        <Download size={16} />
                      {report.status === 'completed' ? 'Download' : 'Generating...'}
                    </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>

      {/* Tapid Connect Center */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Connect Center</h2>
          <p className={styles.sectionDescription}>
            Schedule automated recurring reports for your team • 
            Set up ongoing performance monitoring and insights delivery
          </p>
        </div>
        
        {scheduledReports.length > 0 ? (
          // Show existing scheduled reports
          <div className={styles.scheduledReportsList}>
            {scheduledReports.map((report) => (
              <div key={report.id} className={styles.scheduledReportCard}>
                <div className={styles.scheduledReportContent}>
                  <div className={styles.scheduledReportIcon}>
                    <Mail size={24} />
                  </div>
                  <div className={styles.scheduledReportInfo}>
                    <h4>Recurring {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)} Reports</h4>
                    <p>Delivered to: {report.recipients.join(', ')}</p>
                    <span className={styles.scheduledSince}>Active since {new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.scheduledReportActions}>
                    <button 
                      className={styles.editReportButton}
                      onClick={() => {
                        // Pre-fill form with existing data
                        setConnectForm({
                          frequency: report.frequency,
                          recipients: report.recipients,
                          sendToMe: report.recipients.includes('user@company.com'), // Mock user email check
                          dataScope: report.dataScope || {
                            campaignOverview: true,
                            boosterPerformance: false,
                            customerSegments: false,
                            averageSpend: false,
                            redemptionFunnel: false,
                            locationStats: false
                          }
                        });
                        setShowConnectModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button 
                      className={styles.deleteReportButton}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this recurring report setup?')) {
                          setScheduledReports(prev => prev.filter(r => r.id !== report.id));
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button 
              className={styles.addNewReportButton}
              onClick={() => setShowConnectModal(true)}
            >
              <Calendar size={18} />
              Add New Recurring Report
            </button>
          </div>
        ) : (
          // Show setup card when no reports exist
          <div className={styles.connectCenterCard}>
            <div className={styles.connectCenterContent}>
              <div className={styles.connectCenterIcon}>
                <Mail size={32} />
              </div>
              <div className={styles.connectCenterText}>
                <h3>Automated Report Delivery</h3>
                <p>Set up recurring reports to be automatically generated and emailed to your team on a schedule you choose.</p>
              </div>
              <button 
                className={styles.connectCenterButton}
                onClick={() => setShowConnectModal(true)}
              >
                <Calendar size={18} />
                Set Up Recurring Reports
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Connect Center Modal */}
        {showConnectModal && ReactDOM.createPortal(
        (
        <div className={connectedModalStyles.modalOverlay} onClick={() => setShowConnectModal(false)}>
          <div className={`${connectedModalStyles.modalContent} ${connectedModalStyles.modalContentWide}`} onClick={(e) => e.stopPropagation()}>
            <button className={connectedModalStyles.closeButton} onClick={() => setShowConnectModal(false)}>
              <X size={22} />
            </button>
            <div className={connectedModalStyles.modalHeaderCentered}>
              <h2>Set Up Recurring Reports</h2>
              <p>Configure automated report delivery to keep your team informed</p>
            </div>
            <div className={connectedModalStyles.modalBody}>
              <div className={styles.recurringForm}>
              {/* Frequency Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>Report Frequency</div>
                <div className={styles.frequencyOptions}>
                  <div 
                    className={`${styles.frequencyOption} ${connectForm.frequency === 'weekly' ? styles.selected : ''}`}
                    onClick={() => setConnectForm(f => ({ ...f, frequency: 'weekly' }))}
                  >
                    <div className={styles.frequencyContent}>
                      <div>
                        <div className={styles.frequencyTitle}>Weekly Reports</div>
                        <div className={styles.frequencyDesc}>Every Monday at 9 AM</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`${styles.frequencyOption} ${connectForm.frequency === 'biweekly' ? styles.selected : ''}`}
                    onClick={() => setConnectForm(f => ({ ...f, frequency: 'biweekly' }))}
                  >
                    <div className={styles.frequencyContent}>
                      <div>
                        <div className={styles.frequencyTitle}>Bi-weekly Reports</div>
                        <div className={styles.frequencyDesc}>Every other Monday at 9 AM</div>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`${styles.frequencyOption} ${connectForm.frequency === 'monthly' ? styles.selected : ''}`}
                    onClick={() => setConnectForm(f => ({ ...f, frequency: 'monthly' }))}
                  >
                    <div className={styles.frequencyContent}>
                      <div>
                        <div className={styles.frequencyTitle}>Monthly Reports</div>
                        <div className={styles.frequencyDesc}>First Monday of each month at 9 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recipients Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>Report Recipients</div>
                <div className={styles.recipientSection}>
                  <div className={styles.recipientToggle}>
                    <label>
                      <input
                        type="checkbox"
                        checked={connectForm.sendToMe}
                        onChange={(e) => setConnectForm(f => ({ ...f, sendToMe: e.target.checked }))}
                      />
                      Send to me (auto-fills your email)
                    </label>
                  </div>
                  
                  <div className={styles.recipientInputs}>
                    {connectForm.recipients.map((email, index) => (
                      <div key={index} className={styles.recipientField}>
                        <input
                          type="email"
                          placeholder="Enter email address"
                          value={email}
                          onChange={(e) => {
                            const newRecipients = [...connectForm.recipients];
                            newRecipients[index] = e.target.value;
                            setConnectForm(f => ({ ...f, recipients: newRecipients }));
                          }}
                        />
                        {index > 0 && (
                          <button
                            className={styles.removeRecipient}
                            onClick={() => {
                              const newRecipients = connectForm.recipients.filter((_, i) => i !== index);
                              setConnectForm(f => ({ ...f, recipients: newRecipients }));
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                    </div>
                    ))}
                    
                    {connectForm.recipients.length < 3 && (
                      <button
                        className={styles.addRecipient}
                        onClick={() => {
                          const newRecipients = [...connectForm.recipients, ''];
                          setConnectForm(f => ({ ...f, recipients: newRecipients }));
                        }}
                      >
                        <Mail size={16} />
                        Add Recipient
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Contents Section */}
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>Report Contents</div>
                <div className={styles.dataScopeGrid}>
                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.campaignOverview}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, campaignOverview: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>📈</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Campaign Overview</div>
                        <div className={styles.dataScopeDesc}>Live KPIs: points issued, redemption rate</div>
                      </div>
                    </div>
                  </label>

                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.boosterPerformance}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, boosterPerformance: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>🛠</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Booster Performance</div>
                        <div className={styles.dataScopeDesc}>Flash & recurring booster analytics</div>
                </div>
              </div>
                  </label>

                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.customerSegments}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, customerSegments: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>👥</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Customer Segments</div>
                        <div className={styles.dataScopeDesc}>Breakdown by frequency & spend</div>
        </div>
      </div>
                  </label>

                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.averageSpend}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, averageSpend: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>💰</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Average Spend</div>
                        <div className={styles.dataScopeDesc}>Points per user & transaction data</div>
                  </div>
                    </div>
                  </label>

                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.redemptionFunnel}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, redemptionFunnel: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>📊</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Redemption Funnel</div>
                        <div className={styles.dataScopeDesc}>Earn → eligible → redeemed flow</div>
                      </div>
                    </div>
                  </label>

                  <label className={styles.dataScopeItem}>
                    <input
                      type="checkbox"
                      checked={connectForm.dataScope.locationStats}
                      onChange={(e) => setConnectForm(f => ({ 
                        ...f, 
                        dataScope: { ...f.dataScope, locationStats: e.target.checked }
                      }))}
                    />
                    <div className={styles.dataScopeContent}>
                      <div className={styles.dataScopeIcon}>📍</div>
                      <div>
                        <div className={styles.dataScopeTitle}>Location Stats</div>
                        <div className={styles.dataScopeDesc}>Multi-location performance data</div>
                  </div>
                </div>
                  </label>
                </div>
              </div>

              {/* Schedule Button */}
              <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                  onClick={() => setShowConnectModal(false)}
              >
                Cancel
              </button>
              <button 
                  className={styles.scheduleButton}
                  disabled={!(() => {
                    const hasValidEmails = connectForm.recipients.some(email => email.trim() !== '');
                    const hasDataScope = Object.values(connectForm.dataScope).some(Boolean);
                    const hasFrequency = connectForm.frequency;
                    return hasValidEmails && hasDataScope && hasFrequency;
                  })()}
                  onClick={() => {
                    // Show success message
                    const newReport = {
                      id: Date.now(), // In real app, this would be from server
                      frequency: connectForm.frequency,
                      recipients: connectForm.recipients.filter(email => email.trim() !== ''),
                      createdAt: new Date().toISOString(),
                      dataScope: connectForm.dataScope
                    };
                    
                    setScheduledReports(prev => [...prev, newReport]);
                    alert('Recurring reports have been scheduled successfully!');
                    setShowConnectModal(false);
                    setConnectForm({
                      frequency: 'weekly',
                      recipients: [''],
                      sendToMe: true,
                      dataScope: {
                        campaignOverview: true,
                        boosterPerformance: false,
                        customerSegments: false,
                        averageSpend: false,
                        redemptionFunnel: false,
                        locationStats: false
                      }
                    });
                  }}
                >
                  <Mail size={18} />
                  Schedule Recurring Reports
              </button>
              </div>
              </div>
            </div>
            </div>
          </div>
        ),
        document.body
      )}

      {/* Data Requirement Modal */}
      {showDataRequirementModal && ReactDOM.createPortal(
        (
        <div className={connectedModalStyles.modalOverlay} onClick={() => setShowDataRequirementModal(false)}>
          <div className={connectedModalStyles.modalContent} style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <button className={connectedModalStyles.closeButton} onClick={() => setShowDataRequirementModal(false)}>
              <X size={22} />
            </button>
            <div style={{ color: '#adb5bd', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
              <FileText size={48} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#232428', marginBottom: '0.75rem' }}>
              More Data Required
            </div>
            <div style={{ color: '#888', fontSize: '1.05rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              You need at least <strong>6 months of data</strong> before you can generate detailed reports and insights.
            </div>
            <div style={{ 
              background: '#f3f0ff', 
              border: '1px solid #e5dbff', 
              borderRadius: '0.7rem', 
              padding: '1rem', 
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ fontWeight: 600, color: '#7950f2', marginBottom: '0.5rem' }}>
                What you can do in the meantime:
              </div>
              <ul style={{ 
                color: '#666', 
                fontSize: '0.95rem', 
                margin: 0, 
                paddingLeft: '1.2rem',
                lineHeight: '1.4'
              }}>
                <li>Continue building your customer base</li>
                <li>Run campaigns and boosters to gather data</li>
                <li>Monitor your dashboard for real-time insights</li>
                <li>Set up recurring reports for when data is ready</li>
              </ul>
            </div>
            <button 
              className={styles.primaryButton} 
              style={{ minWidth: 140 }}
              onClick={() => setShowDataRequirementModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
        ),
        document.body
      )}
    </div>
  );
};

export default ReportsPage;