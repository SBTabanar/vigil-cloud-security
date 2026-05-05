import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AlertTriangle, Shield, CheckCircle, XCircle, Filter, Search } from 'lucide-react'

const severityColors = {
  critical: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' },
  high: { bg: 'rgba(249, 115, 22, 0.1)', color: '#f97316' },
  medium: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308' },
  low: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' },
}

export default function FindingsPage() {
  const { apiFetch } = useAuth()
  const [findings, setFindings] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const orgId = localStorage.getItem('vigil_org_id')
      if (!orgId) return
      try {
        const res = await apiFetch(`/organizations/${orgId}/findings`)
        const data = await res.json()
        setFindings(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = findings.filter(f => {
    if (filter !== 'all' && f.severity !== filter) return false
    if (search && !f.policy_name.toLowerCase().includes(search.toLowerCase()) && !f.resource_arn?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    all: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Loading findings...</div>

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>Findings</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: filter === sev ? '#3b82f6' : '#0f172a',
              color: filter === sev ? '#fff' : '#94a3b8',
              border: `1px solid ${filter === sev ? '#3b82f6' : '#334155'}`
            }}
          >
            {sev.charAt(0).toUpperCase() + sev.slice(1)} ({counts[sev]})
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: '#64748b' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search findings..."
            style={{ padding: '9px 12px 9px 36px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 13, width: 240 }}
          />
        </div>
      </div>

      {/* Findings list */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>No findings match your filters.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', background: '#0a0e1a' }}>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Finding</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Severity</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Resource</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Region</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Compliance</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', color: '#94a3b8', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 2 }}>{f.policy_name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{f.description?.slice(0, 80)}...</div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      fontSize: 11, padding: '3px 10px', borderRadius: 4, fontWeight: 600,
                      background: severityColors[f.severity]?.bg || 'rgba(107, 114, 128, 0.1)',
                      color: severityColors[f.severity]?.color || '#9ca3af'
                    }}>{f.severity}</span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8', fontSize: 12 }}>
                    <div style={{ color: '#cbd5e1' }}>{f.resource_type}</div>
                    <div style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.resource_arn}</div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{f.region}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(f.compliance_frameworks || []).slice(0, 2).map(fw => (
                        <span key={fw} style={{ fontSize: 10, padding: '2px 6px', background: '#334155', borderRadius: 4, color: '#94a3b8' }}>
                          {fw.split(':')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {f.is_remediated ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#22c55e' }}>
                        <CheckCircle size={14} /> Fixed
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#f97316' }}>
                        <AlertTriangle size={14} /> Open
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
