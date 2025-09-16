import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Activity, 
  Bell, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Info,
  Clock,
  Zap,
  Shield,
  Database,
  Server,
  Wifi,
  Plus,
  Send,
  FileText,
  HelpCircle
} from 'lucide-react';
import styles from '../SettingsPage.module.css';

export default function Advanced({
  settings,
  onSettingsChange,
  systemHealthRef,
  supportNotificationsRef,
  contactSupportRef,
}) {
  const [selectedTicketType, setSelectedTicketType] = useState('general');
  const [ticketMessage, setTicketMessage] = useState('');
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Local form state that updates immediately
  const [formData, setFormData] = useState({
    productUpdates: settings.productUpdates !== false,
    maintenanceAlerts: settings.maintenanceAlerts !== false,
    securityAlerts: settings.securityAlerts !== false,
    emailNotifications: settings.emailNotifications !== false
  });

  // Sync with settings when they change from parent
  useEffect(() => {
    setFormData({
      productUpdates: settings.productUpdates !== false,
      maintenanceAlerts: settings.maintenanceAlerts !== false,
      securityAlerts: settings.securityAlerts !== false,
      emailNotifications: settings.emailNotifications !== false
    });
  }, [settings]);

  // Helper function to update both local state and notify parent
  const updateSettings = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (onSettingsChange) {
      onSettingsChange(updates);
    }
  };

  // Mock system health data
  const systemMetrics = {
    uptime: '100%',
    lastIncident: 'None in 180+ days',
    responseTime: '< 50ms',
    dataSync: 'Real-time',
    backupStatus: 'Daily backups active'
  };

  const uptimeData = [
    { period: '30 days', uptime: '100%', incidents: 0 },
    { period: '90 days', uptime: '99.98%', incidents: 1 },
    { period: '1 year', uptime: '99.95%', incidents: 3 }
  ];

  // Mock support notifications
  const supportNotifications = [
    {
      id: 1,
      type: 'announcement',
      title: 'New Feature: Enhanced Analytics Dashboard',
      message: 'We\'ve released an improved analytics dashboard with better insights and reporting capabilities.',
      date: '2025-06-10',
      isRead: false
    },
    {
      id: 2,
      type: 'maintenance',
      title: 'Scheduled Maintenance Complete',
      message: 'Our scheduled maintenance on June 8th has been completed successfully. All systems are running optimally.',
      date: '2025-06-08',
      isRead: true
    },
    {
      id: 3,
      type: 'security',
      title: 'Security Update Applied',
      message: 'We\'ve applied the latest security patches to ensure your data remains protected.',
      date: '2025-06-05',
      isRead: true
    }
  ];

  const ticketTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Bug Report' }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement':
        return <Bell size={16} className={styles.notificationIconAnnouncement} />;
      case 'maintenance':
        return <Settings size={16} className={styles.notificationIconMaintenance} />;
      case 'security':
        return <Shield size={16} className={styles.notificationIconSecurity} />;
      default:
        return <Info size={16} className={styles.notificationIconDefault} />;
    }
  };

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    // In real app, this would submit to your support system
    alert('Support ticket submitted successfully! We\'ll get back to you within 24 hours.');
    setTicketMessage('');
    setShowTicketForm(false);
  };

  const markNotificationAsRead = (id) => {
    // In real app, this would update the notification status
    console.log(`Marking notification ${id} as read`);
  };

  return (
    <div className={styles.sectionContent}>
      <div className={styles.subsection} ref={systemHealthRef}>
        <h3 className={styles.subsectionTitle}>System Health & Performance</h3>
        
        <div className={styles.healthOverview}>
          <div className={styles.healthStatus}>
            <div className={styles.statusIndicator}>
              <CheckCircle size={24} className={styles.statusIconHealthy} />
              <div className={styles.statusText}>
                <h4 className={styles.statusTitle}>All Systems Operational</h4>
                <p className={styles.statusDescription}>Everything is running smoothly</p>
              </div>
            </div>
            <div className={styles.uptimeDisplay}>
              <span className={styles.uptimeValue}>{systemMetrics.uptime}</span>
              <span className={styles.uptimeLabel}>Current Uptime</span>
            </div>
          </div>
        </div>

        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Activity size={20} />
            </div>
            <div className={styles.metricInfo}>
              <div className={styles.metricValue}>{systemMetrics.responseTime}</div>
              <div className={styles.metricLabel}>Response Time</div>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Wifi size={20} />
            </div>
            <div className={styles.metricInfo}>
              <div className={styles.metricValue}>{systemMetrics.dataSync}</div>
              <div className={styles.metricLabel}>Data Sync</div>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Database size={20} />
            </div>
            <div className={styles.metricInfo}>
              <div className={styles.metricValue}>Active</div>
              <div className={styles.metricLabel}>Daily Backups</div>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricIcon}>
              <Server size={20} />
            </div>
            <div className={styles.metricInfo}>
              <div className={styles.metricValue}>{systemMetrics.lastIncident}</div>
              <div className={styles.metricLabel}>Last Incident</div>
            </div>
          </div>
        </div>

        <div className={styles.uptimeHistory}>
          <h4 className={styles.historyTitle}>Uptime History</h4>
          <div className={styles.uptimeTable}>
            {uptimeData.map((period, index) => (
              <div key={index} className={styles.uptimeRow}>
                <span className={styles.uptimePeriod}>{period.period}</span>
                <span className={styles.uptimePercentage}>{period.uptime}</span>
                <span className={styles.uptimeIncidents}>
                  {period.incidents === 0 ? 'No incidents' : `${period.incidents} incident${period.incidents > 1 ? 's' : ''}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.subsection} ref={supportNotificationsRef}>
        <h3 className={styles.subsectionTitle}>Support Notifications</h3>
        
        <div className={styles.notificationsList}>
          {supportNotifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`${styles.notificationItem} ${!notification.isRead ? styles.notificationUnread : ''}`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className={styles.notificationIcon}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className={styles.notificationContent}>
                <div className={styles.notificationHeader}>
                  <h4 className={styles.notificationTitle}>{notification.title}</h4>
                  <span className={styles.notificationDate}>
                    {new Date(notification.date).toLocaleDateString('en-IE', {
                      day: 'numeric',
                      month: 'short'
                    })}
                  </span>
                </div>
                <p className={styles.notificationMessage}>{notification.message}</p>
              </div>
              {!notification.isRead && <div className={styles.unreadDot}></div>}
            </div>
          ))}
        </div>

        <div className={styles.notificationSettings}>
          <h4 className={styles.settingsTitle}>Notification Preferences</h4>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>Product Updates</div>
              <div className={styles.settingDescription}>Get notified about new features and improvements</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.productUpdates}
                onChange={e => updateSettings({ productUpdates: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>Maintenance Alerts</div>
              <div className={styles.settingDescription}>Receive notifications about scheduled maintenance</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.maintenanceAlerts}
                onChange={e => updateSettings({ maintenanceAlerts: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>Security Alerts</div>
              <div className={styles.settingDescription}>Important security updates and patches</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.securityAlerts}
                onChange={e => updateSettings({ securityAlerts: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <div className={styles.settingItem}>
            <div className={styles.settingInfo}>
              <div className={styles.settingTitle}>Email Notifications</div>
              <div className={styles.settingDescription}>Receive notifications via email</div>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={formData.emailNotifications}
                onChange={e => updateSettings({ emailNotifications: e.target.checked })}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.subsection} ref={contactSupportRef}>
        <h3 className={styles.subsectionTitle}>Contact Support</h3>
        
        <div className={styles.supportOptions}>
          <div className={styles.supportOption}>
            <div className={styles.supportOptionIcon}>
              <Mail size={24} />
            </div>
            <div className={styles.supportOptionContent}>
              <h4 className={styles.supportOptionTitle}>Email Support</h4>
              <p className={styles.supportOptionDescription}>
                Get help via email. We typically respond within 24 hours.
              </p>
              <a href="mailto:support@yourdomain.com" className={styles.supportOptionAction}>
                <Mail size={16} />
                support@yourdomain.com
              </a>
            </div>
          </div>

          <div className={styles.supportOption}>
            <div className={styles.supportOptionIcon}>
              <MessageSquare size={24} />
            </div>
            <div className={styles.supportOptionContent}>
              <h4 className={styles.supportOptionTitle}>Submit a Ticket</h4>
              <p className={styles.supportOptionDescription}>
                Create a support ticket for detailed technical assistance.
              </p>
              <button 
                className={styles.supportOptionAction}
                onClick={() => setShowTicketForm(true)}
              >
                <Plus size={16} />
                Create Ticket
              </button>
            </div>
          </div>

          <div className={styles.supportOption}>
            <div className={styles.supportOptionIcon}>
              <FileText size={24} />
            </div>
            <div className={styles.supportOptionContent}>
              <h4 className={styles.supportOptionTitle}>Documentation</h4>
              <p className={styles.supportOptionDescription}>
                Browse our help center and documentation for quick answers.
              </p>
              <a 
                href="https://docs.yourdomain.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.supportOptionAction}
              >
                <ExternalLink size={16} />
                View Docs
              </a>
            </div>
          </div>
        </div>

        <div className={styles.supportInfo}>
          <div className={styles.supportInfoItem}>
            <Clock size={16} />
            <span>Response Time: Within 24 hours</span>
          </div>
          <div className={styles.supportInfoItem}>
            <HelpCircle size={16} />
            <span>Available: Monday - Friday, 9 AM - 6 PM GMT</span>
          </div>
        </div>
      </div>

      {/* Ticket Form Modal */}
      {showTicketForm && (
        <div className={styles.modalOverlay} onClick={() => setShowTicketForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Submit Support Ticket</h3>
              <button
                type="button"
                onClick={() => setShowTicketForm(false)}
                className={styles.closeModal}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleTicketSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Issue Type</label>
                  <select
                    className={styles.select}
                    value={selectedTicketType}
                    onChange={(e) => setSelectedTicketType(e.target.value)}
                    required
                  >
                    {ticketTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Message</label>
                  <textarea
                    className={styles.textarea}
                    rows="6"
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    placeholder="Please describe your issue or question in detail..."
                    required
                  />
                </div>
                <div className={styles.ticketNote}>
                  <Info size={16} />
                  <span>We'll send updates to your registered email address.</span>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowTicketForm(false)}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={!ticketMessage.trim()}
                >
                  <Send size={16} />
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}