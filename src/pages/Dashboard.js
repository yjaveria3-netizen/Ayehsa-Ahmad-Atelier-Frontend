import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders, customers, financial] = await Promise.all([
          api.get('/products/stats/summary'),
          api.get('/orders/stats/summary'),
          api.get('/customers/stats/summary'),
          api.get('/financial/stats/summary'),
        ]);
        setStats({
          products: products.data,
          orders: orders.data,
          customers: customers.data,
          financial: financial.data,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatPKR = (n) => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 className="page-title">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <em style={{ fontStyle:'italic', color:'var(--gold)' }}>{user?.name?.split(' ')[0]}</em>
            </h1>
            <p className="page-subtitle">Here's what's happening with your atelier today.</p>
          </div>
          {user?.driveConnected ? (
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'0.8rem', color:'var(--text-muted)', padding:'6px 14px', background:'rgba(90,158,122,0.08)', border:'1px solid rgba(90,158,122,0.2)', borderRadius:'99px' }}>
              <span className="sync-dot" /> Syncing to Google Sheets
            </div>
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/drive-setup')}>
              ⊞ Connect Google Drive
            </button>
          )}
        </div>
      </div>

      <div className="page-body">
        {!user?.driveConnected && (
          <div className="drive-banner">
            <span className="drive-banner-icon">⊞</span>
            <div className="drive-banner-text">
              <h4>Connect your Google Drive</h4>
              <p>Your data will sync live to Google Sheets in your Drive folder. Set it up in under 2 minutes.</p>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/drive-setup')}>Setup Now</button>
          </div>
        )}

        {loading ? (
          <div className="page-loader"><div className="spinner" /></div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card" onClick={() => navigate('/products')} style={{ cursor:'pointer' }}>
                <div className="stat-icon">◆</div>
                <div className="stat-value">{stats?.products?.total || 0}</div>
                <div className="stat-label">Total Products</div>
                {stats?.products?.lowStock > 0 && (
                  <div className="stat-change" style={{ color:'var(--warning)' }}>⚠ {stats.products.lowStock} low stock</div>
                )}
              </div>
              <div className="stat-card" onClick={() => navigate('/orders')} style={{ cursor:'pointer' }}>
                <div className="stat-icon">◇</div>
                <div className="stat-value">{stats?.orders?.total || 0}</div>
                <div className="stat-label">Total Orders</div>
                {stats?.orders?.pending > 0 && (
                  <div className="stat-change" style={{ color:'var(--accent-slate)' }}>{stats.orders.pending} pending</div>
                )}
              </div>
              <div className="stat-card" onClick={() => navigate('/customers')} style={{ cursor:'pointer' }}>
                <div className="stat-icon">○</div>
                <div className="stat-value">{stats?.customers?.total || 0}</div>
                <div className="stat-label">Customers</div>
                {stats?.customers?.thisMonth > 0 && (
                  <div className="stat-change">+{stats.customers.thisMonth} this month</div>
                )}
              </div>
              <div className="stat-card" onClick={() => navigate('/financial')} style={{ cursor:'pointer' }}>
                <div className="stat-icon">◉</div>
                <div className="stat-value" style={{ fontSize:'1.4rem' }}>{formatPKR(stats?.financial?.completedRevenue)}</div>
                <div className="stat-label">Revenue Collected</div>
                <div className="stat-change" style={{ color:'var(--warning)' }}>
                  {formatPKR(stats?.financial?.pendingRevenue)} pending
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:16, marginBottom:32 }}>
              {[
                { label:'Add Product', desc:'Add a new product to inventory', icon:'◆', to:'/products', action:'add' },
                { label:'New Order', desc:'Record a customer order', icon:'◇', to:'/orders', action:'add' },
                { label:'Add Customer', desc:'Register a new customer', icon:'○', to:'/customers', action:'add' },
                { label:'Record Payment', desc:'Log a financial transaction', icon:'◉', to:'/financial', action:'add' },
              ].map(item => (
                <button key={item.label} onClick={() => navigate(item.to)} className="card" style={{
                  textAlign:'left', cursor:'pointer', background:'var(--bg-card)', border:'1px solid var(--border)',
                  display:'flex', alignItems:'center', gap:16, transition:'all 0.2s',
                  width:'100%',
                }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--radius)', background:'rgba(201,169,110,0.1)', border:'1px solid rgba(201,169,110,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', color:'var(--gold)', flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--text-primary)', marginBottom:2 }}>{item.label}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment methods breakdown */}
            {stats?.financial?.byMethod?.length > 0 && (
              <div className="card">
                <h3 className="card-title">Payment Methods Breakdown</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                  {stats.financial.byMethod.map(m => (
                    <div key={m._id} style={{ flex:'1 1 140px', padding:'14px 16px', background:'var(--bg-secondary)', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6 }}>{m._id}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'var(--gold)' }}>{m.count}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>{formatPKR(m.total)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
