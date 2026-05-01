import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { QUICK_ACTIONS } from '../utils/navItems';
import { motion } from 'framer-motion';
import { QueryErrorState, StatsLoadingGrid } from '../components/QueryState';
import {
  AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Reveal, StaggerContainer, StaggerItem, SplitText,
  MagneticButton, GlowCard, AnimatedCounter,
} from '../components/Motion';
import {
  CreditCard,
  Package,
  Users,
  TrendingUp,
  Plus,
  PackagePlus,
  Layers,
  ShoppingBag,
  DollarSign,
  RotateCcw,
  Truck,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Activity,
  Sparkles,
  ChevronRight,
  Wifi,
} from 'lucide-react';

/* Custom premium tooltip */
const PremiumTooltip = ({ active, payload, label, formatCurrency }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="chart-tooltip glass"
    >
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">
        {formatCurrency ? formatCurrency(payload[0].value) : payload[0].value?.toLocaleString()}
      </div>
    </motion.div>
  );
};

/* Stat card icons mapping */
const STAT_ICONS = {
  'Total Revenue': CreditCard,
  'Orders': Package,
  'Customers': Users,
  'Avg Order Value': TrendingUp,
};

/* Module icons */
const MODULE_ICONS = {
  'Orders': ShoppingBag,
  'Inventory': Layers,
  'Customers': Users,
  'Finance': DollarSign,
};

