import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const getHour = () => new Date().getHours();
const greeting = () => getHour() < 12 ? 'Good morning' : getHour() < 17 ? 'Good afternoon' : 'Good evening';

export default function Dashboard() {
  const { user, formatCurrency } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const brand = user?.brand || {};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, customers, financial, suppliers] = await Promise.all([
          api.get('/products/stats/summary').catch(() => ({ data: {} })),
          api.get('/orders/stats/summary').catch(() => ({ data: {} })),
          api.get('/customers/stats/summary').catch(() => ({ data: {} })),
          api.get('/financial/stats/summary').catch(() => ({ data: {} })),
          api.get('/suppliers/stats/summary').catch(() => ({ data: {} })),
        ]);
        setStats({ products: products.data, orders: orders.data, customers: customers.data, financial: financial.data, suppliers: suppliers.data });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  const STAT_CARDS = stats ? [
    { label:'Total Products', value: stats.products?.total || 0, sub: stats.products?.lowStock > 0 ? `${stats.products.lowStock} low stock` : null, subColor:'var(--warning)', nav:'/products', icon:'▣' },
    { label:'Total Orders', value: stats.orders?.total || 0, sub: stats.orders?.pending > 0 ? `${stats.orders.pending} pending` : null, subColor:'var(--info)', nav:'/orders', icon:'◫' },
    { label:'Customers', value: stats.customers?.total || 0, sub: stats.customers?.thisMonth > 0 ? `+${stats.customers.thisMonth} this month` : null, subColor:'var(--success)', nav:'/customers', icon:'⊕' },
    { label:'Revenue (Collected)', value: formatCurrency(stats.financial?.completedRevenue), sub: `${formatCurrency(stats.financial?.pendingRevenue)} pending`, subColor:'var(--warning)', nav:'/financial', icon:'$', isLarge:true },
    { label:'Active Suppliers', value: stats.suppliers?.active || 0, sub: `${stats.suppliers?.total || 0} total`, subColor:'var(--text-muted)', nav:'/suppliers', icon:'⊞' },
    { label:'Inventory Value', value: formatCurrency(stats.products?.totalValue), sub: `${stats.products?.categories || 0} categories`, subColor:'var(--text-muted)', nav:'/products', icon:'◈', isLarge:true },
  ] : [];

  const QUICK_ACTIONS = [
    { label:'New Order', desc:'Record a sale', icon:'◫', to:'/orders' },
    { label:'Add Product', desc:'Add to inventory', icon:'▣', to:'/products' },
    { label:'Add Customer', desc:'Register a buyer', icon:'⊕', to:'/customers' },
    { label:'Add Supplier', desc:'New supply contact', icon:'⊞', to:'/suppliers' },
    { label:'New Collection', desc:'Start a collection', icon:'▤', to:'/collections' },
    { label:'Record Payment', desc:'Log a transaction', icon:'$', to:'/financial' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:6, fontWeight:600 }}>
              {greeting()}, {user?.name?.split(' ')[0]}
            </div>
            <h1 className="page-title">{brand.name || 'Dashboard'}</h1>
            <p className="page-subtitle">
              {brand.category && <span style={{ background:'var(--teal-soft)', color:'var(--teal)', padding:'2px 8px', borderRadius:999, fontSize:'0.65rem', fontWeight:600, marginRight:8 }}>{brand.category}</span>}
              {brand.country} {brand.currency && `· ${brand.currency}`}
              {user?.driveConnected && <><span className="sync-dot" style={{ marginLeft:10 }} />Live sync active</>}
            </p>
          </div>
          {!user?.driveConnected && (
            <button className="btn btn-primary" onClick={() => navigate('/drive-setup')}>
              Connect Google Drive
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {!user?.driveConnected && (
          <div className="drive-banner">
            <span className="drive-banner-icon">⤴</span>
            <div className="drive-banner-text">
              <h4>Connect Google Drive to enable live sync</h4>
              <p>Every entry you make will sync instantly to your Google Sheets — products, orders, customers, financials.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/drive-setup')}>Setup Now</button>
          </div>
        )}

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {STAT_CARDS.map((s, i) => (
                <div key={i} className="stat-card" onClick={() => navigate(s.nav)} style={{ cursor:'pointer' }}>
                  <div className="stat-icon-bg">{s.icon}</div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ fontSize: s.isLarge ? '1.4rem' : undefined }}>{s.value}</div>
                  {s.sub && <div className="stat-change" style={{ color: s.subColor }}>{s.sub}</div>}
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="section-label">Quick Actions</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10, marginBottom:32 }}>
              {QUICK_ACTIONS.map(a => (
                <button key={a.label} onClick={() => navigate(a.to)} style={{
                  background:'var(--bg-surface)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius)', padding:'16px', textAlign:'left',
                  cursor:'pointer', transition:'all 0.15s ease',
                  display:'flex', flexDirection:'column', gap:6,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-bright)'; e.currentTarget.style.background='var(--teal-soft)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='var(--bg-surface)'; }}>
                  <span style={{ fontSize:'1.2rem', color:'var(--teal)' }}>{a.icon}</span>
                  <div style={{ fontFamily:'var(--font-heading)', fontSize:'0.9rem', color:'var(--text-primary)' }}>{a.label}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{a.desc}</div>
                </button>
              ))}
            </div>

            {/* Payment breakdown */}
            {stats?.financial?.byMethod?.length > 0 && (
              <>
                <div className="section-label">Payment Methods</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8, marginBottom:28 }}>
                  {stats.financial.byMethod.map(m => (
                    <div key={m._id} style={{ background:'var(--bg-surface)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px' }}>
                      <div style={{ fontSize:'0.62rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600, marginBottom:6 }}>{m._id}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--cream)', letterSpacing:'0.04em' }}>{m.count}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-secondary)', marginTop:3 }}>{formatCurrency(m.total)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Brand info strip */}
            {(brand.website || brand.instagram || brand.phone) && (
              <>
                <div className="section-label">Brand Info</div>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28 }}>
                  {brand.website && <a href={brand.website} target="_blank" rel="noreferrer" className="sheet-link">Website ↗</a>}
                  {brand.instagram && <a href={`https://instagram.com/${brand.instagram.replace('@','')}`} target="_blank" rel="noreferrer" className="sheet-link">Instagram {brand.instagram}</a>}
                  {brand.phone && <span className="sheet-link">{brand.phone}</span>}
                  {brand.address && <span className="sheet-link">{brand.city || brand.address}</span>}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
