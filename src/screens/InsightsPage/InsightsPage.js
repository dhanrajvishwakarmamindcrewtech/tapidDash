import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInsights, useCustomers, useCampaigns } from '../../context/BusinessDataContext';
import { useData } from '../../context/DataContext';
import {
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  RotateCcw,
  AlertTriangle,
  Lightbulb,
  Search,
  ChevronLeft,
  ChevronRight,
  Zap,
  Crown,
  Target,
  TrendingUp,
  Star,
  Heart,
  Clock,
  Activity,
  Award,
  UserPlus,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import styles from './InsightsPage.module.css';

const InsightsPage = () => {
  const navigate = useNavigate();

  // Context hooks (only what we actually use)
  const {
    showCustomerTable,
    loading,
    error,
    loadInsights,
    exportInsights,
    getCustomerStats,
    customers
  } = useInsights();

  const { customers: contextCustomers, fetchCustomers } = useCustomers();
  const { primaryRewards, flashPromotions } = useCampaigns();
  
  // DataContext for clean data access
  const { fetchInsightsData, getIconForType } = useData();

  // Icon helper function to render actual React components
  const renderIcon = (iconName, size = 20) => {
    // Map icon names to their respective components
    const iconMap = {
      'Users': Users, 
      'DollarSign': DollarSign, 
      'RotateCcw': RotateCcw, 
      'Heart': Heart, 
      'Star': Star, 
      'Crown': Crown, 
      'Clock': Clock, 
      'Award': Award, 
      'UserPlus': UserPlus, 
      'Calendar': Calendar, 
      'Activity': Activity, 
      'Target': Target, 
      'TrendingUp': TrendingUp, 
      'Zap': Zap, 
      'CheckCircle': CheckCircle,
      'ArrowUpRight': ArrowUpRight, 
      'ArrowDownRight': ArrowDownRight, 
      'AlertTriangle': AlertTriangle, 
      'Lightbulb': Lightbulb
    };
    
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={size} /> : <Users size={size} />;
  };

  // Local state
  const [componentError, setComponentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [insightsData, setInsightsData] = useState(null);

  const [segmentPage, setSegmentPage] = useState(0);

  // Mobile detection
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => { e.currentTarget.style.transform = 'scale(0.98)'; };
  const handleTouchEnd = (e) => { e.currentTarget.style.transform = 'scale(1)'; };

  // Navigation handlers
  // Action navigation is currently unused but kept for future insights actions
  const handleInsightAction = (insight) => {
    if (!insight?.actionLink) return;
    if (insight.actionLink.includes('control-center')) {
      let tab = null;
      const url = new URL(insight.actionLink, window.location.origin);
      tab = url.searchParams.get('tab');
      if (!tab) {
        if (/tab=(flash|primary|recurring|targeted|group|nudge)/.test(insight.actionLink)) {
          tab = insight.actionLink.match(/tab=(flash|primary|recurring|targeted|group|nudge)/)?.[1];
        } else if (/\/flash/.test(insight.actionLink)) tab = 'flash';
        else if (/\/primary/.test(insight.actionLink)) tab = 'primary';
        else if (/\/recurring/.test(insight.actionLink)) tab = 'recurring';
        else if (/\/targeted|\/group/.test(insight.actionLink)) tab = 'targeted';
        else if (/\/nudge/.test(insight.actionLink)) tab = 'nudge';
      }
      if (tab) {
        navigate('/control-center', {
          state: {
            activeTab: tab,
            source: 'insights-recommendation',
            insightContext: {
              title: insight.title,
              description: insight.description,
              type: insight.type
            }
          }
        });
      } else {
        navigate('/control-center');
      }
    } else {
      const path = insight.actionLink.replace(/\?.*$/, '');
      navigate(path);
    }
  };

  // Stats from JSON-backed context
  const customerStats = useMemo(() => getCustomerStats(), [getCustomerStats]);

  // KPIs from transformed data
  const topKPIs = useMemo(() => {
    if (!insightsData?.kpis) return [];
    return insightsData.kpis;
  }, [insightsData]);

  // Smart Insights from transformed data
  const smartInsights = useMemo(() => {
    if (!insightsData?.smartInsights) return [];
    return insightsData.smartInsights;
  }, [insightsData]);

  // Restore original getInsightIcon mapping used by UI
  const getInsightIcon = (type) => {
    const iconMap = {
      warning: { icon: AlertTriangle, class: styles.insightWarning },
      opportunity: { icon: Target, class: styles.insightOpportunity },
      success: { icon: TrendingUp, class: styles.insightSuccess }
    };
    const IconComponent = iconMap[type]?.icon || Lightbulb;
    return <IconComponent size={16} className={iconMap[type]?.class} />;
  };

  // Restore original rich segments list with icons
  // Customer segments from transformed data
  const customerSegmentData = useMemo(() => {
    if (!insightsData?.customerSegments) return [];
    return insightsData.customerSegments;
  }, [insightsData]);

  const segmentsPerPage = 4;
  const totalPages = Math.ceil(customerSegmentData.length / segmentsPerPage) || 1;
  const visibleSegments = useMemo(() => {
    const start = segmentPage * segmentsPerPage;
    return customerSegmentData.slice(start, start + segmentsPerPage);
  }, [customerSegmentData, segmentPage]);

  // Effects to load data
  useEffect(() => { loadInsights?.(); }, [loadInsights]);

  // Load transformed insights data
  useEffect(() => {
    const loadTransformedData = async () => {
      try {
        const data = await fetchInsightsData();
        setInsightsData(data);
      } catch (err) {
        setComponentError(err.message);
      }
    };
    loadTransformedData();
  }, [fetchInsightsData]);
  useEffect(() => { fetchCustomers?.(); }, [fetchCustomers]);

  // Helpers
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight size={16} className={styles.trendUp} />;
      case 'down':
        return <ArrowDownRight size={16} className={styles.trendDown} />;
      default:
        return null;
    }
  };

  const handleExport = async () => {
    try {
      const data = exportInsights ? exportInsights() : null;
      if (data) {
        const headers = ['Customer ID', 'Name', 'Email', 'Total Spend', 'Visit Count', 'Rewards Earned', 'Last Visit', 'Segment', 'Status'];
        const rows = customers.map(c => [c.id, c.name, c.email || '', c.totalSpend, c.visitCount, c.rewardsEarned, c.lastVisit, c.segment, c.status]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'customer-insights.csv';
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      setComponentError('Failed to export data');
    }
  };

  if (componentError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertTriangle size={48} />
          <h3>Insights Error</h3>
          <p>{componentError}</p>
          <button onClick={() => { setComponentError(null); loadInsights?.(); }}>Retry</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <AlertTriangle size={48} />
          <h3>Failed to load insights</h3>
          <p>{error}</p>
          <button onClick={() => loadInsights?.()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Insights</span>
            </div>
            <div className={styles.greetingPill}>Your customer & loyalty analytics</div>
          </div>
          <div className={styles.lastUpdated}>

            <RefreshCw size={14} />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        {topKPIs.map((kpi, index) => (
          <div key={index} className={styles.kpiCard} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <div className={styles.kpiContent}>
              <div className={styles.kpiText}>
                <div className={styles.kpiValue}>{kpi.formattedValue}</div>
                <div className={styles.kpiTitle}>{kpi.title}</div>
                <div className={styles.kpiTrend}>
                  {getTrendIcon(kpi.trend)}
                                      <span className={styles.kpiChange}>{kpi.formattedChange}</span>
                  <span className={styles.kpiPeriod}>{kpi.period}</span>
                </div>
              </div>
              <div className={styles.kpiIconWrapper}>
                <div className={styles.kpiIcon}>{renderIcon(kpi.icon)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Smart Insights */}
      <div className={styles.insightsSection}>
        <div className={styles.sectionHeader}>
          <h2>Smart Insights & Recommendations</h2>
          <div className={styles.insightsMeta}>
            <Lightbulb size={16} />
            <span>{smartInsights.length} insights generated from your data</span>
          </div>
        </div>

        {smartInsights.length > 0 ? (
          <div className={styles.insightsGrid}>
            {smartInsights.map((insight, index) => (
              <div key={index} className={`${styles.insightCard} ${styles[insight.priority]}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <div className={styles.insightContent}>
                  <div className={styles.insightTopRow}>
                    <div className={styles.insightIconWrapper}>{insight.icon ? renderIcon(insight.icon, 16) : getInsightIcon(insight.type)}</div>
                    <span className={styles.insightPriority}>{insight.priority}</span>
                  </div>
                  <div className={styles.insightTextContent}>
                    <h3>{insight.title}</h3>
                    <p className={styles.insightDescription}>{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyInsights}>
            <Lightbulb size={isMobile ? 32 : 48} />
            <h3>No insights available</h3>
            <p>Insights will appear as your customer data grows and patterns emerge.</p>
          </div>
        )}
      </div>

      {/* Customer Segments */}
      <div className={styles.segmentsSection}>
        <div className={styles.segmentsHeader}>
          <h2>Customer Segments Breakdown</h2>
          <div className={styles.segmentsPaging}>
            <button className={styles.segmentsArrow} onClick={() => setSegmentPage((p) => Math.max(0, p - 1))} disabled={segmentPage === 0} aria-label="Previous Segments">
              <ChevronLeft size={18} />
            </button>
            <span className={styles.segmentsPageIndicator}>{segmentPage + 1} / {totalPages}</span>
            <button className={styles.segmentsArrow} onClick={() => setSegmentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={segmentPage === totalPages - 1} aria-label="Next Segments">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className={styles.segmentsGrid}>
          {visibleSegments.map((segment, index) => (
            <div key={index} className={`${styles.segmentCard} ${styles[segment.color]}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              <div className={styles.segmentContent}>
                <div className={styles.segmentHeader}>
                  <div className={styles.segmentIconWrapper}>
                    <div className={styles.segmentIcon}>{renderIcon(segment.icon)}</div>
                  </div>
                  <div className={styles.segmentGrowth}>
                    {segment.formattedGrowth.startsWith('+') ? (
                      <ArrowUpRight size={14} className={styles.growthUp} />
                    ) : (
                      <ArrowDownRight size={14} className={styles.growthDown} />
                    )}
                    <span>{segment.formattedGrowth}</span>
                  </div>
                </div>
                <div className={styles.segmentMainInfo}>
                  <h3 className={styles.segmentTitle}>{segment.title}</h3>
                  <div className={styles.segmentCount}>
                    <span className={styles.count}>{segment.count.toLocaleString()}</span>
                    <span className={styles.percentage}>({segment.percentage}%)</span>
                  </div>
                </div>
                <div className={styles.segmentMetrics}>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Avg Spend</span>
                                          <span className={styles.metricValue}>{segment.formattedAvgSpend}</span>
                  </div>
                  <div className={styles.metric}>
                    <span className={styles.metricLabel}>Visit Freq</span>
                    <span className={styles.metricValue}>{segment.visitFreq}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section (unchanged UI - only shown when toggled) */}
      {showCustomerTable && (
        <div className={styles.tableSection}>
          <div className={styles.tableControls}>
            <div className={styles.searchGroup}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button className={styles.secondaryButton} onClick={handleExport}>Export</button>
          </div>
          <div className={styles.tableWrapper}>
            <div className={styles.tableScroll}>
              <table className={styles.customerTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Total Spend</th>
                    <th>Visits</th>
                    <th>Rewards</th>
                    <th>Last Visit</th>
                  </tr>
                </thead>
                <tbody>
                  {customers
                    .filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 50)
                    .map(c => (
                      <tr key={c.id}>
                        <td>
                          <div className={styles.customerInfo}>
                            <span className={styles.customerName}>{c.name}</span>
                            <span className={styles.customerId}>{c.id}</span>
                          </div>
                        </td>
                        <td className={styles.customerEmail}>{c.email || ''}</td>
                        <td className={styles.spendCell}>€{(c.totalSpend || 0).toFixed(2)}</td>
                        <td>{c.visitCount || 0}</td>
                        <td>
                          <div className={styles.rewardsInfo}>
                            <span>{c.rewardsEarned || 0} earned</span>
                            <span className={styles.rewardsRedeemed}>{c.rewardsRedeemed || 0} redeemed</span>
                          </div>
                        </td>
                        <td>{c.lastVisit}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;