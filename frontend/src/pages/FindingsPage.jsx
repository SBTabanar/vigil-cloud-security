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

  if (loading) return <div className="p-[60px] text-center text-vigil-muted-dark">Loading findings...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-vigil-text mb-6">Findings</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', 'critical', 'high', 'medium', 'low'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilter(sev)}
            className={`py-2 px-4 rounded-lg text-[13px] font-semibold border ${
              filter === sev
                ? 'bg-vigil-primary text-white border-vigil-primary'
                : 'bg-vigil-surface text-vigil-muted border-vigil-border-light'
            }`}
          >
            {sev.charAt(0).toUpperCase() + sev.slice(1)} ({counts[sev]})
          </button>
        ))}
        <div className="flex-1" />
        <div className="relative">
          <Search size={16} className="absolute left-3 top-2.5 text-vigil-muted-dark" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search findings..."
            className="py-[9px] px-3 pl-9 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-[13px] w-60"
          />
        </div>
      </div>

      {/* Findings list */}
      <div className="bg-vigil-surface border border-vigil-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-[60px] text-center text-vigil-muted-dark">No findings match your filters.</div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-vigil-border-light bg-vigil-bg">
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Finding</th>
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Severity</th>
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Resource</th>
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Region</th>
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Compliance</th>
                <th className="text-left py-3.5 px-4 text-vigil-muted font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-b border-vigil-border">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-vigil-text mb-0.5">{f.policy_name}</div>
                    <div className="text-xs text-vigil-muted-dark">{f.description?.slice(0, 80)}...</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] py-[3px] px-2.5 rounded font-semibold" style={{
                      background: severityColors[f.severity]?.bg || 'rgba(107, 114, 128, 0.1)',
                      color: severityColors[f.severity]?.color || '#9ca3af'
                    }}>{f.severity}</span>
                  </td>
                  <td className="py-3.5 px-4 text-vigil-muted text-xs">
                    <div className="text-slate-300">{f.resource_type}</div>
                    <div className="max-w-[200px] overflow-hidden text-ellipsis">{f.resource_arn}</div>
                  </td>
                  <td className="py-3.5 px-4 text-vigil-muted">{f.region}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {(f.compliance_frameworks || []).slice(0, 2).map(fw => (
                        <span key={fw} className="text-[10px] py-0.5 px-1.5 bg-vigil-border-light rounded text-vigil-muted">
                          {fw.split(':')[0]}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {f.is_remediated ? (
                      <span className="flex items-center gap-1 text-xs text-vigil-success">
                        <CheckCircle size={14} /> Fixed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-vigil-orange">
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
