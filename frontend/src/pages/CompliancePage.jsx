import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { FileCheck, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

const frameworkColors = {
  'CIS AWS Foundations 3.0': '#3b82f6',
  'SOC2 Type II': '#22c55e',
  'ISO 27001:2022': '#8b5cf6',
  'PCI DSS 4.0': '#f59e0b',
  'NIST CSF 2.0': '#ec4899',
  'HIPAA': '#ef4444',
  'GDPR': '#06b6d4',
}

export default function CompliancePage() {
  const { apiFetch } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const orgId = localStorage.getItem('vigil_org_id')
      if (!orgId) return
      try {
        const res = await apiFetch(`/organizations/${orgId}/dashboard`)
        const dashData = await res.json()
        setData(dashData)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="p-[60px] text-center text-vigil-muted-dark">Loading compliance data...</div>
  if (!data) return <div className="p-[60px] text-center text-vigil-muted-dark">No data available.</div>

  const compliance = data.compliance_summary

  return (
    <div>
      <h1 className="text-2xl font-bold text-vigil-text mb-2">Compliance</h1>
      <p className="text-sm text-vigil-muted mb-6">Real-time compliance posture across 7 frameworks.</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-4">
        {Object.entries(compliance).map(([name, stats]) => {
          const color = frameworkColors[name] || '#64748b'
          const total = stats.total_findings
          const passed = Math.max(0, 100 - total) // Mock pass rate
          const pct = Math.max(0, Math.min(100, passed))

          return (
            <div key={name} className="bg-vigil-surface border border-vigil-border rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                  <span className="text-base font-bold text-vigil-text">{name}</span>
                </div>
                <span className="text-xl font-bold" style={{ color }}>{pct}%</span>
              </div>

              <div className="h-2 bg-vigil-border-light rounded mb-4 overflow-hidden">
                <div className="h-full rounded transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-vigil-danger/5 rounded-md">
                  <div className="text-lg font-bold text-vigil-danger">{stats.critical}</div>
                  <div className="text-[10px] text-vigil-muted-dark">Critical</div>
                </div>
                <div className="text-center p-2 bg-vigil-orange/5 rounded-md">
                  <div className="text-lg font-bold text-vigil-orange">{stats.high}</div>
                  <div className="text-[10px] text-vigil-muted-dark">High</div>
                </div>
                <div className="text-center p-2 bg-vigil-warning/5 rounded-md">
                  <div className="text-lg font-bold text-vigil-warning">{stats.medium}</div>
                  <div className="text-[10px] text-vigil-muted-dark">Medium</div>
                </div>
                <div className="text-center p-2 bg-vigil-success/5 rounded-md">
                  <div className="text-lg font-bold text-vigil-success">{Math.max(0, 100 - stats.critical - stats.high - stats.medium)}</div>
                  <div className="text-[10px] text-vigil-muted-dark">Passing</div>
                </div>
              </div>

              <div className="text-xs text-vigil-muted-dark mb-2">Controls Affected:</div>
              <div className="flex gap-1.5 flex-wrap">
                {stats.controls_affected.map(c => (
                  <span key={c} className="text-[11px] py-[3px] px-2 bg-vigil-bg border border-vigil-border-light rounded text-vigil-muted">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Framework explanations */}
      <div className="mt-8 bg-vigil-surface border border-vigil-border rounded-xl p-6">
        <h2 className="text-base font-bold text-vigil-text mb-4">Framework Requirements</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-vigil-danger mb-2">HIPAA</h3>
            <ul className="text-[13px] text-vigil-muted leading-[1.8] pl-4">
              <li>164.312(a)(1) - Access Control</li>
              <li>164.312(a)(2)(iv) - Encryption</li>
              <li>164.312(b) - Audit Controls</li>
              <li>164.312(e)(1) - Transmission Security</li>
              <li>164.308(a)(7) - Data Backup Plan</li>
            </ul>
            <p className="text-xs text-vigil-muted-dark mt-2">Penalties: $100 - $1.5M per violation</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-cyan-500 mb-2">GDPR</h3>
            <ul className="text-[13px] text-vigil-muted leading-[1.8] pl-4">
              <li>Art. 32(1) - Security of Processing</li>
              <li>Art. 25(1) - Data Protection by Design</li>
              <li>Art. 5(1)(f) - Integrity & Confidentiality</li>
              <li>Art. 17 - Right to Erasure</li>
              <li>Art. 33 - Breach Notification</li>
            </ul>
            <p className="text-xs text-vigil-muted-dark mt-2">Penalties: Up to 4% global turnover or €20M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
