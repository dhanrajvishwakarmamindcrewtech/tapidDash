import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Gift, 
  DollarSign,
  Clock,
  Plus,
  UserPlus,
  Award,
  X,
  Check,
  AlertCircle,
  Filter,
  Calendar,
  TrendingUp,
  Pause,
  Trash2,
  Copy,
  QrCode,
  Download,
  Share2,
  Play,
  MoreVertical,
  Rocket,
  ExternalLink,
  Loader
} from 'lucide-react';
import styles from './ReferralPage.module.css';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/ToastSystem';
import safeStorage from '../../utils/safeStorage';

const ReferralPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  
  // Program state
  const [programActive, setProgramActive] = useState(false);
  const [programPaused, setProgramPaused] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [pointsReward, setPointsReward] = useState(100);
  const [tapidCode, setTapidCode] = useState('');
  const [isTapidSponsored, setIsTapidSponsored] = useState(false);
  const [tapidLimit, setTapidLimit] = useState(0);
  const [showOnlyTapidPaid, setShowOnlyTapidPaid] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [savedCampaign, setSavedCampaign] = useState(null);
  const canvasRef = useRef(null);

  // Load campaign and referral data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load campaign data with error handling
        const campaignResult = safeStorage.getItem('launchpad_campaign', null);
        if (!campaignResult.success) {
          if (campaignResult.error) {
            console.error('Error loading campaign:', campaignResult.error);
            toast.storageError(campaignResult.error);
          }
        } else if (campaignResult.data) {
          console.log('Loaded campaign data:', campaignResult.data);
          setSavedCampaign(campaignResult.data);
        } else {
          console.log('No campaign data found in storage');
        }

        // Load referral program data with error handling
        const referralResult = safeStorage.getItem('referral_program', null);
        if (!referralResult.success) {
          if (referralResult.error) {
            console.error('Error loading referral program:', referralResult.error);
            toast.storageError(referralResult.error);
          }
        } else if (referralResult.data) {
          const program = referralResult.data;
          setProgramActive(program.active);
          setProgramPaused(program.paused || false);
          setPointsReward(program.pointsReward || 100);
          setIsTapidSponsored(program.isTapidSponsored || false);
          setTapidLimit(program.tapidLimit || 0);
          setTapidCode(program.tapidCode || '');
        }
      } catch (error) {
        console.error('Unexpected error loading data:', error);
        toast.error('Loading Error', 'Failed to load referral program data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Mock data for active program
  const totalReferrals = 312;
  const tapidPaidReferrals = Math.min(totalReferrals, tapidLimit);
  const selfPaidReferrals = Math.max(0, totalReferrals - tapidLimit);
  const uniqueReferrers = 248;
  const pendingRewards = totalReferrals * pointsReward;
  const tapidEarnings = tapidPaidReferrals * 1.50; // €1.50 per Tapid-paid referral
  const referralCode = 'REF2024TIM';
  const referralLink = `https://tapid.com/join/${referralCode}`;

  const handleCreateProgram = async () => {
    setIsCreating(true);
    try {
      const code = tapidCode.toLowerCase().trim();
      let sponsored = false;
      let limit = 0;
      let finalPointsReward = pointsReward;

      if (code === 'tapid500') {
        sponsored = true;
        limit = 500;
        finalPointsReward = 100; // Fixed at 100 points for Tapid-sponsored
      } else if (code === 'tapid250') {
        sponsored = true;
        limit = 250;
        finalPointsReward = 100;
      } else if (code === 'tapid100') {
        sponsored = true;
        limit = 100;
        finalPointsReward = 100;
      }

      // Create program data
      const programData = {
        active: true,
        paused: false,
        pointsReward: finalPointsReward,
        isTapidSponsored: sponsored,
        tapidLimit: limit,
        tapidCode: code,
        createdAt: new Date().toISOString(),
        referralCode: `REF2024${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      };

      // Save to storage with error handling
      const result = safeStorage.setItem('referral_program', programData);
      if (!result.success) {
        console.error('Error saving referral program:', result.error);
        toast.storageError(result.error);
        return;
      }

      // Update state
      setIsTapidSponsored(sponsored);
      setTapidLimit(limit);
      setPointsReward(finalPointsReward);
      setProgramActive(true);
      setShowCreateModal(false);

      toast.success(
        'Referral Program Created!',
        sponsored 
          ? `Your Tapid-sponsored program is active! You'll earn €1.50 for each of your first ${limit} referrals.`
          : 'Your self-managed referral program is now active!'
      );
    } catch (error) {
      console.error('Error creating referral program:', error);
      toast.error('Creation Failed', 'Failed to create referral program.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePauseProgram = async () => {
    try {
      const newPausedState = !programPaused;
      
      // Update stored program data
      const existingResult = safeStorage.getItem('referral_program', {});
      if (existingResult.success) {
        const programData = {
          ...existingResult.data,
          paused: newPausedState
        };
        
        const result = safeStorage.setItem('referral_program', programData);
        if (!result.success) {
          console.error('Error updating program:', result.error);
          toast.storageError(result.error);
          return;
        }
      }

      setProgramPaused(newPausedState);
      setShowActionsMenu(false);
      
      toast.success(
        newPausedState ? 'Program Paused' : 'Program Resumed',
        newPausedState ? 'New referrals will not earn rewards.' : 'Your referral program is now active again.'
      );
    } catch (error) {
      console.error('Error updating program status:', error);
      toast.error('Update Failed', 'Failed to update program status.');
    }
  };

  const handleDeleteProgram = async () => {
    setIsDeleting(true);
    try {
      const result = safeStorage.removeItem('referral_program');
      if (!result.success) {
        console.error('Error deleting referral program:', result.error);
        toast.storageError(result.error);
        return;
      }

      // Reset state
      setProgramActive(false);
      setProgramPaused(false);
      setIsTapidSponsored(false);
      setTapidLimit(0);
      setPointsReward(100);
      setTapidCode('');
      setShowDeleteModal(false);
      setShowActionsMenu(false);

      toast.success('Program Deleted', 'Your referral program has been deleted successfully.');
    } catch (error) {
      console.error('Error deleting referral program:', error);
      toast.error('Delete Failed', 'Failed to delete referral program.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyCode = async () => {
    setIsCopying(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(referralCode);
        setCopiedCode(true);
        toast.success('Copied!', 'Referral code copied to clipboard.');
        setTimeout(() => setCopiedCode(false), 2000);
      } else {
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = referralCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopiedCode(true);
        toast.success('Copied!', 'Referral code copied to clipboard.');
        setTimeout(() => setCopiedCode(false), 2000);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Copy Failed', 'Failed to copy referral code. Please try selecting and copying manually.');
    } finally {
      setIsCopying(false);
    }
  };

  const generateQRCode = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR code placeholder (in real app, use a QR library like qrcode.js)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#000000';
    const blockSize = 10;
    // Create a simple pattern that looks like a QR code
    for (let i = 0; i < size; i += blockSize) {
      for (let j = 0; j < size; j += blockSize) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i, j, blockSize, blockSize);
        }
      }
    }
    
    // Add finder patterns (corners)
    const patternSize = 70;
    // Top-left
    ctx.fillRect(0, 0, patternSize, patternSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, 10, patternSize - 20, patternSize - 20);
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 20, patternSize - 40, patternSize - 40);
    
    // Top-right
    ctx.fillStyle = '#000000';
    ctx.fillRect(size - patternSize, 0, patternSize, patternSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(size - patternSize + 10, 10, patternSize - 20, patternSize - 20);
    ctx.fillStyle = '#000000';
    ctx.fillRect(size - patternSize + 20, 20, patternSize - 40, patternSize - 40);
    
    // Bottom-left
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, size - patternSize, patternSize, patternSize);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(10, size - patternSize + 10, patternSize - 20, patternSize - 20);
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, size - patternSize + 20, patternSize - 40, patternSize - 40);
  };

  const downloadQRCode = () => {
    generateQRCode();
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `referral-qr-${referralCode}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const recentReferrals = [
    { email: 'emma.wilson@email.com', date: '2024-01-15', status: 'Paid', referralNumber: 312 },
    { email: 'james.brown@email.com', date: '2024-01-14', status: 'Pending', referralNumber: 311 },
    { email: 'sofia.garcia@email.com', date: '2024-01-12', status: 'Paid', referralNumber: 310 },
    { email: 'alex.chen@email.com', date: '2024-01-10', status: 'Paid', referralNumber: 309 },
    { email: 'maria.lopez@email.com', date: '2024-01-08', status: 'Pending', referralNumber: 308 },
  ].map(referral => ({
    ...referral,
    points: pointsReward, // This will now show the actual points set (e.g., 450)
    tapidPaid: referral.referralNumber <= tapidLimit && isTapidSponsored
  }));

  const filteredReferrals = showOnlyTapidPaid 
    ? recentReferrals.filter(r => r.tapidPaid)
    : recentReferrals;

  // Get available rewards based on points value - fully dynamic
  const getAvailableRewards = (points) => {
    if (!savedCampaign || !savedCampaign.rewards) return [];
    
    const rewards = [];
    
    // Iterate through all reward tiers dynamically
    Object.entries(savedCampaign.rewards).forEach(([tierKey, tierData]) => {
      // Provide proper fallback values for backward compatibility
      const defaultPoints = {
        tier1: 500,
        tier2: 1000,
        tier3: 2000
      };
      
      const tierPoints = tierData.points || defaultPoints[tierKey] || 0;
      const tierReward = tierData.rewardText;
      
      // Only include if user's points meet the requirement and reward exists
      if (points >= tierPoints && tierReward && tierReward.trim()) {
        rewards.push({
          tier: tierKey.replace('tier', 'Tier '), // Convert "tier1" to "Tier 1"
          points: tierPoints,
          reward: tierReward
        });
      }
    });
    
    // Sort by points ascending so lower tiers show first
    return rewards.sort((a, b) => a.points - b.points);
  };

  const availableRewards = getAvailableRewards(pointsReward);
  
  // Check if we have valid rewards - improved detection logic
  const hasRewards = savedCampaign && 
    savedCampaign.rewards && 
    Object.values(savedCampaign.rewards).some(tier => 
      tier && tier.rewardText && tier.rewardText.trim()
    );

  // Debug logging to help troubleshoot rewards detection
  console.log('Referral Page Debug:', {
    savedCampaign: !!savedCampaign,
    hasRewardsProperty: savedCampaign && !!savedCampaign.rewards,
    rewardsCount: savedCampaign && savedCampaign.rewards ? Object.keys(savedCampaign.rewards).length : 0,
    hasRewards,
    rewards: savedCampaign ? savedCampaign.rewards : null
  });

  const getMetricCards = () => {
    if (!programActive) {
      return [
        {
          title: 'Total Referrals',
          value: '0',
          change: 'No program active',
          icon: <Users size={20} />,
          color: '#9ca3af'
        },
        {
          title: 'Unique Referrers', 
          value: '0',
          change: 'No program active',
          icon: <UserPlus size={20} />,
          color: '#9ca3af'
        },
        {
          title: 'Pending Rewards',
          value: '0 pts',
          change: 'No program active',
          icon: <Clock size={20} />,
          color: '#9ca3af'
        },
        {
          title: 'Amount Earned',
          value: '€0.00',
          change: 'No program active',
          icon: <DollarSign size={20} />,
          color: '#9ca3af'
        }
      ];
    }

    return [
      {
        title: 'Total Referrals',
        value: totalReferrals.toString(),
        change: '+23 this month',
        icon: <Users size={20} />,
        color: '#3b82f6'
      },
      {
        title: 'Unique Referrers',
        value: uniqueReferrers.toString(),
        change: '+18 this month',
        icon: <UserPlus size={20} />,
        color: '#10b981'
      },
      {
        title: 'Total Points Earned',
        value: `${pendingRewards.toLocaleString()} pts`,
        change: `${pointsReward} pts per referral`,
        icon: <Gift size={20} />,
        color: '#f59e0b'
      },
      {
                 title: isTapidSponsored ? 'Money You Earn' : 'Self-Managed Program',
         value: isTapidSponsored ? `€${tapidEarnings.toFixed(2)}` : `${pendingRewards.toLocaleString()} pts`,
         change: isTapidSponsored ? `€1.50 per person × ${tapidPaidReferrals} people` : 'You manage rewards',
        icon: <DollarSign size={20} />,
        color: '#8b5cf6'
      }
    ];
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <div style={{ 
              height: '30px', 
              width: '200px', 
              background: '#f0f0f0', 
              borderRadius: '4px',
              marginBottom: '8px'
            }}></div>
            <div style={{ 
              height: '14px', 
              width: '300px', 
              background: '#f0f0f0', 
              borderRadius: '4px'
            }}></div>
          </div>
        </div>
      </div>
      
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={styles.statCard} style={{ opacity: 0.7 }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: '#f0f0f0',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Loader size={20} color="#a0aec0" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <div className={styles.statContent}>
                <div style={{ height: '24px', width: '60px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '4px' }}></div>
                <div style={{ height: '16px', width: '100px', background: '#f0f0f0', borderRadius: '4px', marginBottom: '4px' }}></div>
                <div style={{ height: '12px', width: '80px', background: '#f0f0f0', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.emptyState}>
        <div className={styles.emptyStateCard}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#f0f0f0',
            borderRadius: '50%',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Loader size={24} color="#a0aec0" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <div style={{ height: '20px', width: '200px', background: '#f0f0f0', borderRadius: '4px', margin: '0 auto 8px' }}></div>
          <div style={{ height: '14px', width: '300px', background: '#f0f0f0', borderRadius: '4px', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <LoadingSkeleton />
      </>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>Referral Program</h1>
            <p className={styles.pageSubtitle}>
              {programActive 
                ? (isTapidSponsored ? 'Tapid-sponsored referral program' : 'Self-managed referral program')
                : 'Set up your customer referral program'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {getMetricCards().map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon} style={{ color: stat.color }}>
                {stat.icon}
              </div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statTitle}>{stat.title}</div>
                <div className={styles.statChange}>{stat.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {!programActive ? (
        // Initial State - No Program Active
        <div className={styles.emptyState}>
          <div className={styles.emptyStateCard}>
            <div className={styles.emptyStateIcon}>
              <Gift size={48} />
            </div>
            <h3>You currently have no referral program active.</h3>
            {!hasRewards ? (
              <>
                <p>You need to set up rewards first before creating a referral program. Set up your reward tiers in the Launch Pad.</p>
                <button 
                  className={styles.setupRewardsButton}
                  onClick={() => navigate('/control-center')}
                >
                  <Rocket size={20} />
                  Set Up Rewards First
                  <ExternalLink size={16} />
                </button>
                <div className={styles.emptyStateNote}>
                  <AlertCircle size={16} />
                  <span>Rewards are required to create referral programs</span>
                </div>
              </>
            ) : (
              <>
                <p>Create a referral program to start rewarding customers who bring their friends.</p>
                <button 
                  className={styles.createProgramButton}
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus size={20} />
                  Create Referral Program
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        // Active Program Dashboard
        <div className={styles.activeDashboard}>
          {/* Program Status Bar */}
          <div className={styles.programStatusSection}>
            <div className={styles.statusCard}>
              <div className={styles.statusInfo}>
                <div className={styles.statusHeader}>
                  <h3>Referral Program Status</h3>
                  <div className={styles.statusBadge}>
                    <span className={`${styles.statusIndicator} ${programPaused ? styles.paused : styles.active}`}>
                      {programPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                </div>
                <p className={styles.statusDescription}>
                  {programPaused 
                                         ? 'Your referral program is currently paused. New referrals won\'t earn rewards.'
                     : (isTapidSponsored 
                       ? `💰 Your program is active! You earn €1.50 for each person you refer (up to ${tapidLimit} people).`
                       : `Your self-managed referral program is active! You earn ${pointsReward} points per referral.`
                     )
                  }
                </p>
              </div>
              <div className={styles.statusActions}>
                <div className={styles.actionsMenu}>
                  <button 
                    className={styles.actionsButton}
                    onClick={() => setShowActionsMenu(!showActionsMenu)}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {showActionsMenu && (
                    <div className={styles.actionsDropdown}>
                      <button 
                        className={styles.actionItem}
                        onClick={handlePauseProgram}
                      >
                        {programPaused ? <Play size={14} /> : <Pause size={14} />}
                        {programPaused ? 'Resume Program' : 'Pause Program'}
                      </button>
                      <button 
                        className={`${styles.actionItem} ${styles.danger}`}
                        onClick={() => setShowDeleteModal(true)}
                      >
                        <Trash2 size={14} />
                        Delete Program
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Referral Code & QR Section */}
          <div className={styles.referralCodeSection}>
            <div className={styles.codeCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <Share2 size={24} />
                </div>
                <div className={styles.cardTitle}>
                  <h3>Your Referral Code</h3>
                                     <p>Share this code or link with friends - you earn {isTapidSponsored ? '€1.50' : `${pointsReward} points`} for each person who joins!</p>
                </div>
              </div>
              
              <div className={styles.codeDisplay}>
                <div className={styles.codeContainer}>
                  <span className={styles.codeLabel}>Referral Code:</span>
                  <span className={styles.codeText}>{referralCode}</span>
                  <button 
                    className={styles.copyCodeButton}
                    onClick={handleCopyCode}
                    disabled={isCopying}
                    style={{
                      opacity: isCopying ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isCopying ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 
                     copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {isCopying ? 'Copying...' : copiedCode ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                
                <div className={styles.linkContainer}>
                  <input 
                    type="text" 
                    value={referralLink} 
                    readOnly 
                    className={styles.linkInput}
                  />
                  <button 
                    className={styles.qrButton}
                    onClick={downloadQRCode}
                  >
                    <QrCode size={16} />
                    <Download size={16} />
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar for Tapid-sponsored programs */}
          {isTapidSponsored && (
            <div className={styles.progressSection}>
              <div className={styles.progressCard}>
                <div className={styles.progressHeader}>
                  <h3>Tapid-Sponsored Referral Progress</h3>
                  <span className={styles.progressCount}>{tapidPaidReferrals} / {tapidLimit} sponsored referrals</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${Math.min((tapidPaidReferrals / tapidLimit) * 100, 100)}%` }}
                  ></div>
                </div>
                                 <div className={styles.progressDetails}>
                   <div className={styles.progressStat}>
                     <span className={styles.statLabel}>💰 Money You Earn:</span>
                     <span className={styles.statValue}>{tapidPaidReferrals} people × €1.50 = €{tapidEarnings.toFixed(2)}</span>
                   </div>
                   {selfPaidReferrals > 0 && (
                     <div className={styles.progressStat}>
                       <span className={styles.statLabel}>Additional Referrals:</span>
                       <span className={styles.statValue}>{selfPaidReferrals} (you manage these)</span>
                     </div>
                   )}
                 </div>
                                 <p className={styles.progressNote}>
                   {tapidPaidReferrals >= tapidLimit 
                     ? `🎉 You've earned from your first ${tapidLimit} referrals! Additional people you refer are self-managed.`
                     : `💰 We pay you €1.50 for each of your first ${tapidLimit} referrals. Monthly payouts processed.`
                   }
                 </p>
              </div>
            </div>
          )}

          {/* Referral Table */}
          <div className={styles.referralTable}>
            <div className={styles.tableHeader}>
              <h3>Recent Referrals</h3>
              <div className={styles.tableFilters}>
                {isTapidSponsored && (
                  <label className={styles.filterCheckbox}>
                    <input
                      type="checkbox"
                      checked={showOnlyTapidPaid}
                      onChange={(e) => setShowOnlyTapidPaid(e.target.checked)}
                    />
                    <span>Show only Tapid-paid referrals</span>
                  </label>
                )}
              </div>
            </div>
            
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>User Email</th>
                    <th>Referral Date</th>
                    <th>Points</th>
                    <th>Status</th>
                    <th>Funding</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReferrals.map((referral, index) => (
                    <tr key={index}>
                      <td>{referral.email}</td>
                      <td>{referral.date}</td>
                      <td>{referral.points} pts</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[referral.status.toLowerCase()]}`}>
                          {referral.status}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.fundingBadge} ${referral.tapidPaid ? styles.tapid : styles.self}`}>
                          {referral.tapidPaid ? 'Tapid' : 'Self'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
                     </div>
         </div>
       )}

       {/* Hidden canvas for QR code generation */}
       <canvas ref={canvasRef} style={{ display: 'none' }} />

       {/* Delete Confirmation Modal */}
       {showDeleteModal && (
         <div className={styles.modalOverlay}>
           <div className={styles.modal}>
             <div className={styles.modalHeader}>
               <h2>Delete Referral Program</h2>
               <button 
                 className={styles.closeButton}
                 onClick={() => setShowDeleteModal(false)}
               >
                 <X size={20} />
               </button>
             </div>
             
             <div className={styles.modalContent}>
               <div className={styles.deleteWarning}>
                 <AlertCircle size={48} className={styles.warningIcon} />
                 <h3>Are you sure you want to delete this program?</h3>
                 <p>This action cannot be undone. All referral data and progress will be permanently lost.</p>
                 <div className={styles.deleteDetails}>
                   <div className={styles.deleteDetail}>
                     <span className={styles.detailLabel}>Total Referrals:</span>
                     <span className={styles.detailValue}>{totalReferrals}</span>
                   </div>
                   <div className={styles.deleteDetail}>
                     <span className={styles.detailLabel}>Pending Rewards:</span>
                     <span className={styles.detailValue}>{pendingRewards} points</span>
                   </div>
                                       {isTapidSponsored && (
                      <div className={styles.deleteDetail}>
                                                 <span className={styles.detailLabel}>Money You've Earned:</span>
                         <span className={styles.detailValue}>€{tapidEarnings.toFixed(2)}</span>
                      </div>
                    )}
                 </div>
               </div>
             </div>

             <div className={styles.modalFooter}>
               <button 
                 className={styles.cancelButton}
                 onClick={() => setShowDeleteModal(false)}
               >
                 Cancel
               </button>
               <button 
                 className={styles.deleteButton}
                 onClick={handleDeleteProgram}
                 disabled={isDeleting}
                 style={{
                   opacity: isDeleting ? 0.7 : 1,
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   gap: '8px'
                 }}
               >
                 {isDeleting ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                 {isDeleting ? 'Deleting...' : 'Delete Program'}
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Create Program Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Referral Program</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
                            {/* Points Reward Slider */}
              <div className={styles.sliderSection}>
                <label className={styles.sliderLabel}>
                  Points Reward 
                  {/* (€{(pointsReward / 100).toFixed(2)}) */}
                </label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    step="50"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(parseInt(e.target.value))}
                    className={styles.slider}
                                     disabled={tapidCode.toLowerCase().trim() === 'tapid500' || 
                             tapidCode.toLowerCase().trim() === 'tapid250' || 
                             tapidCode.toLowerCase().trim() === 'tapid100'}
                  />
                  {/* Checkpoint Circles */}
                  <div className={styles.checkpoints}>
                    {savedCampaign && Object.entries(savedCampaign.rewards).map(([tierKey, tierData]) => {
                      const defaultPoints = { tier1: 500, tier2: 1000, tier3: 2000 };
                      const tierPoints = tierData.points || defaultPoints[tierKey] || 0;
                      const position = ((tierPoints - 100) / (1000 - 100)) * 100;
                      
                      // Only show checkpoint if it's within slider range and has reward text
                      if (tierPoints >= 100 && tierPoints <= 1000 && tierData.rewardText && tierData.rewardText.trim()) {
                        return (
                          <div
                            key={tierKey}
                            className={styles.checkpoint}
                            style={{ left: `${position}%` }}
                            title={`${tierData.rewardText} (${tierPoints} pts)`}
                          >
                            <div className={styles.checkpointCircle}></div>
                            <div className={styles.checkpointLabel}>{tierPoints}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
                <div className={styles.sliderRange}>
                  <span>100 pts (€1)</span>
                  <span>1000 pts (€10)</span>
                </div>
                                                  <div className={styles.rewardPreview}>
                   People who use your link will earn: <strong>{pointsReward} points</strong>
                   {(tapidCode.toLowerCase().trim() === 'tapid500' || 
                     tapidCode.toLowerCase().trim() === 'tapid250' || 
                     tapidCode.toLowerCase().trim() === 'tapid100') && (
                     <div className={styles.tapidPreview}>
                       💰 <strong>You get paid €1.50 for each person you refer!</strong> (Tapid pays you directly)
                     </div>
                   )}
                   
                   {/* Dynamic Reward Callouts */}
                   {availableRewards.length > 0 && (
                     <div className={styles.rewardCallouts}>
                       <div className={styles.calloutsHeader}>
                         🎁 <strong>Available Rewards at {pointsReward} points:</strong>
                       </div>
                       {availableRewards.map((reward, index) => (
                         <div key={index} className={styles.rewardCallout}>
                           <span className={styles.rewardTier}>{reward.tier}</span>
                           <span className={styles.rewardText}>{reward.reward}</span>
                           <span className={styles.rewardPoints}>{reward.points} pts</span>
                         </div>
                       ))}
                     </div>
                   )}
                 </div>
              </div>

              {/* Tapid Code Entry */}
              <div className={styles.codeSection}>
                <label className={styles.codeLabel}>
                  Optional Tapid-Sponsored Code
                </label>
                <input
                  type="text"
                  placeholder="Enter activation code (TAPID500, TAPID250, or TAPID100)"
                  value={tapidCode}
                  onChange={(e) => setTapidCode(e.target.value)}
                  className={styles.codeInput}
                />
                                 {(tapidCode.toLowerCase().trim() === 'tapid500' || 
                   tapidCode.toLowerCase().trim() === 'tapid250' || 
                   tapidCode.toLowerCase().trim() === 'tapid100') && (
                   <div className={styles.codeSuccess}>
                     <Check size={16} />
                     {tapidCode.toLowerCase().trim() === 'tapid500' && 
                       "✅ Tapid will pay YOU €1.50 for each person you refer (up to 500 people)!"
                     }
                     {tapidCode.toLowerCase().trim() === 'tapid250' && 
                       "✅ Tapid will pay YOU €1.50 for each person you refer (up to 250 people)!"
                     }
                     {tapidCode.toLowerCase().trim() === 'tapid100' && 
                       "✅ Tapid will pay YOU €1.50 for each person you refer (up to 100 people)!"
                     }
                   </div>
                 )}
                                 <div className={styles.codeNote}>
                   <AlertCircle size={14} />
                   Without a Tapid code: You manage rewards yourself (no money from Tapid).
                 </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.launchButton}
                onClick={handleCreateProgram}
                disabled={isCreating}
                style={{
                  opacity: isCreating ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {isCreating && <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />}
                {isCreating ? 'Creating Program...' : 'Launch Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralPage; 