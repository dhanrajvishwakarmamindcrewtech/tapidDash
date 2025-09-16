import React, { useState, useEffect } from 'react';
import styles from './BoosterPage.module.css';
import { Plus, Lock, X, RefreshCw, Loader } from 'lucide-react';
import { useToast } from '../../components/ToastSystem';
import safeStorage from '../../utils/safeStorage';

const TABS = [
  { key: 'flash', label: 'Flash', locked: false },
  { key: 'recurring', label: 'Recurring', locked: true },
  { key: 'targeted', label: 'Targeted', comingSoon: true, locked: true },
];

const mockBoosters = {
  flash: [
    {
      name: 'Weekend Double Points',
      type: 'Flash',
      status: 'Active',
      start: '2024-06-15',
      end: '2024-06-16',
      duration: '1',
      summary: '+2x points on all purchases',
      stats: { users: 42, points: 3200 },
    },
  ],
  recurring: [
    {
      name: 'Tuesday Bonus',
      type: 'Recurring',
      status: 'Paused',
      day: 'Tuesday',
      time: '12:00-15:00',
      summary: '+50 pts for €5+ spend',
      stats: { users: 18, points: 900 },
    },
  ],
  targeted: [],
};

const getStoredBoosters = () => {
  const result = safeStorage.getItem('boosters', mockBoosters);
  if (!result.success) {
    console.error('Error loading boosters:', result.error);
    return mockBoosters;
  }
  return result.data || mockBoosters;
};

const BoosterPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('flash');
  const [hasActiveCampaign, setHasActiveCampaign] = useState(false);
  const [boosters, setBoosters] = useState(getStoredBoosters());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', threshold: '', start: '', duration: '1', end: '', day: '', time: '', nudge: false, flashType: 'multiplier', multiplier: '2', airdrop: '' });

  const [showInfo, setShowInfo] = useState(true);
  const [showTargetedModal, setShowTargetedModal] = useState(false);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check for active campaign using safeStorage
        const campaignResult = safeStorage.getItem('launchpad_campaign', null);
        
        if (!campaignResult.success) {
          console.error('Error loading campaign:', campaignResult.error);
          toast.storageError(campaignResult.error);
          setHasActiveCampaign(false);
        } else if (campaignResult.data) {
          // Check if campaign exists and has rewards (indicating it's set up)
          const hasValidCampaign = campaignResult.data && 
            campaignResult.data.rewards && 
            Object.keys(campaignResult.data.rewards).length > 0;
          setHasActiveCampaign(hasValidCampaign);
        } else {
          setHasActiveCampaign(false);
        }
      } catch (error) {
        console.error('Error in loadData:', error);
        toast.error('Failed to Load Data', 'There was an error loading your data. Please refresh the page.');
        setHasActiveCampaign(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);

  // Persist boosters to localStorage with error handling
  const saveBoosters = async (next) => {
    try {
      setIsSaving(true);
      setBoosters(next);
      
      const result = safeStorage.setItem('boosters', next);
      if (!result.success) {
        console.error('Error saving boosters:', result.error);
        toast.storageError(result.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in saveBoosters:', error);
      toast.error('Save Failed', 'There was an error saving your boosters. Please try again.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenModal = () => {
    setForm({ name: '', threshold: '', start: '', duration: '1', end: '', day: '', time: '', nudge: false, flashType: 'multiplier', multiplier: '2', airdrop: '' });
    setShowInfo(true);
    setShowModal(true);
  };
  const handleCloseModal = () => setShowModal(false);
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  // Calculate end time for flash booster
  const getFlashEnd = () => {
    if (!form.start || !form.duration) return '';
    const startDate = new Date(form.start + 'T00:00:00');
    const endDate = new Date(startDate.getTime() + parseInt(form.duration, 10) * 60 * 60 * 1000);
    return endDate.toISOString().slice(0, 16).replace('T', ' ');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      toast.warning('Validation Error', 'Please enter a booster name.');
      return;
    }
    
    if (activeTab === 'flash' && (!form.start || !form.duration)) {
      toast.warning('Validation Error', 'Please set a start date and duration for flash boosters.');
      return;
    }
    
    if (activeTab === 'recurring' && (!form.day || !form.time)) {
      toast.warning('Validation Error', 'Please select a day and time for recurring boosters.');
      return;
    }
    
    try {
      setIsCreating(true);
      
      let summary = '';
      if (activeTab === 'flash') {
        if (form.flashType === 'multiplier') {
          summary = `${form.multiplier}x points on all purchases`;
        } else {
          summary = `Airdrop: +${form.airdrop} pts for a transaction in window`;
        }
      } else {
        summary = `+${form.bonus} pts${form.threshold ? ` for €${form.threshold}+ spend` : ''}`;
      }
      
      const newBooster =
        activeTab === 'flash'
          ? {
              name: form.name,
              type: 'Flash',
              status: 'Active',
              start: form.start,
              end: getFlashEnd(),
              duration: form.duration,
              flashType: form.flashType,
              multiplier: form.multiplier,
              airdrop: form.airdrop,
              summary,
              stats: { users: 0, points: 0 },
              createdAt: new Date().toISOString(),
            }
          : activeTab === 'recurring'
          ? {
              name: form.name,
              type: 'Recurring',
              status: 'Active',
              day: form.day,
              time: form.time,
              bonus: form.bonus,
              threshold: form.threshold,
              summary,
              stats: { users: 0, points: 0 },
              createdAt: new Date().toISOString(),
            }
          : null;
          
      if (newBooster) {
        const next = { ...boosters, [activeTab]: [newBooster, ...boosters[activeTab]] };
        const success = await saveBoosters(next);
        
        if (success) {
          toast.success('Booster Created', `${newBooster.name} has been created successfully!`);
          setShowModal(false);
          
          // Reset form
          setForm({ 
            name: '', threshold: '', start: '', duration: '1', end: '', 
            day: '', time: '', nudge: false, flashType: 'multiplier', 
            multiplier: '2', airdrop: '' 
          });
        }
      }
    } catch (error) {
      console.error('Error creating booster:', error);
      toast.error('Creation Failed', 'There was an error creating your booster. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  // Toggle pause/play booster
  const handleTogglePause = async (tab, idx) => {
    try {
      const next = { ...boosters };
      const booster = next[tab][idx];
      const newStatus = booster.status === 'Active' ? 'Paused' : 'Active';
      booster.status = newStatus;
      
      const success = await saveBoosters(next);
      if (success) {
        toast.success(
          `Booster ${newStatus}`, 
          `${booster.name} has been ${newStatus.toLowerCase()}.`
        );
      }
    } catch (error) {
      console.error('Error toggling booster:', error);
      toast.error('Update Failed', 'There was an error updating the booster status.');
    }
  };

  // Show delete confirmation modal
  const handleShowDeleteModal = (tab, idx) => {
    setDeleteTarget({ tab, idx });
    setShowDeleteModal(true);
  };

  // Confirm delete booster
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      setIsDeleting(true);
      const boosterName = boosters[deleteTarget.tab][deleteTarget.idx]?.name;
      const next = { 
        ...boosters, 
        [deleteTarget.tab]: boosters[deleteTarget.tab].filter((_, i) => i !== deleteTarget.idx) 
      };
      
      const success = await saveBoosters(next);
      if (success) {
        toast.success('Booster Deleted', `${boosterName} has been deleted successfully.`);
      }
    } catch (error) {
      console.error('Error deleting booster:', error);
      toast.error('Delete Failed', 'There was an error deleting the booster. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };



  // Helper: render booster cards or empty state
  const renderBoosterGrid = () => {
    const list = boosters[activeTab] || [];
    if (list.length === 0) {
      return (
        <div className={styles.boosterCard} style={{ textAlign: 'center', color: '#888', fontWeight: 500, fontSize: '1.08rem', minHeight: 140 }}>
          {activeTab === 'flash' && 'No Flash Boosters yet.'}
          {activeTab === 'recurring' && 'No Recurring Boosters yet.'}
          {activeTab === 'targeted' && (
            <>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Coming soon – Target loyalty boosters by spend, frequency, and behavior.</div>
              <span className={styles.comingSoonTag}>Coming Soon</span>
            </>
          )}
        </div>
      );
    }
    // Booster card design
    return list.map((booster, i) => (
      <div key={i} className={styles.boosterCard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: '1.13rem', color: '#232428' }}>{booster.name}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ background: booster.status === 'Active' ? 'linear-gradient(90deg, #51cf66 60%, #38d9a9 100%)' : 'linear-gradient(90deg, #adb5bd 60%, #868e96 100%)', color: '#fff', fontWeight: 700, fontSize: '0.82rem', borderRadius: 999, padding: '2px 12px' }}>{booster.status}</span>
          {booster.type === 'Flash' && <span style={{ color: '#888', fontSize: '0.97rem' }}>{booster.start} – {booster.end}</span>}
          {booster.type === 'Recurring' && <span style={{ color: '#888', fontSize: '0.97rem' }}>{booster.day} {booster.time}</span>}
        </div>
        <div style={{ color: '#7950f2', fontWeight: 500, fontSize: '1.01rem', marginBottom: 8 }}>{booster.summary}</div>
        <div style={{ color: '#888', fontSize: '0.97rem', marginBottom: 10 }}>Users impacted: <b>{booster.stats.users}</b> &nbsp;|&nbsp; Points given: <b>{booster.stats.points}</b></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button className={styles.primaryButton} style={{ minWidth: 90, fontSize: '0.98rem', padding: '0.5rem 1.2rem' }} onClick={() => handleTogglePause(activeTab, i)}>
            {booster.status === 'Active' ? 'Pause' : 'Play'}
          </button>
          <button className={styles.primaryButton} style={{ minWidth: 90, fontSize: '0.98rem', padding: '0.5rem 1.2rem', background: '#fff0f0', color: '#e03131' }} onClick={() => handleShowDeleteModal(activeTab, i)}>Delete</button>
        </div>
      </div>
    ));
  };

  // Auto-generate sample booster
  function handleAutoGen() {
    const isMultiplier = Math.random() > 0.5;
    setForm(f => ({
      ...f,
      name: isMultiplier ? 'Double Points Happy Hour' : 'Lunchtime Airdrop',
      flashType: isMultiplier ? 'multiplier' : 'airdrop',
      multiplier: isMultiplier ? (['2','3','4'][Math.floor(Math.random()*3)]) : '2',
      airdrop: isMultiplier ? '' : '100',
      start: new Date().toISOString().slice(0,10),
      duration: '2',
      day: '',
      time: '',
      threshold: '',
      nudge: false
    }));
  }

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.container}>
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Boosters</span>
            </div>
            <div className={styles.greetingPill}>Loading...</div>
          </div>
          <div className={styles.lastUpdated}>
            <Loader size={14} className="spin" />
            <span>Loading boosters...</span>
          </div>
        </div>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1rem',
        opacity: 0.6 
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} className={styles.boosterCard} style={{ 
            background: '#f8f9fa', 
            minHeight: 140,
            animation: 'pulse 1.5s ease-in-out infinite' 
          }}>
            <div style={{ 
              width: '60%', 
              height: '1rem', 
              background: '#e9ecef', 
              borderRadius: 4, 
              marginBottom: 8 
            }} />
            <div style={{ 
              width: '40%', 
              height: '0.8rem', 
              background: '#e9ecef', 
              borderRadius: 4, 
              marginBottom: 8 
            }} />
            <div style={{ 
              width: '80%', 
              height: '0.8rem', 
              background: '#e9ecef', 
              borderRadius: 4 
            }} />
          </div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!hasActiveCampaign) {
    return (
      <div className={styles.container}>
        <div className={styles.welcomeHeader}>
          <div className={styles.welcomeContent}>
            <div className={styles.greetingSection}>
              <div className={styles.greetingRow}>
                <span className={styles.greetingMain}>Boosters</span>
              </div>
              <div className={styles.greetingPill}>Flash, Recurring & Targeted Promotions</div>
            </div>
            <div className={styles.lastUpdated}>
              <RefreshCw size={14} />
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><Lock size={48} /></div>
          <div className={styles.emptyTitle}>You’ll need a live campaign to launch Boosters.</div>
          <div className={styles.emptyDesc}>Create your primary points program first in Launchpad.</div>
          <a href="/control-center" className={styles.primaryButton} style={{ marginTop: 24, minWidth: 180, textAlign: 'center' }}>Go to Launchpad</a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Boosters</span>
            </div>
            <div className={styles.greetingPill}>Flash, Recurring & Targeted Promotions</div>
          </div>
          <div className={styles.lastUpdated}>
            <RefreshCw size={14} />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
      {/* My Boosters Section Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, marginBottom: '2.2rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#232428', textAlign: 'left', whiteSpace: 'nowrap' }}>My Boosters</div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0 }}>
            <div className={styles.tabsRow} style={{ marginBottom: 0 }}>
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={
                    activeTab === tab.key
                      ? `${styles.tab} ${styles.active}`
                      : styles.tab
                  }
                  onClick={() => {
                    if (tab.comingSoon) {
                      setShowTargetedModal(true);
                    } else {
                      setActiveTab(tab.key);
                    }
                  }}
                  type="button"
                  style={tab.comingSoon ? { opacity: 0.5, cursor: 'pointer' } : {}}
                >
                  {tab.label}
                  {tab.comingSoon && <span className={styles.comingSoonTag}>Coming Soon</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          className={styles.primaryButton}
          style={{ minWidth: 180, fontWeight: 600, fontSize: '1.08rem', display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={() => {
            if (activeTab === 'targeted') return;
            const currentTab = TABS.find(tab => tab.key === activeTab);
            if (currentTab?.locked) {
              setShowLockedModal(true);
            } else {
              handleOpenModal();
            }
          }}
          disabled={isSaving}
        >
          {(() => {
            const currentTab = TABS.find(tab => tab.key === activeTab);
            if (isSaving) {
              return (
                <>
                  <Loader size={22} className="spin" /> Saving...
                </>
              );
            }
            return currentTab?.locked;
          })() ? (
            <>
              <Lock size={22} /> Locked
            </>
          ) : (
            <>
              <Plus size={22} /> Create {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Booster
            </>
          )}
        </button>
      </div>
      <div className={styles.boosterGrid}>
        {renderBoosterGrid()}
      </div>
      {/* Locked Booster Modal */}
      {showLockedModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ minWidth: 380, maxWidth: 440, textAlign: 'center' }}>
            <button className={styles.modalClose} onClick={() => setShowLockedModal(false)}><X size={22} /></button>
            <div style={{ color: '#adb5bd', marginBottom: '1rem' }}>
              <Lock size={48} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#232428', marginBottom: '0.5rem' }}>
              {activeTab === 'flash' ? 'Flash Boosters' : 'Recurring Boosters'} Locked
            </div>
            <div style={{ color: '#888', fontSize: '1.01rem', marginBottom: '1rem' }}>
              You need minimum of 50 purchases before you unlock this
            </div>
            <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 18 }}>
              Keep growing your customer base to unlock more booster types
            </div>
            <button className={styles.primaryButton} style={{ minWidth: 120 }} onClick={() => setShowLockedModal(false)}>OK</button>
          </div>
        </div>
      )}
      {/* Booster Performance Section */}
      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#232428', margin: '0 0 1.2rem 0', textAlign: 'left', paddingBottom: '0.0rem' }}>My Booster Performance</div>
      {activeTab === 'recurring' ? (
        <div className={styles.analyticsGrid4}>
          {/* Recurring Boosters Run */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Recurring Boosters Run</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                Track how many scheduled boosters you’ve launched for ongoing engagement.
              </div>
              <div className={styles.cardDesc}>Number of recurring boosters launched to date.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{boosters.recurring.length}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  {boosters.recurring.length > 0 ? `Last: ${boosters.recurring[0].name}` : 'No recurring boosters yet.'}
                </div>
                <div style={{ color: '#51cf66', fontWeight: 600, fontSize: '0.97rem', marginTop: 4 }}>
                  ↑ +1 this week
                </div>
              </div>
            </div>
          </div>
          {/* Avg. Users per Recurring Booster */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Avg. Users per Recurring Booster</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                Shows the average number of users impacted by each recurring booster.
              </div>
              <div className={styles.cardDesc}>User reach per recurring booster.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{boosters.recurring.length ? Math.round(boosters.recurring.reduce((sum, b) => sum + (b.stats?.users || 0), 0) / boosters.recurring.length) : 0}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Total users: <b>{boosters.recurring.reduce((sum, b) => sum + (b.stats?.users || 0), 0)}</b>
                </div>
              </div>
            </div>
          </div>
          {/* Points per Recurring Booster */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Points per Recurring Booster</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                Average points awarded per recurring booster event.
              </div>
              <div className={styles.cardDesc}>Points distributed per recurring booster.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{boosters.recurring.length ? Math.round(boosters.recurring.reduce((sum, b) => sum + (b.stats?.points || 0), 0) / boosters.recurring.length) : 0}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Total points: <b>{boosters.recurring.reduce((sum, b) => sum + (b.stats?.points || 0), 0)}</b>
                </div>
              </div>
            </div>
          </div>
          {/* Most Engaged Day */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Most Engaged Day</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                The day of the week with the highest recurring booster participation.
              </div>
              <div className={styles.cardDesc}>Best day for recurring engagement.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{(() => {
                  if (!boosters.recurring.length) return '—';
                  const dayCounts = {};
                  boosters.recurring.forEach(b => {
                    if (b.day) dayCounts[b.day] = (dayCounts[b.day] || 0) + (b.stats?.users || 0);
                  });
                  const best = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0];
                  return best ? `${best[0]} (${best[1]} users)` : '—';
                })()}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Based on total users impacted by day.
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.analyticsGrid4}>
          {/* Total Boosters Run */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Total Boosters Run</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                Tip: Use a mix of Flash and Recurring boosters to keep engagement high throughout the month.
              </div>
              <div className={styles.cardDesc}>Number of boosters launched to date.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{boosters.flash.length + boosters.recurring.length}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Flash: <b>{boosters.flash.length}</b> (short, high-impact) &nbsp;|&nbsp; Recurring: <b>{boosters.recurring.length}</b> (scheduled, repeat)
                </div>
                <div style={{ color: '#51cf66', fontWeight: 600, fontSize: '0.97rem', marginTop: 4 }}>
                  ↑ +1 this week — keep launching to boost results!
                </div>
              </div>
            </div>
          </div>
          {/* Users Impacted */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Users Impacted</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                This shows how many unique customers have benefited from your boosters. Higher is better!
              </div>
              <div className={styles.cardDesc}>Unique users who received a booster reward.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{[...boosters.flash, ...boosters.recurring].reduce((sum, b) => sum + (b.stats?.users || 0), 0)}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Flash: <b>{boosters.flash.reduce((sum, b) => sum + (b.stats?.users || 0), 0)}</b> (quick spikes) &nbsp;|&nbsp; Recurring: <b>{boosters.recurring.reduce((sum, b) => sum + (b.stats?.users || 0), 0)}</b> (steady growth)
                </div>
                <div style={{ color: '#51cf66', fontWeight: 600, fontSize: '0.97rem', marginTop: 4 }}>
                  ↑ +8 vs. last week — great job growing engagement!
                </div>
              </div>
            </div>
          </div>
          {/* Points Awarded */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Points Awarded</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                Points awarded = more reasons for customers to return and redeem. Track this to measure program generosity.
              </div>
              <div className={styles.cardDesc}>Total points given out via boosters.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{[...boosters.flash, ...boosters.recurring].reduce((sum, b) => sum + (b.stats?.points || 0), 0)}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  Flash: <b>{boosters.flash.reduce((sum, b) => sum + (b.stats?.points || 0), 0)}</b> (burst rewards) &nbsp;|&nbsp; Recurring: <b>{boosters.recurring.reduce((sum, b) => sum + (b.stats?.points || 0), 0)}</b> (ongoing rewards)
                </div>
                <div style={{ color: '#51cf66', fontWeight: 600, fontSize: '0.97rem', marginTop: 4 }}>
                  ↑ +1200 pts this week — keep rewarding loyalty!
                </div>
              </div>
            </div>
          </div>
          {/* Most Popular Booster */}
          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCardContent}>
              <div className={styles.cardHeader}>Most Popular Booster</div>
              <div style={{ color: '#aaa', fontSize: '0.97rem', marginBottom: 6, marginTop: -2 }}>
                This is your most effective booster so far. Try duplicating or scheduling similar boosters to maximize results.
              </div>
              <div className={styles.cardDesc}>Booster with the highest user impact.</div>
            </div>
            <div className={styles.analyticsCardFooter}>
              <div className={styles.analyticsValueCard}>
                <span className={styles.analyticsValue}>{(() => {
                  const all = [...boosters.flash, ...boosters.recurring];
                  if (!all.length) return '—';
                  const top = all.reduce((a, b) => (b.stats?.users || 0) > (a.stats?.users || 0) ? b : a, all[0]);
                  return top.name;
                })()}</span>
                <div style={{ color: '#888', fontSize: '0.98rem', marginTop: 6 }}>
                  {(() => {
                    const all = [...boosters.flash, ...boosters.recurring];
                    if (!all.length) return '';
                    const top = all.reduce((a, b) => (b.stats?.users || 0) > (a.stats?.users || 0) ? b : a, all[0]);
                    return `Type: ${top.type} | Users: ${top.stats?.users || 0}`;
                  })()}
                </div>
                <div style={{ color: '#7950f2', fontWeight: 600, fontSize: '0.97rem', marginTop: 4 }}>
                  {(() => {
                    const all = [...boosters.flash, ...boosters.recurring];
                    if (!all.length) return '';
                    const top = all.reduce((a, b) => (b.stats?.users || 0) > (a.stats?.users || 0) ? b : a, all[0]);
                    return `Peak: ${top.stats?.users || 0} users`;
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create Booster Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ minWidth: 640, maxWidth: 760 }}>
            {showInfo && (
              <div style={{
                background: '#fff',
                border: '1.5px solid #7950f2',
                color: '#232428',
                borderRadius: 10,
                padding: '1rem 1.2rem',
                marginBottom: 18,
                display: 'block',
                boxShadow: '0 2px 12px 0 rgba(80,60,180,0.06)',
                position: 'relative',
              }}>
                <div style={{ fontWeight: 700, color: '#7950f2', fontSize: '1.1rem', marginBottom: 6 }}>Booster Types</div>
                <div style={{ fontSize: '1.01rem', color: '#444', marginBottom: 2 }}>
                  <b>Airdrop</b>: If a customer makes a transaction during the window, they receive a fixed bonus amount of points (e.g. +100 pts).
                </div>
                <div style={{ fontSize: '1.01rem', color: '#444' }}>
                  <b>Multiplier</b>: All points earned from purchases during the window are multiplied (e.g. 2x, 3x, 4x points).
                </div>
                <button onClick={() => setShowInfo(false)} style={{ background: 'none', border: 'none', color: '#7950f2', fontWeight: 700, fontSize: 18, cursor: 'pointer', position: 'absolute', top: 10, right: 12, lineHeight: 1 }} title="Dismiss">×</button>
              </div>
            )}
            {/* Modal Title Row with Auto-generate and Create button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0.7rem 0 1.2rem 0', gap: 16 }}>
              <div style={{ fontWeight: 700, fontSize: '1.18rem' }}>
                {activeTab === 'flash' ? 'Create Flash Booster' : activeTab === 'recurring' ? 'Create Recurring Booster' : 'Create Booster'}
              </div>
              <button type="button" onClick={handleAutoGen} style={{ background: '#f3f0ff', color: '#7950f2', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', marginLeft: 8 }}>Auto-generate sample</button>
            </div>
            <button className={styles.modalClose} onClick={handleCloseModal}><X size={22} /></button>
            {activeTab === 'targeted' ? (
              <div style={{ color: '#888', fontWeight: 500, fontSize: '1.05rem', marginBottom: 18 }}>
                Targeted boosters are coming soon! You’ll be able to send bonuses to specific cohorts.<br /><br />
                <span className={styles.comingSoonTag}>Coming Soon</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off">
                <div className={styles.formGroup}>
                  <label>Booster Name</label>
                  <input
                    name="name"
                    type="text"
                    placeholder={activeTab === 'flash' ? 'e.g. Weekend Double Points' : 'e.g. Tuesday Bonus'}
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Spend Threshold <span className={styles.optional}>(Optional)</span></label>
                  <input
                    name="threshold"
                    type="number"
                    placeholder="e.g. 5 (for €5 min spend)"
                    value={form.threshold}
                    onChange={handleChange}
                  />
                </div>
                {activeTab === 'flash' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Booster Type</label>
                      <select name="flashType" value={form.flashType} onChange={handleChange}>
                        <option value="multiplier">Multiplier (2x, 3x, 4x points)</option>
                        <option value="airdrop">Airdrop (fixed bonus points)</option>
                      </select>
                    </div>
                    {form.flashType === 'multiplier' && (
                      <div className={styles.formGroup}>
                        <label>Multiplier</label>
                        <select name="multiplier" value={form.multiplier} onChange={handleChange}>
                          <option value="2">2x</option>
                          <option value="3">3x</option>
                          <option value="4">4x</option>
                        </select>
                      </div>
                    )}
                    {form.flashType === 'airdrop' && (
                      <div className={styles.formGroup}>
                        <label>Bonus Points (Airdrop)</label>
                                                  <input
                            name="airdrop"
                            type="number"
                            placeholder="e.g. 100"
                            value={form.airdrop}
                            onChange={handleChange}
                          />
                      </div>
                    )}
                    <div className={styles.formGroup}>
                      <label>Start Date</label>
                                              <input
                          name="start"
                          type="date"
                          value={form.start}
                          onChange={handleChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Duration (hours)</label>
                                              <select name="duration" value={form.duration} onChange={handleChange}>
                        {[1,2,3,4,5].map(h => <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>)}
                      </select>
                    </div>
                    {form.start && form.duration && (
                      <div className={styles.formGroup}>
                        <label>End Time</label>
                        <input type="text" value={getFlashEnd()} readOnly style={{ background: '#f4f6f8', color: '#888' }} />
                      </div>
                    )}
                  </>
                )}
                {activeTab === 'recurring' && (
                  <>
                    <div className={styles.formGroup}>
                      <label>Day of Week</label>
                                              <select name="day" value={form.day} onChange={handleChange}>
                        <option value="">Select day</option>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Time Range</label>
                                              <input
                          name="time"
                          type="text"
                          placeholder="e.g. 12:00-15:00"
                          value={form.time}
                          onChange={handleChange}
                        />
                    </div>
                  </>
                )}
                <div className={styles.formGroupRow}>
                  <label htmlFor="nudge">Send Nudge Notification</label>
                  <input
                    id="nudge"
                    name="nudge"
                    type="checkbox"
                    checked={form.nudge}
                    onChange={handleChange}
                    style={{ transform: 'scale(1.2)', marginLeft: 8 }}
                  />
                </div>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  style={{ width: '100%', marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  disabled={activeTab === 'targeted' || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader size={20} className="spin" />
                      Creating Booster...
                    </>
                  ) : (
                    `Create ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Booster`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Targeted Coming Soon Modal */}
      {showTargetedModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ minWidth: 380, maxWidth: 440, textAlign: 'center' }}>
            <button className={styles.modalClose} onClick={() => setShowTargetedModal(false)}><X size={22} /></button>
            <div style={{ fontWeight: 700, fontSize: '1.18rem', margin: '1.2rem 0 1.2rem 0', color: '#7950f2' }}>
              Targeted boosters are coming soon!
            </div>
            <div style={{ color: '#888', fontSize: '1.05rem', marginBottom: 18 }}>
              You’ll soon be able to send bonuses to specific customer cohorts based on spend, frequency, and behavior.<br /><br />
              <span className={styles.comingSoonTag}>Coming Soon</span>
            </div>
            <button className={styles.primaryButton} style={{ minWidth: 120 }} onClick={() => setShowTargetedModal(false)}>OK</button>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ minWidth: 380, maxWidth: 440, textAlign: 'center' }}>
            <button className={styles.modalClose} onClick={handleCancelDelete}><X size={22} /></button>
            <div style={{ color: '#adb5bd', marginBottom: '1rem' }}>
              <X size={48} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#232428', marginBottom: '0.5rem' }}>
              Delete Booster
            </div>
            <div style={{ color: '#888', fontSize: '1.01rem', marginBottom: '1rem' }}>
              Are you sure you want to delete this booster? This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button 
                className={styles.primaryButton} 
                style={{ 
                  minWidth: 120, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8 
                }} 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
              <button 
                className={styles.primaryButton} 
                style={{ minWidth: 120, background: '#f4f6f8', color: '#7950f2' }} 
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoosterPage; 