export default function Dashboard() {
  const { user, formatCurrency } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const brand = user?.brand || {};

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [products, orders, customers, financial, suppliers, revenueChart, topProducts, topCustomers, lowStock, returns] = await Promise.all([
        api.get('/products/stats/summary').catch((err) => {
          console.warn('Failed to load product stats:', err.message);
          return { data: {} };
        }),
        api.get('/orders/stats/summary').catch((err) => {
          console.warn('Failed to load order stats:', err.message);
          return { data: {} };
        }),
        api.get('/customers/stats/summary').catch((err) => {
          console.warn('Failed to load customer stats:', err.message);
          return { data: {} };
        }),
        api.get('/financial/stats/summary').catch((err) => {
          console.warn('Failed to load financial stats:', err.message);
          return { data: {} };
        }),
        api.get('/suppliers/stats/summary').catch((err) => {
          console.warn('Failed to load supplier stats:', err.message);
          return { data: {} };
        }),
        api.get('/orders/stats/revenue-chart').catch((err) => {
          console.warn('Failed to load revenue chart:', err.message);
          return { data: { sparkData: [] } };
        }),
        api.get('/orders/stats/top-products').catch((err) => {
          console.warn('Failed to load top products:', err.message);
          return { data: { topProducts: [] } };
        }),
        api.get('/customers/stats/top').catch((err) => {
          console.warn('Failed to load top customers:', err.message);
          return { data: { topCustomers: [] } };
        }),
        api.get('/products/stats/low-stock').catch((err) => {
          console.warn('Failed to load low stock products:', err.message);
          return { data: { lowStockProducts: [] } };
        }),
        api.get('/returns/stats/summary').catch((err) => {
          console.warn('Failed to load returns stats:', err.message);
          return { data: {} };
        }),
      ]);
      setStats({
        products: products.data, orders: orders.data,
        customers: customers.data, financial: financial.data, suppliers: suppliers.data,
        sparkData: revenueChart.data.sparkData || [],
        topProducts: topProducts.data.topProducts || [],
        topCustomers: topCustomers.data.topCustomers || [],
        lowStock: lowStock.data.lowStockProducts || [],
        returns: returns.data || {},
      });
    } catch (e) {
      console.error('Dashboard stats error:', e);
      setLoadError('Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const sparkData = stats?.sparkData?.length ? stats.sparkData : [];

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const statCards = [
    {
      label: 'Total Revenue',
      value: stats?.financial?.completedRevenue || 0,
      isCurrency: true,
      trend: 'up',
      color: 'var(--accent)',
      gradient: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)',
    },
    {
      label: 'Orders',
      value: stats?.orders?.total || 0,
      trend: 'none',
      color: 'var(--secondary)',
      gradient: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-deep) 100%)',
    },
    {
      label: 'Customers',
      value: stats?.customers?.total || 0,
      trend: 'up',
      color: 'var(--emerald)',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
    {
      label: 'Avg Order Value',
      value: stats?.orders?.total > 0 ? (stats?.financial?.completedRevenue || 0) / stats.orders.total : 0,
      isCurrency: true,
      trend: 'none',
      color: 'var(--gold)',
      gradient: 'linear-gradient(135deg, var(--gold) 0%, #d97706 100%)',
    },
  ];

  const modules = [
    {
      num: '01', title: 'Orders',
      desc: 'Manage pipeline & statuses',
      sub: stats?.orders?.pending > 0 ? `${stats.orders.pending} pending` : null,
      to: '/orders',
      color: 'var(--accent)',
    },
    {
      num: '02', title: 'Inventory',
      desc: `${stats?.products?.total || 0} items in stock`,
      sub: stats?.products?.lowStock > 0 ? `${stats.products.lowStock} low stock` : null,
      to: '/products',
      color: 'var(--secondary)',
    },
    {
      num: '03', title: 'Customers',
      desc: 'VIP & Loyal segment tracking',
      sub: `${stats?.customers?.total || 0} active`,
      to: '/customers',
      color: 'var(--emerald)',
    },
    {
      num: '04', title: 'Finance',
      desc: 'Revenue & payments',
      sub: formatCurrency ? `${formatCurrency(stats?.financial?.pendingRevenue || 0)} pending` : null,
      to: '/financial',
      color: 'var(--gold)',
    },
  ];

  /* Chart Colors */
  const COLORS = ['var(--accent)', 'var(--secondary)', 'var(--gold)', 'var(--emerald)', '#6366f1'];

  return (
    <div className="dashboard-wrapper">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="dashboard-header-copy">
            <Reveal delay={0.05} direction="none">
              <div className="greeting-text">
                <Sparkles size={16} style={{ marginRight: 8, color: 'var(--accent)' }} />
                Welcome back, {user?.name?.split(' ')[0] || 'there'}
              </div>
            </Reveal>

            <SplitText
              text={brand.name || 'Dashboard'}
              tag="h1"
              className="page-title"
              delay={0.08}
              stagger={0.05}
            />

            <Reveal delay={0.28} direction="up">
              <p className="page-subtitle">
                {brand.category && (
                  <span className="brand-badge">{brand.category}</span>
                )}
                Your brand is performing beautifully — {today}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.32} direction="left">
            <div className="header-actions dashboard-header-actions">
              <MagneticButton
                className="btn btn-primary dashboard-header-btn"
                onClick={() => navigate('/orders')}
                aria-label="Create new order"
              >
                <Plus size={18} />
                New Order
              </MagneticButton>
              <MagneticButton
                className="btn btn-secondary dashboard-header-btn"
                onClick={() => navigate('/products')}
                aria-label="Add new product"
              >
                <PackagePlus size={18} />
                Add Product
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="page-body">
        {loading ? (
          <>
            {/* Skeleton state */}
            <div className="stats-container">
              <StatsLoadingGrid />
            </div>
            <div className="page-loader" style={{ marginTop: 40 }}>
              <div className="spinner" aria-label="Loading dashboard..." />
            </div>
          </>
        ) : loadError ? (
          <QueryErrorState message={loadError} onRetry={fetchStats} />
        ) : (
          <>
            {/* STAT CARDS */}
            <StaggerContainer
              staggerDelay={0.07}
              delayStart={0.05}
              className="stats-container"
            >
              <div className="stats-grid" role="list" aria-label="Key metrics">
                {statCards.map((s, i) => {
                  const IconComponent = STAT_ICONS[s.label];
                  return (
                    <StaggerItem key={s.label} role="listitem">
                      <GlowCard
                        className="stat-card card glass"
                        aria-label={`${s.label}: ${s.isCurrency ? formatCurrency(s.value) : s.value}`}
                      >
                        {/* Icon + label row */}
                        <div className="stat-card__header">
                          <div className="stat-label">{s.label}</div>
                          <div 
                            className="stat-card__icon"
                            style={{ background: s.gradient }}
                          >
                            {IconComponent && <IconComponent size={18} />}
                          </div>
                        </div>

                        {/* Value */}
                        <div className="stat-value">
                          {s.isCurrency
                            ? formatCurrency(s.value)
                            : s.isPct
                              ? `${s.value}%`
                              : <AnimatedCounter value={s.value} delay={0.3 + i * 0.1} />}
                        </div>

                        {/* Trend bar */}
                        <div className="stat-card__progress">
                          <motion.div
                            className="stat-card__progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: s.trend === 'up' ? '72%' : '45%' }}
                            transition={{ duration: 1.4, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                            style={{ background: s.gradient }}
                          />
                        </div>

                        {s.trend === 'up' && (
                          <div className="stat-sub up">
                            <TrendingUp size={12} />
                            Trending up
                          </div>
                        )}
                      </GlowCard>
                    </StaggerItem>
                  );
                })}
              </div>
            </StaggerContainer>

            {/* MAIN GRID */}
            <div className="dashboard-grid">
              {/* Left column */}
              <div className="modules-grid-wrap">
                {/* Revenue chart */}
                <Reveal delay={0.15} direction="up">
                  <div className="card glass dashboard-chart-card">
                    <div className="card-header">
                      <div className="card-header__left">
                        <div className="card-header__icon">
                          <Activity size={18} />
                        </div>
                        <h2 className="card-title">Revenue Trajectory</h2>
                      </div>
                      <div className="dashboard-live-indicator">
                        <Wifi size={12} />
                        <span>Live</span>
                      </div>
                    </div>

                    <div className="chart-container" aria-label="Revenue chart for the last 7 months">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="vibeCyan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.28} />
                              <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            vertical={false}
                            strokeDasharray="4 4"
                            stroke="rgba(255,255,255,0.04)"
                          />
                          <XAxis
                            dataKey="m"
                            axisLine={false} tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.22)', fontSize: 11, fontWeight: 600 }}
                          />
                          <Tooltip
                            content={<PremiumTooltip formatCurrency={formatCurrency} />}
                            cursor={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="v"
                            stroke="var(--accent)"
                            strokeWidth={3}
                            fill="url(#vibeCyan)"
                            animationDuration={1800}
                            dot={false}
                            activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'none' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Reveal>

                {/* Module quick links */}
                <StaggerContainer staggerDelay={0.08} delayStart={0.25}>
                  <div className="grid-2x2" role="list" aria-label="Module shortcuts">
                    {modules.map((mod) => {
                      const ModIcon = MODULE_ICONS[mod.title];
                      return (
                        <StaggerItem key={mod.title} role="listitem">
                          <motion.div
                            className="module-card card glass"
                            onClick={() => navigate(mod.to)}
                            whileHover={{ y: -4, transition: { duration: 0.22 } }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Go to ${mod.title}`}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(mod.to)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="module-card__header">
                              <div className="module-num">{mod.num}</div>
                              <div 
                                className="module-card__icon"
                                style={{ color: mod.color }}
                              >
                                {ModIcon && <ModIcon size={20} />}
                              </div>
                            </div>
                            <div className="module-title">{mod.title}</div>
                            <div className="module-desc">{mod.desc}</div>
                            {mod.sub && (
                              <div className="module-sub" style={{ color: mod.color }}>
                                {mod.sub}
                              </div>
                            )}
                            <div className="module-card__arrow" style={{ color: mod.color }}>
                              <ArrowRight size={18} />
                            </div>
                          </motion.div>
                        </StaggerItem>
                      );
                    })}
                  </div>
                </StaggerContainer>
              </div>

              {/* Right sidebar panels */}
              <div className="sidebar-panels">
                {/* Delivery rate */}
                <Reveal delay={0.5} direction="left">
                  <div className="card glass mini-panel">
                    <div className="mini-panel__header">
                      <Truck size={16} style={{ color: 'var(--accent)' }} />
                      <div className="panel-label">Delivery Rate</div>
                    </div>
                    <div className="panel-value">
                      {stats?.orders?.total > 0 
                        ? ((stats.orders.delivered / stats.orders.total) * 100).toFixed(1) 
                        : 0}%
                    </div>

                    <div className="tm-db-chart" role="img" aria-label="Delivery rate sparkline chart">
                      {[30, 55, 40, 80, 60, 100, stats?.orders?.total > 0 ? (stats.orders.delivered / stats.orders.total * 100) : 70].map((h, i) => (
                        <motion.div
                          key={i}
                          className="tm-db-bar"
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.6 + i * 0.06, duration: 0.4, ease: 'easeOut' }}
                          style={{
                            height: `${Math.max(10, h)}%`,
                            background: i === 5 ? 'var(--accent)' : 'var(--accent-soft)',
                            transformOrigin: 'bottom',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </Reveal>

                {/* Collection progress */}
                <Reveal delay={0.65}>
                  <div
                    className="card glass hover-glow collection-card"
                    onClick={() => navigate('/checklist')}
                    role="button"
                    tabIndex={0}
                    aria-label="View SS25 Luxury Pret checklist - 78% complete"
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/checklist')}
                  >
                    <div className="collection-card__header">
                      <Clock size={16} style={{ color: 'var(--secondary)' }} />
                      <div className="panel-label">Phase 7 Planning</div>
                    </div>
                    <div className="panel-value collection-card__title">SS25 Luxury Pret</div>

                    {/* Progress bar */}
                    <div className="collection-card__progress">
                      <motion.div
                        className="collection-card__progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                      />
                    </div>

                    <div className="collection-card__footer">
                      <CheckCircle2 size={12} />
                      78% complete - click to view checklist
                    </div>
                  </div>
                </Reveal>

                {/* Quick actions */}
                <Reveal delay={0.8}>
                  <div className="card glass quick-actions-card">
                    <div className="section-label" id="quick-actions-label">
                      <Sparkles size={14} style={{ color: 'var(--accent)' }} />
                      Quick Actions
                    </div>
                    <nav aria-labelledby="quick-actions-label" className="quick-actions-list">
                      {QUICK_ACTIONS.slice(0, 4).map(a => {
                        const ActionIcon = a.IconComponent;
                        return (
                          <motion.button
                            key={a.label}
                            className="quick-action-button"
                            onClick={() => navigate(a.to)}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.18 }}
                            aria-label={`${a.label} - ${a.desc}`}
                          >
                            <span className="action-icon" style={{ background: a.gradient }}>
                              {ActionIcon && <ActionIcon size={16} />}
                            </span>
                            <div className="action-content">
                              <div className="action-label">{a.label}</div>
                              <div className="action-desc">{a.desc}</div>
                            </div>
                            <ChevronRight size={16} className="action-arrow" />
                          </motion.button>
                        );
                      })}
                    </nav>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* EXTENDED ANALYTICS GRID */}
            <div className="analytics-grid">
              
              {/* Best Selling Products */}
              <Reveal delay={0.2} direction="up">
                <div className="card glass analytics-card">
                  <div className="analytics-card__header">
                    <div className="analytics-card__icon" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)' }}>
                      <TrendingUp size={18} />
                    </div>
                    <div className="section-label">Best Selling Items</div>
                  </div>
                  {stats?.topProducts?.length > 0 ? (
                    <div className="analytics-list">
                      {stats.topProducts.map((p, i) => (
                        <div key={p._id} className="analytics-list__item">
                          <div className="analytics-list__rank">{String(i + 1).padStart(2, '0')}</div>
                          <div className="analytics-list__info">
                            <div className="analytics-list__name">{p.name || p._id}</div>
                            <div className="analytics-list__meta">Sold: {p.sold}</div>
                          </div>
                          <div className="analytics-list__value" style={{ color: 'var(--accent)' }}>
                            {formatCurrency(p.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="analytics-empty">No sales data yet.</div>
                  )}
                </div>
              </Reveal>

              {/* Customer LTV */}
              <Reveal delay={0.3} direction="up">
                <div className="card glass analytics-card">
                  <div className="analytics-card__header">
                    <div className="analytics-card__icon" style={{ background: 'linear-gradient(135deg, var(--emerald) 0%, #059669 100%)' }}>
                      <Users size={18} />
                    </div>
                    <div className="section-label">Top Customers (LTV)</div>
                  </div>
                  {stats?.topCustomers?.length > 0 ? (
                    <div className="analytics-list">
                      {stats.topCustomers.map((c, i) => (
                        <div key={c._id} className="analytics-list__item">
                          <div className="analytics-list__avatar">
                            {c.fullName?.charAt(0) || 'C'}
                          </div>
                          <div className="analytics-list__info">
                            <div className="analytics-list__name">{c.fullName}</div>
                            <div className="analytics-list__meta">{c.totalOrders} Orders | {c.segment || 'Regular'}</div>
                          </div>
                          <div className="analytics-list__value" style={{ color: 'var(--emerald)' }}>
                            {formatCurrency(c.totalSpent)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="analytics-empty">No customer data yet.</div>
                  )}
                </div>
              </Reveal>

              {/* Low Stock Alerts */}
              <Reveal delay={0.4} direction="up">
                <div className={`card glass analytics-card ${stats?.lowStock?.length > 0 ? 'analytics-card--alert' : ''}`}>
                  <div className="analytics-card__header">
                    <div 
                      className="analytics-card__icon" 
                      style={{ background: stats?.lowStock?.length > 0 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, var(--gold) 0%, #d97706 100%)' 
                      }}
                    >
                      <AlertTriangle size={18} />
                    </div>
                    <div className="section-label" style={{ color: stats?.lowStock?.length > 0 ? '#ef4444' : 'inherit' }}>
                      Low Stock Alerts
                    </div>
                  </div>
                  {stats?.lowStock?.length > 0 ? (
                    <div className="analytics-list">
                      {stats.lowStock.map((p) => (
                        <div key={p._id} className="analytics-list__item">
                          <div className="analytics-list__info">
                            <div className="analytics-list__name">{p.name}</div>
                            <div className="analytics-list__meta">SKU: {p.sku || 'N/A'}</div>
                          </div>
                          <div 
                            className="analytics-list__badge"
                            style={{ 
                              background: p.stockQty === 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                              color: p.stockQty === 0 ? '#ef4444' : '#fbbf24',
                            }}
                          >
                            {p.stockQty} Left
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="analytics-empty analytics-empty--success">
                      <CheckCircle2 size={20} style={{ color: 'var(--emerald)', marginBottom: 8 }} />
                      Inventory levels are healthy.
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Returns Breakdown */}
              <Reveal delay={0.5} direction="up">
                <div className="card glass analytics-card">
                  <div className="analytics-card__header">
                    <div className="analytics-card__icon" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-deep) 100%)' }}>
                      <RotateCcw size={18} />
                    </div>
                    <div className="section-label">Return Reasons</div>
                  </div>
                  {stats?.returns?.byReason?.length > 0 ? (
                    <div className="analytics-chart">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={stats.returns.byReason}
                            dataKey="count"
                            nameKey="_id"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            stroke="none"
                          >
                            {stats.returns.byReason.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: 'var(--bg-layer1)', 
                              border: '1px solid var(--border-glass)', 
                              borderRadius: 8 
                            }} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            wrapperStyle={{ fontSize: '0.8rem', opacity: 0.8 }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="analytics-empty">No return data available.</div>
                  )}
                </div>
              </Reveal>
              
            </div>
          </>
        )}
      </div>
    </div>
  );
}
