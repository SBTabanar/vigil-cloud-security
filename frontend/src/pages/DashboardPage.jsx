import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Activity, AlertTriangle, Shield, Zap, TrendingUp, TrendingDown, Users, Globe, FileCheck, Cloud } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const getScoreColor = (s) => s >= 750 ? '#ef4444' : s >= 500 ? '#f97316' : s >= 300 ? '#eab308' : '#22c55e'

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{title}</span>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function ScoreRing({ score, label, size = 70 }) {
  const color = getScoreColor(score)
  const pct = Math.min(score / 10, 100)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `conic-gradient(${color} ${pct}%, #334155 ${pct}%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 8px'
      }}>
        <div style={{
          width: size - 10, height: size - 10, borderRadius: '50%',
          background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontSize: size > 60 ? 18 : 13, fontWeight: 700
        }}>
          {Math.round(score)}
        </div>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { apiFetch } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // Get user's orgs
        const orgRes = await apiFetch('/organizations')
        const orgs = await orgRes.json()
        if (orgs.length > 0) {
          const orgId = orgs[0].id
          localStorage.setItem('vigil_org_id', orgId)
          const dashRes = await apiFetch(`/organizations/${orgId}/dashboard`)
          const dashData = await dashRes.json()
          setData(dashData)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleScan = async () => {
    const orgId = localStorage.getItem('vigil_org_id')
    if (!orgId) return
    try {
      await apiFetch(`/organizations/${orgId}/scans`, { method: 'POST', body: JSON.stringify({ scan_type: 'full' }) })
      window.location.reload()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Loading dashboard...</div>

  // Empty state: no AWS accounts connected
  if (!data || data.summary.aws_accounts === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Globe size={36} color="#3b82f6" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>No AWS Account Connected</h2>
        <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Connect your AWS account to start scanning for misconfigurations, compliance gaps, and active attack patterns. It takes about 3 minutes.
        </p>
        <button onClick={() => navigate('/onboarding')}
          style={{ padding: '14px 32px', background: '#3b82f6', color: '#fff', borderRadius: 10, fontSize: 15, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Cloud size={18} /> Connect AWS Account
        </button>
      </div>
    )
  }

  const s = data.summary
  const sev = data.findings_by_severity

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc' }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.organization_name} · Last scan: {s.last_scan_at ? new Date(s.last_scan_at).toLocaleString() : 'Never'}</p>
        </div>
        <button onClick={handleScan}
          style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Zap size={16} /> Run New Scan
        </button>
      </div>

      {/* Score Rings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, marginBottom: 24 }}>
        <ScoreRing score={s.max_risk_score} label="Max Risk" />
        <ScoreRing score={s.avg_risk_score} label="Avg Risk" />
        <ScoreRing score={sev.critical * 50} label="Critical Exposure" />
        <ScoreRing score={s.auto_remediable / Math.max(s.total_findings, 1) * 1000} label="Auto-Fixable" />
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard title="Events Analyzed" value={s.total_events.toLocaleString()} icon={Activity} color="#3b82f6" sub="CloudTrail records" />
        <StatCard title="Attack Sequences" value={s.total_sequences.toLocaleString()} icon={AlertTriangle} color="#f97316" sub="Actor-grouped sessions" />
        <StatCard title="Malicious Flagged" value={s.malicious_sequences.toLocaleString()} icon={Shield} color="#ef4444" sub={`${(s.malicious_sequences / Math.max(s.total_sequences, 1) * 100).toFixed(1)}% of total`} />
        <StatCard title="Policy Violations" value={s.total_findings} icon={FileCheck} color="#eab308" sub={`${sev.critical} Critical · ${sev.high} High`} />
        <StatCard title="AWS Accounts" value={s.aws_accounts} icon={Globe} color="#22c55e" sub="Connected regions" />
        <StatCard title="Auto-Remediable" value={`${s.auto_remediable}/${s.total_findings}`} icon={TrendingUp} color="#3b82f6" sub={`${(s.auto_remediable / Math.max(s.total_findings, 1) * 100).toFixed(0)}% can be fixed automatically`} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Risk Timeline (30 Days)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.timeline}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }} />
              <Area type="monotone" dataKey="max_score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
              <Area type="monotone" dataKey="avg_score" stroke="#22c55e" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Findings by Severity</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { name: 'Critical', value: sev.critical, color: '#ef4444' },
              { name: 'High', value: sev.high, color: '#f97316' },
              { name: 'Medium', value: sev.medium, color: '#eab308' },
              { name: 'Low', value: sev.low || 0, color: '#22c55e' },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} width={60} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sev && Object.values(sev).map((_, i) => <Cell key={i} fill={['#ef4444', '#f97316', '#eab308', '#22c55e'][i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Actors */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Highest Risk Actors</div>
        {data.top_actors.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < data.top_actors.length - 1 ? '1px solid #1e293b' : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: getScoreColor(a.max_score), width: 50, textAlign: 'right' }}>
              {Math.round(a.max_score)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{a.actor.split('/').pop()}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{a.sequences} sequences</div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {a.findings.slice(0, 3).map((f, j) => (
                <span key={j} style={{ fontSize: 10, padding: '2px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 4, fontWeight: 600 }}>{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Remediation Queue */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>Remediation Queue</div>
          <Link to="/app/findings" style={{ fontSize: 13, color: '#3b82f6', fontWeight: 500 }}>View All</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>Finding</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>Complexity</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>Auto-Fix</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', color: '#94a3b8', fontWeight: 600 }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.remediation_queue.slice(0, 5).map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 12px', color: '#f8fafc', fontWeight: 500 }}>{r.policy_name}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                      background: r.severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : r.severity === 'high' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: r.severity === 'critical' ? '#ef4444' : r.severity === 'high' ? '#f97316' : '#eab308'
                    }}>{r.severity}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{r.complexity}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                      background: r.can_auto_apply ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: r.can_auto_apply ? '#22c55e' : '#9ca3af'
                    }}>{r.can_auto_apply ? 'Yes' : 'No'}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{r.estimated_time}min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
