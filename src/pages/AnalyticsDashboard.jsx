import React, { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { CATEGORIES } from '../data/categories';
import { DEPARTMENTS } from '../data/departments';
import { 
  BarChart3, TrendingUp, PieChart, CheckCircle2, Clock, 
  AlertTriangle, Download, Calendar, Layers, ShieldCheck, MapPin
} from 'lucide-react';

export function AnalyticsDashboard() {
  const { allComplaintsRaw: complaints, stats } = useComplaints();
  const [dateRange, setDateRange] = useState('30days');

  // Calculate Category Distribution
  const categoryCounts = CATEGORIES.map(cat => {
    const count = complaints.filter(c => c.category === cat.id).length;
    return {
      id: cat.id,
      name: cat.name,
      count,
      color: cat.color,
      slaHours: cat.slaHours
    };
  });

  const maxCategoryCount = Math.max(...categoryCounts.map(c => c.count), 1);

  // Department Performance
  const departmentStats = DEPARTMENTS.map(dept => {
    const deptComplaints = complaints.filter(c => c.departmentId === dept.id);
    const resolvedCount = deptComplaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
    const rate = deptComplaints.length > 0 
      ? Math.round((resolvedCount / deptComplaints.length) * 100) 
      : 95;

    return {
      ...dept,
      currentActive: deptComplaints.filter(c => ['SUBMITTED', 'UNDER REVIEW', 'ASSIGNED', 'IN PROGRESS'].includes(c.status)).length,
      currentResolved: resolvedCount,
      rate
    };
  });

  // Ward Breakdown
  const wardBreakdown = [
    { ward: 'Ward 82 - East Zone', total: 42, resolved: 38, rate: '90.4%' },
    { ward: 'Ward 54 - South Zone', total: 36, resolved: 34, rate: '94.4%' },
    { ward: 'Ward 35 - West Zone', total: 29, resolved: 25, rate: '86.2%' },
    { ward: 'Ward 68 - South-East Zone', total: 31, resolved: 29, rate: '93.5%' },
    { ward: 'Ward 150 - Outer Ring Zone', total: 24, resolved: 21, rate: '87.5%' }
  ];

  // Monthly trends mock data
  const monthlyTrends = [
    { month: 'Apr', received: 120, resolved: 112 },
    { month: 'May', received: 145, resolved: 139 },
    { month: 'Jun', received: 198, resolved: 182 }, // monsoon spike
    { month: 'Jul', received: 240, resolved: 228 }, // heavy rains
    { month: 'Aug', received: 185, resolved: 178 },
    { month: 'Sep', received: 160, resolved: 154 }
  ];

  const maxMonthly = 250;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Open Municipal Data
            </span>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Civic Performance Transparency</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Civic Grievance Analytics & SLA Audit
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Real-time public metrics tracking municipal turnaround efficiency and citizen satisfaction scores.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="form-select"
            style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="quarter">This Quarter</option>
            <option value="year">Year 2026</option>
          </select>

          <button 
            className="btn btn-secondary"
            onClick={() => window.print()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={16} />
            <span>Export Civic PDF</span>
          </button>
        </div>
      </div>

      {/* Top Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>OVERALL RESOLUTION RATE</span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10b981', margin: '0.4rem 0' }}>
            94.8%
          </div>
          <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
            ↑ 2.4% vs previous quarter
          </span>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>AVG TURNAROUND TIME</span>
            <Clock size={16} color="#2563eb" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2563eb', margin: '0.4rem 0' }}>
            28.4 <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Hours</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#2563eb' }}>
            Citizen SLA Target: 48.0 Hours
          </span>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CITIZEN SATISFACTION</span>
            <CheckCircle2 size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#8b5cf6', margin: '0.4rem 0' }}>
            4.8 <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>/ 5.0</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Based on post-resolution feedback
          </span>
        </div>

        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <span>CRITICAL ESCALATIONS</span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ef4444', margin: '0.4rem 0' }}>
            {stats.escalated} <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Active</span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>
            Monitored by Commissioner Desk
          </span>
        </div>
      </div>

      {/* Row 2: Category Breakdown & Monthly Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Category Breakdown Chart */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              Complaints Volume by Category
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Top Grievances</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categoryCounts.slice(0, 6).map(c => {
              const percentage = Math.round((c.count / (complaints.length || 1)) * 100);
              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
                    <span style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                      {c.count} tickets ({percentage}%)
                    </span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div 
                      style={{ 
                        height: '100%', 
                        width: `${Math.max(percentage, 10)}%`, 
                        background: c.color, 
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Complaint Inflow vs Resolved Trend */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              6-Month Grievance Inflow vs Resolution
            </h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '2px' }} /> Received
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '2px' }} /> Resolved
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '220px', paddingTop: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            {monthlyTrends.map((item, idx) => {
              const heightReceived = (item.received / maxMonthly) * 180;
              const heightResolved = (item.resolved / maxMonthly) * 180;

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                    <div 
                      style={{ 
                        width: '18px', 
                        height: `${heightReceived}px`, 
                        background: '#3b82f6', 
                        borderRadius: '4px 4px 0 0' 
                      }} 
                      title={`Received: ${item.received}`}
                    />
                    <div 
                      style={{ 
                        width: '18px', 
                        height: `${heightResolved}px`, 
                        background: '#10b981', 
                        borderRadius: '4px 4px 0 0' 
                      }} 
                      title={`Resolved: ${item.resolved}`}
                    />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{item.month}</span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '8px' }}>
            Peak volume observed in Monsoon season (June-July) due to stormwater clogging & potholes.
          </div>
        </div>
      </div>

      {/* Row 3: Department Scorecard */}
      <div className="card" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
          Municipal Department Performance Scorecard
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Name</th>
                <th>Executive In-Charge</th>
                <th>Active Tickets</th>
                <th>Resolved (This Month)</th>
                <th>SLA Compliance</th>
                <th>Performance Status</th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map(dept => (
                <tr key={dept.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Code: {dept.code}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#334155' }}>
                    {dept.headOfficer}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#2563eb' }}>
                      {dept.currentActive + dept.activeComplaints}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#10b981' }}>
                      {dept.resolvedThisMonth}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{dept.slaCompliance}</strong>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      background: dept.slaCompliance.startsWith('9') ? '#dcfce7' : '#fef9c3',
                      color: dept.slaCompliance.startsWith('9') ? '#166534' : '#854d0e'
                    }}>
                      {dept.slaCompliance.startsWith('9') ? 'Excellent' : 'Satisfactory'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
