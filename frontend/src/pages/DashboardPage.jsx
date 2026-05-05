import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Activity, AlertTriangle, Shield, Zap, TrendingUp, TrendingDown, Users, Globe, FileCheck, Cloud } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const getScoreColor = (s) => s >= 750 ? '#ef4444' : s >= 500 ? '#f97316' : s >= 300 ? '#eab308' : '#22c55e'

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <div className="bg-vigil-surface border border-vigil-border rounded-xl p-5">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs font-semibold text-vigil-muted-dark uppercase tracking-[0.5px]">{title}</span>
        <Icon size={18} color={color} />
      </div>
      <div className="text-[28px] font-bold text-vigil-text">{value}</div>
      {sub && <div className="text-xs text-vigil-muted-dark mt-1">{sub}</div>}
    </div>
  )
}

function ScoreRing({ score, label, size = 70 }) {
  const color = getScoreColor(score)
  const pct = Math.min(score / 10, 100)
  return (
    <div className="text-center">
      <div
        className="rounded-full flex items-center justify-center mx-auto mb-2"
        style={{ width: size, height: size, background: `conic-gradient(${color} ${pct}%, #334155 ${pct}%)` }}
      >
        <div
          className="rounded-full flex items-center justify-center bg-vigil-surface font-bold"
          style={{ width: size - 10, height: size - 10, color, fontSize: size > 60 ? 18 : 13 }}
        >
          {Math.round(score)}
        </div>
      </div>
      <div className="text-[11px] text-vigil-muted-dark">{label}</div>
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

  if (loading) return <div className="p-[60px] text-center text-vigil-muted-dark">Loading dashboard...</div>

  // Empty state: no AWS accounts connected
  if (!data || data.summary.aws_accounts === 0) {
    return (
      <div className="text-center py-20 px-6">
        <div className="w-20 h-20 rounded-full bg-vigil-primary/10 flex items-center justify-center mx-auto mb-6">
          <Globe size={36} color="#3b82f6" />
        </div>
        <h2 className="text-2xl font-bold text-vigil-text mb-3">No AWS Account Connected</h2>
        <p className="text-[15px] text-vigil-muted max-w-[500px] mx-auto mb-8 leading-[1.6]">
          Connect your AWS account to start scanning for misconfigurations, compliance gaps, and active attack patterns. It takes about 3 minutes.
        </p>
        <button onClick={() => navigate('/onboarding')}
          className="py-3.5 px-8 bg-vigil-primary text-white rounded-[10px] text-[15px] font-semibold inline-flex items-center gap-2"
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-vigil-text">Dashboard</h1>
          <p className="text-[13px] text-vigil-muted-dark mt-1">{s.organization_name} · Last scan: {s.last_scan_at ? new Date(s.last_scan_at).toLocaleString() : 'Never'}</p>
        </div>
        <button onClick={handleScan}
          className="py-2.5 px-5 bg-vigil-primary text-white rounded-lg text-[13px] font-semibold flex items-center gap-2"
        >
          <Zap size={16} /> Run New Scan
        </button>
      </div>

      {/* Score Rings */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-4 mb-6">
        <ScoreRing score={s.max_risk_score} label="Max Risk" />
        <ScoreRing score={s.avg_risk_score} label="Avg Risk" />
        <ScoreRing score={sev.critical * 50} label="Critical Exposure" />
        <ScoreRing score={s.auto_remediable / Math.max(s.total_findings, 1) * 1000} label="Auto-Fixable" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6">
        <StatCard title="Events Analyzed" value={s.total_events.toLocaleString()} icon={Activity} color="#3b82f6" sub="CloudTrail records" />
        <StatCard title="Attack Sequences" value={s.total_sequences.toLocaleString()} icon={AlertTriangle} color="#f97316" sub="Actor-grouped sessions" />
        <StatCard title="Malicious Flagged" value={s.malicious_sequences.toLocaleString()} icon={Shield} color="#ef4444" sub={`${(s.malicious_sequences / Math.max(s.total_sequences, 1) * 100).toFixed(1)}% of total`} />
        <StatCard title="Policy Violations" value={s.total_findings} icon={FileCheck} color="#eab308" sub={`${sev.critical} Critical · ${sev.high} High`} />
        <StatCard title="AWS Accounts" value={s.aws_accounts} icon={Globe} color="#22c55e" sub="Connected regions" />
        <StatCard title="Auto-Remediable" value={`${s.auto_remediable}/${s.total_findings}`} icon={TrendingUp} color="#3b82f6" sub={`${(s.auto_remediable / Math.max(s.total_findings, 1) * 100).toFixed(0)}% can be fixed automatically`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-[2fr_1fr] gap-4 mb-6">
        <div className="bg-vigil-surface border border-vigil-border rounded-xl p-5">
          <div className="text-[13px] font-semibold text-vigil-muted uppercase tracking-[0.5px] mb-4">Risk Timeline (30 Days)</div>
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

        <div className="bg-vigil-surface border border-vigil-border rounded-xl p-5">
          <div className="text-[13px] font-semibold text-vigil-muted uppercase tracking-[0.5px] mb-4">Findings by Severity</div>
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
      <div className="bg-vigil-surface border border-vigil-border rounded-xl p-5 mb-6">
        <div className="text-[13px] font-semibold text-vigil-muted uppercase tracking-[0.5px] mb-4">Highest Risk Actors</div>
        {data.top_actors.map((a, i) => (
          <div key={i} className={`flex items-center gap-4 py-3 ${i < data.top_actors.length - 1 ? 'border-b border-vigil-border' : ''}`}>
            <div className="text-xl font-bold w-[50px] text-right" style={{ color: getScoreColor(a.max_score) }}>
              {Math.round(a.max_score)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-vigil-text">{a.actor.split('/').pop()}</div>
              <div className="text-xs text-vigil-muted-dark">{a.sequences} sequences</div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {a.findings.slice(0, 3).map((f, j) => (
                <span key={j} className="text-[10px] py-0.5 px-2 bg-vigil-danger/10 text-vigil-danger rounded font-semibold">{f}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Remediation Queue */}
      <div className="bg-vigil-surface border border-vigil-border rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="text-[13px] font-semibold text-vigil-muted uppercase tracking-[0.5px]">Remediation Queue</div>
          <Link to="/app/findings" className="text-[13px] text-vigil-primary font-medium">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-vigil-border-light">
                <th className="text-left py-2.5 px-3 text-vigil-muted font-semibold">Finding</th>
                <th className="text-left py-2.5 px-3 text-vigil-muted font-semibold">Severity</th>
                <th className="text-left py-2.5 px-3 text-vigil-muted font-semibold">Complexity</th>
                <th className="text-left py-2.5 px-3 text-vigil-muted font-semibold">Auto-Fix</th>
                <th className="text-left py-2.5 px-3 text-vigil-muted font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.remediation_queue.slice(0, 5).map((r, i) => (
                <tr key={i} className="border-b border-vigil-border">
                  <td className="py-2.5 px-3 text-vigil-text font-medium">{r.policy_name}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[11px] py-0.5 px-2 rounded font-semibold ${
                      r.severity === 'critical' ? 'bg-vigil-danger/10 text-vigil-danger' :
                      r.severity === 'high' ? 'bg-vigil-orange/10 text-vigil-orange' :
                      'bg-vigil-warning/10 text-vigil-warning'
                    }`}>{r.severity}</span>
                  </td>
                  <td className="py-2.5 px-3 text-vigil-muted">{r.complexity}</td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[11px] py-0.5 px-2 rounded font-semibold ${
                      r.can_auto_apply ? 'bg-vigil-success/10 text-vigil-success' : 'bg-gray-500/10 text-gray-400'
                    }`}>{r.can_auto_apply ? 'Yes' : 'No'}</span>
                  </td>
                  <td className="py-2.5 px-3 text-vigil-muted">{r.estimated_time}min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
