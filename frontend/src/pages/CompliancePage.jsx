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

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>Loading compliance data...</div>
  if (!data) return <div style={{ padding: 60, textAlign: 'center', color: '#64748b' }}>No data available.</div>

  const compliance = data.compliance_summary

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Compliance</h1>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>Real-time compliance posture across 7 frameworks.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {Object.entries(compliance).map(([name, stats]) => {
          const color = frameworkColors[name] || '#64748b'
          const total = stats.total_findings
          const passed = Math.max(0, 100 - total) // Mock pass rate
          const pct = Math.max(0, Math.min(100, passed))

          return (
            <div key={name} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>{name}</span>
                </div>
                <span style={{ fontSize: 20, fontWeight: 700, color }}>{pct}%</span>
              </div>

              <div style={{ height: 8, background: '#334155', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.5s' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(239, 68, 68, 0.05)', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>{stats.critical}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Critical</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(249, 115, 22, 0.05)', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>{stats.high}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>High</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(234, 179, 8, 0.05)', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#eab308' }}>{stats.medium}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Medium</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: 'rgba(34, 197, 94, 0.05)', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#22c55e' }}>{Math.max(0, 100 - stats.critical - stats.high - stats.medium)}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>Passing</div>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Controls Affected:</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {stats.controls_affected.map(c => (
                  <span key={c} style={{ fontSize: 11, padding: '3px 8px', background: '#0a0e1a', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Framework explanations */}
      <div style={{ marginTop: 32, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>Framework Requirements</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#ef4444', marginBottom: 8 }}>HIPAA</h3>
            <ul style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>164.312(a)(1) - Access Control</li>
              <li>164.312(a)(2)(iv) - Encryption</li>
              <li>164.312(b) - Audit Controls</li>
              <li>164.312(e)(1) - Transmission Security</li>
              <li>164.308(a)(7) - Data Backup Plan</li>
            </ul>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Penalties: $100 - $1.5M per violation</p>
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#06b6d4', marginBottom: 8 }}>GDPR</h3>
            <ul style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8, paddingLeft: 16 }}>
              <li>Art. 32(1) - Security of Processing</li>
              <li>Art. 25(1) - Data Protection by Design</li>
              <li>Art. 5(1)(f) - Integrity & Confidentiality</li>
              <li>Art. 17 - Right to Erasure</li>
              <li>Art. 33 - Breach Notification</li>
            </ul>
            <p style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>Penalties: Up to 4% global turnover or €20M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
