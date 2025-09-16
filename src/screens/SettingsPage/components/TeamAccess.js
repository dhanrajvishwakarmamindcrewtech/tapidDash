import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, Crown, User, Shield, AlertCircle } from 'lucide-react';
import styles from '../SettingsPage.module.css';

export default function TeamAccess({
  settings,
  onSettingsChange,
  userManagementRef,
  rolesPermissionsRef,
  currentUser
}) {
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Local form state (for any future editable team settings)
  const [formData, setFormData] = useState({
    teamSettings: settings.teamSettings || {},
    userPreferences: settings.userPreferences || {}
  });

  // Sync with settings when they change from parent
  useEffect(() => {
    setFormData({
      teamSettings: settings.teamSettings || {},
      userPreferences: settings.userPreferences || {}
    });
  }, [settings]);

  // Helper function to update both local state and notify parent
  const updateSettings = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (onSettingsChange) {
      onSettingsChange(updates);
    }
  };

  // Mock user data - in real app this would come from settings or API
  const mockCurrentUser = {
    id: 1,
    name: settings.primaryContact || currentUser?.name || 'Current User',
    email: settings.contactEmail || currentUser?.email || 'user@company.com',
    role: 'Owner',
    status: 'Active',
    avatar: (settings.primaryContact || currentUser?.name || 'U').charAt(0)?.toUpperCase(),
    joinedDate: 'January 2024'
  };

  const handleAddUser = () => {
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Owner':
        return <Crown size={16} className={styles.roleIcon} />;
      case 'Admin':
        return <Shield size={16} className={styles.roleIcon} />;
      default:
        return <User size={16} className={styles.roleIcon} />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Owner':
        return styles.roleOwner;
      case 'Admin':
        return styles.roleAdmin;
      default:
        return styles.roleUser;
    }
  };

  return (
    <>
      <div className={styles.sectionContent}>
        <div className={styles.subsection} ref={userManagementRef}>
          <h3 className={styles.subsectionTitle}>User Management</h3>
          
          <div className={styles.teamHeader}>
            <div className={styles.teamStats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>1</span>
                <span className={styles.statLabel}>Team Member</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>1</span>
                <span className={styles.statLabel}>Available Seat</span>
              </div>
            </div>
            
            <div className={styles.actionRow}>
              <button 
                className={styles.primaryButton}
                onClick={handleAddUser}
              >
                <Plus size={16} />
                Invite User
              </button>
            </div>
          </div>

          <div className={styles.userList}>
            <div className={styles.userItem}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {mockCurrentUser.avatar}
                </div>
                <div className={styles.userDetails}>
                  <div className={styles.userName}>{mockCurrentUser.name}</div>
                  <div className={styles.userEmail}>{mockCurrentUser.email}</div>
                  <div className={styles.userMeta}>
                    Joined {mockCurrentUser.joinedDate}
                  </div>
                </div>
              </div>
              
              <div className={styles.userRoleContainer}>
                <div className={`${styles.userRole} ${getRoleColor(mockCurrentUser.role)}`}>
                  {getRoleIcon(mockCurrentUser.role)}
                  {mockCurrentUser.role}
                </div>
              </div>
              
              <div className={styles.userStatus}>
                <span className={styles.statusDot}></span>
                {mockCurrentUser.status}
              </div>
              
              <div className={styles.userActions}>
                <button 
                  className={styles.iconButton}
                  title="Edit user"
                  disabled
                >
                  <Edit3 size={16} />
                </button>
                <button 
                  className={styles.iconButton}
                  title="Cannot remove owner"
                  disabled
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={styles.emptyState}>
            <Users size={48} className={styles.emptyStateIcon} />
            <h4 className={styles.emptyStateTitle}>Ready to grow your team?</h4>
            <p className={styles.emptyStateDescription}>
              Invite team members to collaborate on your restaurant management. 
              Each member can have different roles and permissions.
            </p>
          </div>
        </div>

        <div className={styles.subsection} ref={rolesPermissionsRef}>
          <h3 className={styles.subsectionTitle}>Roles & Permissions</h3>
          
          <div className={styles.rolesGrid}>
            <div className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <Crown size={20} className={styles.roleCardIcon} />
                <h4 className={styles.roleTitle}>Owner</h4>
                <span className={styles.roleBadge}>You</span>
              </div>
              <p className={styles.roleDescription}>
                Complete access to all features, settings, and billing. Can manage all team members and permissions.
              </p>
              <div className={styles.rolePermissions}>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Full system access
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Billing & subscription management
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Team member management
                </div>
              </div>
            </div>

            <div className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <Shield size={20} className={styles.roleCardIcon} />
                <h4 className={styles.roleTitle}>Admin</h4>
                <span className={styles.roleCount}>0 members</span>
              </div>
              <p className={styles.roleDescription}>
                Access to most features and settings. Can manage daily operations but cannot access billing or remove the owner.
              </p>
              <div className={styles.rolePermissions}>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Manage restaurant settings
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  View reports & analytics
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Manage some team members
                </div>
              </div>
            </div>

            <div className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <User size={20} className={styles.roleCardIcon} />
                <h4 className={styles.roleTitle}>Staff</h4>
                <span className={styles.roleCount}>0 members</span>
              </div>
              <p className={styles.roleDescription}>
                Limited access to essential features needed for daily operations. Perfect for front-of-house and kitchen staff.
              </p>
              <div className={styles.rolePermissions}>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  View basic information
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Update operational status
                </div>
                <div className={styles.permissionItem}>
                  <span className={styles.permissionDot}></span>
                  Limited reporting access
                </div>
              </div>
            </div>
          </div>

          <div className={styles.permissionsNote}>
            <AlertCircle size={16} />
            <span>Role permissions can be customized after inviting team members. Contact support for advanced permission configurations.</span>
          </div>
        </div>
      </div>

      {/* Snackbar */}
      {showSnackbar && (
        <div className={styles.snackbar}>
          <div className={styles.snackbarContent}>
            <AlertCircle size={16} />
            <span>You have maxed out your seats at the moment. More coming soon!</span>
          </div>
        </div>
      )}
    </>
  );
}