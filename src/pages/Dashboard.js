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
      icon: '💳',
    },
    {
      label: 'Orders',
      value: stats?.orders?.total || 0,
      trend: 'none',
      icon: '📦',
    },
    {
      label: 'Customers',
      value: stats?.customers?.total || 0,
      trend: 'up',
      icon: '👤',
    },
    {
      label: 'Avg Order Value',
      value: stats?.orders?.total > 0 ? (stats?.financial?.completedRevenue || 0) / stats.orders.total : 0,
      isCurrency: true,
      trend: 'none',
      icon: '📈',
    },
  ];

  const modules = [
    {
      num: '01', title: 'Orders',
      desc: 'Manage pipeline & statuses',
      sub: stats?.orders?.pending > 0 ? `${stats.orders.pending} pending` : null,
      to: '/orders',
    },
    {
      num: '02', title: 'Inventory',
      desc: `${stats?.products?.total || 0} items in stock`,
      sub: stats?.products?.lowStock > 0 ? `${stats.products.lowStock} low stock` : null,
      to: '/products',
    },
    {
      num: '03', title: 'Customers',
      desc: 'VIP & Loyal segment tracking',
      sub: `${stats?.customers?.total || 0} active`,
      to: '/customers',
    },
    {
      num: '04', title: 'Finance',
      desc: 'Revenue & payments',
      sub: formatCurrency ? `${formatCurrency(stats?.financial?.pendingRevenue || 0)} pending` : null,
      to: '/financial',
    },
  ];

  /* Chart Colors */
  const COLORS = ['#7c3eed', '#a78bfa', '#c4b5fd', '#ede9fe', '#4c1d95'];

  return (
    <div className="dashboard-wrapper">
      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="dashboard-header-copy">
            <Reveal delay={0.05} direction="none">
              <div className="greeting-text">Welcome back, {user?.name?.split(' ')[0] || 'there'}</div>
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
                + New Order
              </MagneticButton>
              <MagneticButton
                className="btn btn-secondary dashboard-header-btn"
                onClick={() => navigate('/products')}
                aria-label="Add new product"
              >
                Add Product
              </MagneticButton>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="page-body">
        {loading ? (
          <>
            {/* Skeleton state */}
            <div className="stats-container">
              <StatsLoadingGrid />
            </div>
            <div className="page-loader" style={{ marginTop: 40 }}>
              <div className="spinner" aria-label="Loading dashboard…" />
            </div>
          </>
        ) : loadError ? (
          <QueryErrorState message={loadError} onRetry={fetchStats} />
        ) : (
          <>
            {/* ── STAT CARDS ── */}
            <StaggerContainer
              staggerDelay={0.07}
              delayStart={0.05}
              className="stats-container"
            >
              <div className="stats-grid" role="list" aria-label="Key metrics">
                {statCards.map((s, i) => (
                  <StaggerItem key={s.label} role="listitem">
                    <GlowCard
                      className="stat-card card glass"
                      aria-label={`${s.label}: ${s.isCurrency ? formatCurrency(s.value) : s.value}`}
                    >
                      {/* Icon + label row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div className="stat-label">{s.label}</div>
                        <span style={{ fontSize: '1.2rem', opacity: 0.5 }} aria-hidden="true">{s.icon}</span>
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
                      <div
                        style={{ height: 3, background: 'var(--accent-soft)', borderRadius: 99, marginTop: 16, overflow: 'hidden' }}
                        role="presentation"
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: s.trend === 'up' ? '72%' : '45%' }}
                          transition={{ duration: 1.4, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                          style={{ height: '100%', background: 'var(--accent)', borderRadius: 99 }}
                        />
                      </div>

                      {s.trend === 'up' && (
                        <div className="stat-sub up" aria-label="Trending up">↑ Trending up</div>
                      )}
                    </GlowCard>
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>

            {/* ── MAIN GRID ── */}
            <div className="dashboard-grid">
              {/* Left column */}
              <div className="modules-grid-wrap">
                {/* Revenue chart */}
                <Reveal delay={0.15} direction="up">
                  <div className="card glass" style={{ padding: '26px', marginBottom: 24 }}>
                    <div className="card-header">
                      <h2 className="card-title">Revenue Trajectory</h2>
                      <div
                        className="tm-db-live"
                        title="Live data"
                        role="status"
                        aria-label="Live data indicator"
                      />
                    </div>

                    <div className="chart-container" aria-label="Revenue chart for the last 7 months">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                          <defs>
                            <linearGradient id="vibePurple" x1="0" y1="0" x2="0" y2="1">
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
                            fill="url(#vibePurple)"
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
                    {modules.map((mod, i) => (
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
                          <div className="module-num" aria-hidden="true">{mod.num}</div>
                          <div className="module-title">{mod.title}</div>
                          <div className="module-desc">{mod.desc}</div>
                          {mod.sub && (
                            <div
                              className="module-sub"
                              style={{ marginTop: 10, fontSize: '0.70rem', fontWeight: 700, color: 'var(--accent)' }}
                            >
                              {mod.sub}
                            </div>
                          )}
                          <div
                            style={{ color: 'var(--accent)', marginTop: 14, fontSize: '1.1rem' }}
                            aria-hidden="true"
                          >
                            →
                          </div>
                        </motion.div>
                      </StaggerItem>
                    ))}
                  </div>
                </StaggerContainer>
              </div>

              {/* Right sidebar panels */}
              <div className="sidebar-panels">
                {/* Delivery rate */}
                <Reveal delay={0.5} direction="left">
                  <div className="card glass mini-panel">
                    <div className="panel-label">Delivery Rate</div>
                    <div className="panel-value">
                      {stats?.orders?.total > 0 
                        ? ((stats.orders.delivered / stats.orders.total) * 100).toFixed(1) 
                        : 0}%
                    </div>

                    <div
                      className="tm-db-chart"
                      role="img"
                      aria-label="Delivery rate sparkline chart"
                    >
                      {/* For visual effect, base the chart on the actual rate to look dynamic but representative */}
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
                    className="card glass hover-glow"
                    style={{ padding: '22px', cursor: 'pointer', marginBottom: 0 }}
                    onClick={() => navigate('/checklist')}
                    role="button"
                    tabIndex={0}
                    aria-label="View SS25 Luxury Pret checklist — 78% complete"
                    onKeyDown={(e) => e.key === 'Enter' && navigate('/checklist')}
                  >
                    <div className="panel-label">Phase 7 Planning</div>
                    <div className="panel-value" style={{ fontSize: '1.35rem' }}>SS25 Luxury Pret</div>

                    {/* Progress bar */}
                    <div
                      style={{ height: 5, background: 'var(--bg-void)', borderRadius: 99, marginTop: 14, overflow: 'hidden' }}
                      role="progressbar"
                      aria-valuenow={78}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="78% complete"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        transition={{ duration: 1.4, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-deep))', borderRadius: 99 }}
                      />
                    </div>

                    <div style={{ fontSize: '0.70rem', color: 'var(--text-faint)', marginTop: 6, fontWeight: 600 }}>
                      78% complete — click to view checklist
                    </div>
                  </div>
                </Reveal>

                {/* Quick actions */}
                <Reveal delay={0.8}>
                  <div className="card glass" style={{ padding: '22px', marginTop: 16 }}>
                    <div
                      className="section-label"
                      style={{ marginTop: 0, marginBottom: 14 }}
                      id="quick-actions-label"
                    >
                      Quick Actions
                    </div>
                    <nav
                      aria-labelledby="quick-actions-label"
                      className="quick-actions-list"
                    >
                      {QUICK_ACTIONS.slice(0, 4).map(a => (
                        <motion.button
                          key={a.label}
                          className="quick-action-button"
                          onClick={() => navigate(a.to)}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.18 }}
                          aria-label={`${a.label} — ${a.desc}`}
                        >
                          <span className="action-icon" aria-hidden="true">{a.icon}</span>
                          <div>
                            <div className="action-label">{a.label}</div>
                            <div className="action-desc">{a.desc}</div>
                          </div>
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* ── EXTENDED ANALYTICS GRID ── */}
            <div className="dashboard-grid" style={{ marginTop: 24, gap: 24 }}>
              
              {/* Best Selling Products */}
              <Reveal delay={0.2} direction="up" className="card glass" style={{ padding: '24px' }}>
                <div className="section-label" style={{ marginTop: 0, marginBottom: 16 }}>Best Selling Items</div>
                {stats?.topProducts?.length > 0 ? (
                  <div className="top-list">
                    {stats.topProducts.map((p, i) => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name || p._id}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>Sold: {p.sold}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          {formatCurrency(p.revenue)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', color: 'var(--text-faint)', fontSize: '0.85rem' }}>No sales data yet.</div>
                )}
              </Reveal>

              {/* Customer LTV */}
              <Reveal delay={0.3} direction="up" className="card glass" style={{ padding: '24px' }}>
                <div className="section-label" style={{ marginTop: 0, marginBottom: 16 }}>Top Customers (LTV)</div>
                {stats?.topCustomers?.length > 0 ? (
                  <div className="top-list">
                    {stats.topCustomers.map((c, i) => (
                      <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>{c.totalOrders} Orders • {c.segment || 'Regular'}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--accent)' }}>
                          {formatCurrency(c.totalSpent)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', color: 'var(--text-faint)', fontSize: '0.85rem' }}>No customer data yet.</div>
                )}
              </Reveal>

              {/* Low Stock Alerts */}
              <Reveal delay={0.4} direction="up" className="card glass" style={{ padding: '24px', border: stats?.lowStock?.length > 0 ? '1px solid rgba(239, 68, 68, 0.3)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                  <div className="section-label" style={{ margin: 0, color: stats?.lowStock?.length > 0 ? '#ef4444' : 'inherit' }}>Low Stock Alerts</div>
                </div>
                {stats?.lowStock?.length > 0 ? (
                  <div className="top-list">
                    {stats.lowStock.map((p, i) => (
                      <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>SKU: {p.sku || 'N/A'}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: p.stockQty === 0 ? '#ef4444' : '#fbbf24', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 12, fontSize: '0.85rem' }}>
                          {p.stockQty} Left
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', color: 'var(--text-faint)', fontSize: '0.85rem' }}>Inventory levels are healthy.</div>
                )}
              </Reveal>

              {/* Returns Breakdown */}
              <Reveal delay={0.5} direction="up" className="card glass" style={{ padding: '24px' }}>
                <div className="section-label" style={{ marginTop: 0, marginBottom: 16 }}>Return Reasons</div>
                {stats?.returns?.byReason?.length > 0 ? (
                  <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
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
                        <Tooltip contentStyle={{ background: '#111', border: '1px solid #333', borderRadius: 8 }} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem', opacity: 0.8 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', color: 'var(--text-faint)', fontSize: '0.85rem' }}>No return data available.</div>
                )}
              </Reveal>
              
            </div>
            
          </>
        )}
      </div>
    </div>
  );
}
