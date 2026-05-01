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
      <div className="page-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div className="page-header-inner">
          <div className="dashboard-header-copy">
            <Reveal delay={0.05} direction="none">
              <div className="greeting-text">
                <div className="dashboard-live-indicator" style={{ background: 'var(--accent-soft)', padding: '4px 12px', border: '1px solid var(--accent-border)' }}>
                  <Activity size={12} className="pulse" />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>SYSTEM ACTIVE</span>
                </div>
                <span style={{ marginLeft: 12, opacity: 0.6 }}>{today}</span>
              </div>
            </Reveal>

            <div style={{ marginTop: 16 }}>
              <Reveal delay={0.1} direction="up">
                <span className="premium-gradient-text" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                  Atelier Command
                </span>
              </Reveal>
              <SplitText
                text={brand.name || 'LibasTrack'}
                tag="h1"
                className="page-title"
                style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginTop: 8, marginBottom: 8 }}
                delay={0.2}
                stagger={0.04}
              />
              <Reveal delay={0.5} direction="up">
                <p className="page-subtitle" style={{ fontSize: '1.1rem', maxWidth: 600 }}>
                  Welcome back, {user?.name?.split(' ')[0] || 'Creative Director'}. Your brand's performance metrics are optimized and ready for review.
                </p>
              </Reveal>
            </div>
          </div>

          <Reveal delay={0.6} direction="left">
            <div className="header-actions dashboard-header-actions" style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/orders')}
                style={{ height: 56, padding: '0 32px', borderRadius: 16, fontSize: '0.95rem', fontWeight: 700 }}
              >
                <Plus size={20} />
                New Order
              </button>
            </div>
          </Reveal>
        </div>
      </div>


      {/* PAGE BODY */}
      <div className="page-body" style={{ paddingTop: 0 }}>
        {loading ? (
          <div className="page-loader" style={{ height: '50vh' }}>
            <div className="spinner" />
          </div>
        ) : loadError ? (
          <QueryErrorState message={loadError} onRetry={fetchStats} />
        ) : (
          <StaggerContainer
            staggerDelay={0.08}
            delayStart={0.1}
            className="bento-grid"
            style={{ perspective: 1200 }}
          >
            {/* HERO METRICS - Tile 1-4 */}
            {statCards.map((s, i) => {
              const IconComponent = STAT_ICONS[s.label];
              return (
                <StaggerItem key={s.label} className="bento-tile bento-tile--hero">
                  <div 
                    className="glass-premium" 
                    style={{ height: '100%', padding: 28, borderRadius: 24, '--aura-color': s.color }}
                  >
                    <div className="card-noise" />
                    <div className="card-inner-glow" />
                    
                    <div className="stat-card__header" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="stat-icon-floating" style={{ background: s.gradient, width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}>
                        {IconComponent && <IconComponent size={24} />}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="stat-label" style={{ fontSize: '0.65rem', letterSpacing: '0.2em', fontWeight: 900, opacity: 0.5, textTransform: 'uppercase' }}>{s.label}</div>
                        <div className={`stat-sub ${s.trend === 'up' ? 'up' : 'neutral'}`} style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: 4 }}>
                          {s.trend === 'up' ? '↑ 14.2%' : 'STABLE'}
                        </div>
                      </div>
                    </div>

                    <div className="stat-value" style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', marginBottom: 4, letterSpacing: '-0.02em' }}>
                      {s.isCurrency
                        ? formatCurrency(s.value)
                        : <AnimatedCounter value={s.value} delay={0.5 + i * 0.1} />}
                    </div>
                    
                    <div style={{ height: 4, width: 40, background: s.color, borderRadius: 2, opacity: 0.4 }} />
                  </div>
                </StaggerItem>
              );
            })}

            {/* REVENUE CHART - Tile 5 */}
            <StaggerItem className="bento-tile bento-tile--chart">
              <div 
                className="glass-premium" 
                style={{ height: '100%', padding: 32, borderRadius: 28 }}
              >
                <div className="card-noise" />
                <div className="card-inner-glow" />
                <div className="card-header" style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between' }}>
                  <div className="card-header__left">
                    <div className="stat-icon-floating" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={22} />
                    </div>
                    <div style={{ marginLeft: 16 }}>
                       <h2 className="card-title" style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.01em' }}>Revenue Growth</h2>
                       <p className="card-subtitle" style={{ fontSize: '0.85rem', opacity: 0.4 }}>Institutional performance metrics</p>
                    </div>
                  </div>
                  <div className="dashboard-live-indicator" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', height: 28 }}>
                    <Wifi size={12} />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800 }}>LIVE SYNC</span>
                  </div>
                </div>

                <div className="chart-container" style={{ height: 360 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData}>
                      <defs>
                        <linearGradient id="vibeCyan" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} strokeDasharray="6 6" stroke="rgba(255,255,255,0.03)" />
                      <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 700 }} dy={15} />
                      <Tooltip content={<PremiumTooltip formatCurrency={formatCurrency} />} cursor={{ stroke: 'var(--accent)', strokeWidth: 2, strokeDasharray: '6 6' }} />
                      <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={5} fill="url(#vibeCyan)" animationDuration={2500} dot={false} activeDot={{ r: 8, fill: 'var(--accent)', stroke: 'white', strokeWidth: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </StaggerItem>

            {/* MODULE SHORTCUTS - Tile 6 */}
            <StaggerItem className="bento-tile bento-tile--wide">
              <div className="grid-2x2" style={{ height: '100%', gap: 24 }}>
                {modules.map((mod) => {
                  const ModIcon = MODULE_ICONS[mod.title];
                  return (
                    <div
                      key={mod.title}
                      className="glass-premium"
                      onClick={() => navigate(mod.to)}
                      style={{ height: '100%', padding: 28, borderRadius: 24, cursor: 'pointer' }}
                    >
                      <div className="card-noise" />
                      <div className="card-inner-glow" />
                      <div className="module-card__header" style={{ marginBottom: 16 }}>
                        <div className="module-num" style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.3 }}>{mod.num}</div>
                        <div className="stat-icon-floating" style={{ color: mod.color }}>
                          {ModIcon && <ModIcon size={24} />}
                        </div>
                      </div>
                      <div className="module-title" style={{ fontSize: '1.2rem', fontWeight: 900 }}>{mod.title}</div>
                      <div className="module-desc" style={{ fontSize: '0.85rem', opacity: 0.5, lineHeight: 1.4 }}>{mod.desc}</div>
                      <div className="module-card__arrow" style={{ color: mod.color, bottom: 24, right: 24 }}>
                        <ArrowRight size={22} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </StaggerItem>

            {/* COLLECTION PROGRESS - Tile 7 */}
            <StaggerItem className="bento-tile bento-tile--wide">
              <div 
                className="glass-premium" 
                style={{ height: '100%', padding: 36, borderRadius: 28, cursor: 'pointer' }} 
                onClick={() => navigate('/checklist')}
              >
                <div className="card-noise" />
                <div className="card-inner-glow" />
                <div className="collection-card__header" style={{ marginBottom: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="stat-icon-floating" style={{ background: 'var(--secondary-soft)', color: 'var(--secondary)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={24} />
                  </div>
                  <div className="section-label" style={{ fontSize: '0.65rem', letterSpacing: '0.25em', fontWeight: 900 }}>PHASE 07 • STRATEGIC</div>
                </div>
                
                <h3 className="panel-value collection-card__title" style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: 32, letterSpacing: '-0.02em' }}>SS25 Luxury Pret</h3>

                <div className="collection-card__progress" style={{ height: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 99, marginBottom: 20, padding: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <motion.div
                    className="collection-card__progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 1.2 }}
                    style={{ background: 'linear-gradient(90deg, var(--secondary), var(--accent))', borderRadius: 99, height: '100%' }}
                  />
                </div>

                <div className="collection-card__footer" style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckCircle2 size={18} style={{ color: 'var(--secondary)' }} />
                  <span style={{ opacity: 0.7 }}>78% Critical Path Complete</span>
                </div>
              </div>
            </StaggerItem>

            {/* QUICK ACTIONS - Tile 8 */}
            <StaggerItem className="bento-tile bento-tile--tall">
              <div 
                className="glass-premium" 
                style={{ height: '100%', padding: 28, borderRadius: 28 }}
              >
                <div className="card-noise" />
                <div className="card-inner-glow" />
                <div className="section-label" style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.7rem', letterSpacing: '0.25em', fontWeight: 900, color: 'var(--accent)' }}>
                  <Sparkles size={16} className="pulse" />
                  SYSTEM COMMAND
                </div>
                <div className="quick-actions-list" style={{ display: 'grid', gap: 16 }}>
                  {QUICK_ACTIONS.slice(0, 4).map(a => {
                    const ActionIcon = a.IconComponent;
                    return (
                      <button
                        key={a.label}
                        className="quick-action-button"
                        onClick={() => navigate(a.to)}
                      >
                        <div className="action-icon-wrap" style={{ background: a.gradient }}>
                          {ActionIcon && <ActionIcon size={20} />}
                        </div>
                        <div className="action-content">
                          <div className="action-label" style={{ fontSize: '1rem', fontWeight: 800 }}>{a.label}</div>
                          <div style={{ fontSize: '0.75rem', opacity: 0.4, marginTop: 2 }}>Execute Module</div>
                        </div>
                        <ChevronRight size={18} className="action-arrow" style={{ opacity: 0.2, marginLeft: 'auto' }} />
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 'auto', paddingTop: 32 }}>
                   <div style={{ padding: 16, background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                     <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 4 }}>SECURITY ENFORCED</div>
                     <div style={{ fontSize: '0.75rem', opacity: 0.4 }}>Sync: 02:45:12 PM</div>
                   </div>
                </div>
              </div>
            </StaggerItem>

            {/* ANALYTICS: BEST SELLERS - Tile 9 */}
            <StaggerItem className="bento-tile bento-tile--wide">
              <div 
                className="glass-premium" 
                style={{ height: '100%', padding: 32, borderRadius: 28 }}
              >
                <div className="card-noise" />
                <div className="card-inner-glow" />
                <div className="analytics-card__header" style={{ marginBottom: 32 }}>
                  <div className="stat-icon-floating" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <TrendingUp size={20} />
                  </div>
                  <div className="section-label" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', fontWeight: 900, marginLeft: 16 }}>ELITE COLLECTIONS</div>
                </div>
                {stats?.topProducts?.length > 0 ? (
                  <div className="analytics-list" style={{ gap: 14 }}>
                    {stats.topProducts.slice(0, 3).map((p, i) => (
                      <div key={p._id} className="analytics-list__item" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="analytics-list__rank" style={{ fontSize: '0.8rem', fontWeight: 900, opacity: 0.2 }}>{String(i + 1).padStart(2, '0')}</div>
                        <div className="analytics-list__info" style={{ marginLeft: 12 }}>
                          <div className="analytics-list__name" style={{ fontSize: '1rem', fontWeight: 800 }}>{p.name || p._id}</div>
                          <div className="analytics-list__meta" style={{ fontSize: '0.8rem', opacity: 0.4 }}>Market Dominance: {p.sold} units</div>
                        </div>
                        <div className="analytics-list__value" style={{ color: 'var(--accent)', fontWeight: 900, fontSize: '1.1rem' }}>
                          {formatCurrency(p.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analytics-empty">Collecting trend data...</div>
                )}
              </div>
            </StaggerItem>

            {/* ANALYTICS: TOP CUSTOMERS - Tile 10 */}
            <StaggerItem className="bento-tile bento-tile--wide">
              <div 
                className="glass-premium" 
                style={{ height: '100%', padding: 32, borderRadius: 28 }}
              >
                <div className="card-noise" />
                <div className="card-inner-glow" />
                <div className="analytics-card__header" style={{ marginBottom: 32 }}>
                  <div className="stat-icon-floating" style={{ background: 'linear-gradient(135deg, var(--emerald) 0%, #059669 100%)', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Users size={20} />
                  </div>
                  <div className="section-label" style={{ fontSize: '0.7rem', letterSpacing: '0.2em', fontWeight: 900, marginLeft: 16 }}>VIP PATRONAGE</div>
                </div>
                {stats?.topCustomers?.length > 0 ? (
                  <div className="analytics-list" style={{ gap: 14 }}>
                    {stats.topCustomers.slice(0, 3).map((c, i) => (
                      <div key={c._id} className="analytics-list__item" style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 20px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div className="analytics-list__avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', fontWeight: 800, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', borderRadius: 12 }}>
                          {c.fullName?.charAt(0) || 'C'}
                        </div>
                        <div className="analytics-list__info" style={{ marginLeft: 16 }}>
                          <div className="analytics-list__name" style={{ fontSize: '1rem', fontWeight: 800 }}>{c.fullName}</div>
                          <div className="analytics-list__meta" style={{ fontSize: '0.8rem', opacity: 0.4 }}>{c.segment || 'Platinum Tier'} • {c.totalOrders} Orders</div>
                        </div>
                        <div className="analytics-list__value" style={{ color: 'var(--emerald)', fontWeight: 900, fontSize: '1.1rem' }}>
                          {formatCurrency(c.totalSpent)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="analytics-empty">Analyzing client retention...</div>
                )}
              </div>
            </StaggerItem>

          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
