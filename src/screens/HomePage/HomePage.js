import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import {
  Users,
  DollarSign,
  Gift,
  TrendingUp,
  RefreshCw,
  Activity,
  Clock,
  Star,
  Award,
  CheckCircle,
  AlertCircle,
  Bell,
  X,
  UserCheck,
  Crown,
  Check
} from 'lucide-react';
import styles from './HomePage.module.css';
import { useCustomers } from '../../context/BusinessDataContext';
import { useApp } from '../../context/CoreContext';
import { useData } from '../../context/DataContext';

// PeakTimesChart Component
const PeakTimesChart = ({ data, title, subtitle }) => {
  // Calculate peak time dynamically
  const peakTime = useMemo(() => {
    if (!data || data.length === 0) return "N/A";
    
    const maxValue = Math.max(...data.map(item => item.value));
    const peakHour = data.find(item => item.value === maxValue);
    
    if (!peakHour) return "N/A";
    
    // Extract hour from label (e.g., "2 PM" from "2:00 PM")
    return peakHour.label.replace(':00', '');
  }, [data]);
  
  // Calculate average activity dynamically
  const avgActivity = useMemo(() => {
    if (!data || data.length === 0) return "0%";
    
    const average = data.reduce((sum, item) => sum + item.value, 0) / data.length;
    return `${Math.round(average)}%`;
  }, [data]);

  return (
    <div className={styles.stripeChart}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleSection}>
          <div className={styles.chartTitleRow}>
            <div className={styles.chartIcon}>
              <Clock size={20} />
                      </div>
            <div>
              <h3 className={styles.chartTitle}>{title}</h3>
              {subtitle && <p className={styles.chartSubtitle}>{subtitle}</p>}
                  </div>
                </div>
                    </div>
        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Peak Time</span>
            <span className={styles.statValue}>{peakTime}</span>
              </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Avg. Activity</span>
            <span className={styles.statValue}>{avgActivity}</span>
            </div>
      </div>
      </div>
      <div className={styles.lineChartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="label" 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              labelStyle={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}
              itemStyle={{ color: '#6b7280', fontSize: '13px' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4, stroke: '#fff' }}
              activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2, fill: '#14b8a6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Customer Distribution Chart Component
const CustomerDistributionChart = ({ data, title, subtitle }) => {
  // Calculate top age group dynamically
  const topAgeGroup = useMemo(() => {
    if (!data || data.length === 0) return "N/A";
    
    const ageGroupTotals = data.map(item => ({
      ageRange: item.ageRange,
      total: item.male + item.female
    }));
    
    const maxTotal = Math.max(...ageGroupTotals.map(item => item.total));
    const topGroup = ageGroupTotals.find(item => item.total === maxTotal);
    
    return topGroup ? topGroup.ageRange : "N/A";
  }, [data]);
  
  // Calculate gender split dynamically
  const genderSplit = useMemo(() => {
    if (!data || data.length === 0) return "N/A";
    
    const totalMale = data.reduce((sum, item) => sum + item.male, 0);
    const totalFemale = data.reduce((sum, item) => sum + item.female, 0);
    const totalCustomers = totalMale + totalFemale;
    
    if (totalCustomers === 0) return "N/A";
    
    const femalePercentage = Math.round((totalFemale / totalCustomers) * 100);
    return `${femalePercentage}% F`;
  }, [data]);

  return (
    <div className={styles.stripeChart}>
      <div className={styles.chartHeader}>
        <div className={styles.chartTitleSection}>
          <div className={styles.chartTitleRow}>
            <div className={styles.chartIcon}>
              <UserCheck size={20} />
        </div>
            <div>
              <h3 className={styles.chartTitle}>{title}</h3>
              {subtitle && <p className={styles.chartSubtitle}>{subtitle}</p>}
            </div>
              </div>
              </div>
        <div className={styles.chartStats}>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Top Age Group</span>
            <span className={styles.statValue}>{topAgeGroup}</span>
              </div>
          <div className={styles.chartStat}>
            <span className={styles.statLabel}>Gender Split</span>
            <span className={styles.statValue}>{genderSplit}</span>
              </div>
            </div>
          </div>
      <div className={styles.distributionChartContainer}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis 
              dataKey="age" 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#6b7280' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              labelStyle={{ color: '#374151', fontWeight: '600', fontSize: '14px' }}
              itemStyle={{ color: '#6b7280', fontSize: '13px' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36}
              wrapperStyle={{
                paddingBottom: '10px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="male" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
              name="Male"
            />
            <Bar 
              dataKey="female" 
              fill="#ec4899" 
              radius={[4, 4, 0, 0]}
              name="Female"
            />
          </BarChart>
        </ResponsiveContainer>
          </div>
        </div>
  );
};

// Notification Component
const NotificationBoard = ({ notifications, onDismiss }) => {
  return (
    <div className={styles.notificationBoard}>
      <div className={styles.notificationHeader}>
        <div className={styles.notificationTitle}>
          <Bell size={20} />
          <h3>Notifications</h3>
        </div>
        <span className={styles.notificationCount}>{notifications.length}</span>
      </div>
      <div className={styles.notificationList}>
        {notifications.map((notification, index) => (
          <div key={index} className={`${styles.notificationItem} ${styles[notification.type]}`}>
            <div className={styles.notificationIcon}>
              {notification.icon}
            </div>
            <div className={styles.notificationContent}>
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className={styles.notificationTime}>{notification.time}</span>
            </div>
            <button 
              className={styles.dismissButton}
              onClick={() => onDismiss(index)}
              aria-label={`Dismiss ${notification.title} notification`}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const { user } = useApp();
  const { customerStats } = useCustomers();
  const { data } = useData();

  // Current time for last updated
  const [currentTime] = useState(new Date());
  
  // Get notifications from BusinessData.json with proper formatting
  const [notifications, setNotifications] = useState(() => {
    return (data?.home?.notifications || []).map(notification => ({
      ...notification,
      time: new Date(notification.timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }),
      icon: notification.type === 'success' ? <CheckCircle size={16} /> :
            notification.type === 'warning' ? <AlertCircle size={16} /> :
            notification.type === 'info' ? <Users size={16} /> :
            <Gift size={16} />
    }));
  });

  // Chart data from BusinessData.json
  const peakTimesData = useMemo(() => {
    return (data?.home?.peakTimesData || []).map(item => ({
      label: `${item.hour === 12 ? '12 PM' : item.hour > 12 ? `${item.hour - 12} PM` : `${item.hour} AM`}`,
      value: item.value
    }));
  }, [data]);

  const customerDistributionData = useMemo(() => {
    return data?.home?.customerDistributionData || [];
  }, [data]);

  // Generate summary KPIs with proper null checks
  const summaryKPIs = useMemo(() => [
    {
      title: 'Active Users',
      value: (customerStats?.active || 1847).toLocaleString(),
      change: '+15.2%',
      percentage: 78,
      icon: <Users size={20} />,
      color: '#3b82f6'
    },
    {
      title: 'Total Points Collected',
      value: '45,230',
      change: '+22.8%',
      percentage: 85,
      icon: <TrendingUp size={20} />,
      color: '#10b981'
    },
    {
      title: 'Total Revenue',
      value: '€24,500',
      change: '+18.7%',
      percentage: 72,
      icon: <DollarSign size={20} />,
      color: '#f59e0b'
    },
    {
      title: 'New Customers This Week',
      value: '89',
      change: '+12.3%',
      percentage: 65,
      icon: <UserCheck size={20} />,
      color: '#8b5cf6'
    }
  ], [customerStats]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleDismissNotification = (index) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeContent}>
          <div className={styles.greetingSection}>
            <div className={styles.greetingRow}>
              <span className={styles.greetingMain}>Welcome back{user?.name ? `, ${user.name}` : ''}!</span>
            </div>
            <div className={styles.greetingPill}>Your business dashboard overview</div>
          </div>
          <div className={styles.lastUpdated}>
            <RefreshCw size={14} />
            <span>Last updated: {formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className={styles.kpiSection}>
        <div className={styles.kpiGrid}>
          {summaryKPIs.map((kpi, index) => (
            <div key={index} className={styles.kpiCard}>
              <div className={styles.kpiContent}>
                <div className={styles.kpiIconWrapper}>
                  <div className={styles.kpiIcon}>
                    {kpi.icon}
                </div>
              </div>
                <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={styles.kpiTitle}>{kpi.title}</div>
                  <div className={styles.kpiChange}>{kpi.change}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        <h2>Analytics Overview</h2>
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <PeakTimesChart 
              data={peakTimesData} 
              title="Peak Times Throughout the Day"
              subtitle="Customer activity patterns by hour"
            />
            </div>
          <div className={styles.chartCard}>
            <CustomerDistributionChart 
              data={customerDistributionData} 
              title="Customer Distribution by Age & Gender"
              subtitle="Demographic breakdown of your customer base"
            />
          </div>
            </div>
          </div>
          
      {/* Notification Board, Leaderboard, and Data Sources */}
      <div className={styles.bottomSection}>
        <div className={styles.notificationSection}>
          <NotificationBoard 
            notifications={notifications}
            onDismiss={handleDismissNotification}
          />
                    </div>
        
        <div className={styles.leaderboardSection}>
          <div className={styles.leaderboardHeader}>
            <h3>Top Customers</h3>
            <span className={styles.leaderboardCount}>Top 5</span>
          </div>
          <div className={styles.leaderboardList}>
            {(data?.home?.leaderboard || []).map((customer, index) => (
              <div key={index} className={styles.leaderboardItem}>
                <div className={styles.leaderboardRank}>
                  <span className={styles.rankNumber}>{customer.rank}</span>
                </div>
                <div className={styles.leaderboardInfo}>
                  <div className={styles.customerName}>{customer.name}</div>
                  <div className={styles.customerStats}>
                    <span className={styles.customerSpend}>€{customer.spend.toLocaleString()}</span>
                    <span className={styles.customerVisits}>{customer.visits} visits</span>
                  </div>
                </div>
                <div className={styles.leaderboardIcon}>
                  {customer.rank === 1 && <Crown size={16} />}
                  {customer.rank === 2 && <Star size={16} />}
                  {customer.rank === 3 && <Award size={16} />}
                </div>
                  </div>
                ))}
              </div>
            </div>
        
        <div className={styles.todoSection}>
          <div className={styles.todoHeader}>
            <h3>Getting Started</h3>
            <span className={styles.todoProgress}>
              {(data?.home?.todoList || []).filter(item => item.completed).length}/{(data?.home?.todoList || []).length} Complete
            </span>
          </div>
          <div className={styles.todoList}>
            {(data?.home?.todoList || []).map((item, index) => (
              <div key={item.id} className={`${styles.todoItem} ${item.completed ? styles.completed : ''}`}>
                <div className={styles.todoCheckbox}>
                  <input 
                    type="radio" 
                    id={item.id}
                    checked={item.completed}
                    readOnly
                    className={styles.todoRadio}
                  />
                  <label htmlFor={item.id} className={styles.todoCheckLabel}>
                    {item.completed && <Check size={12} />}
                  </label>
                </div>
                <div className={styles.todoContent}>
                  <div className={styles.todoTitle}>{item.title}</div>
                  <div className={styles.todoDescription}>{item.description}</div>
                </div>
                <div className={`${styles.todoPriority} ${styles[item.priority]}`}>
                  {item.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Market Trends Section */}
      <div className={styles.marketTrendsSection}>
        <div className={styles.sectionTitle}>
          <h2>Market Trends</h2>
          <p>Customer behavior and industry insights</p>
        </div>
        <div className={styles.marketTrendsGrid}>
          <div className={styles.marketTrendsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <Activity size={20} />
              </div>
              <div className={styles.cardTitle}>
                <h3>Customer Behavior Trends</h3>
                <span className={styles.cardSubtitle}>What's driving spending patterns</span>
              </div>
            </div>
            <div className={styles.trendsList}>
              {(data?.home?.marketTrends || []).map((item, index) => {
                const icon = item.impact === 'positive' ? 
                  (item.trend.includes('sunny') ? '☀️' : 
                   item.trend.includes('coffee') ? '🏠' : 
                   item.trend.includes('brunch') ? '🍳' : 
                   item.trend.includes('loyalty') ? '🎯' : '📈') : '🌙';
                const value = `${item.value > 0 ? '+' : ''}${item.value}%`;
                
                return (
                  <div key={index} className={`${styles.trendItem} ${styles[item.impact]}`}>
                  <div className={styles.trendIcon}>{icon}</div>
                  <div className={styles.trendText}>
                    <span className={styles.trendDescription}>{item.trend}</span>
                  </div>
                  <div className={styles.trendCallout}>
                    <span className={`${styles.trendValue} ${styles[item.impact]}`}>{value}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

          <div className={styles.marketTrendsCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <TrendingUp size={20} />
              </div>
              <div className={styles.cardTitle}>
                <h3>Revenue Insights</h3>
                <span className={styles.cardSubtitle}>Key performance indicators</span>
              </div>
            </div>
            <div className={styles.revenueInsights}>
              {(data?.home?.revenueInsights || []).map((metric, index) => (
                <div key={index} className={styles.revenueMetric}>
                  <div className={styles.revenueHeader}>
                    <span className={styles.revenueLabel}>{metric.label}</span>
                    <span className={styles.revenueCallout}>
                      {metric.label.includes('Value') || metric.label.includes('Revenue') ? 
                        `€${metric.value.toLocaleString()}` : 
                        `${metric.value}${metric.label.includes('Rate') || metric.label.includes('Orders') ? '%' : ''}`
                      }
                    </span>
                  </div>
                  <div className={styles.revenueBar}>
                    <div className={styles.revenueBarFill} style={{ width: `${metric.progress}%` }}></div>
                  </div>
                  <span className={styles.revenueStatus}>
                    {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage}% vs last month
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;