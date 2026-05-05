import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shield, Cloud, Check, Copy, ArrowRight, ArrowLeft, FileText, Lock } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [orgName, setOrgName] = useState('')
  const [industry, setIndustry] = useState('saas')
  const [accountName, setAccountName] = useState('')
  const [accountId, setAccountId] = useState('')
  const [roleArn, setRoleArn] = useState('')
  const [externalId, setExternalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { apiFetch } = useAuth()
  const navigate = useNavigate()

  const createOrg = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/organizations', {
        method: 'POST',
        body: JSON.stringify({ name: orgName, industry, plan: 'starter' })
      })
      const org = await res.json()
      return org.id
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTemplate = async (orgId) => {
    const res = await apiFetch(`/organizations/${orgId}/onboarding-template`)
    const data = await res.json()
    setExternalId(data.external_id)
  }

  const connectAccount = async (orgId) => {
    setLoading(true)
    try {
      await apiFetch(`/organizations/${orgId}/aws-accounts`, {
        method: 'POST',
        body: JSON.stringify({ account_name: accountName, account_id: accountId, role_arn: roleArn, external_id: externalId })
      })
      setStep(5)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async () => {
    setError('')
    if (step === 1) {
      if (!orgName) { setError('Organization name is required'); return }
      const orgId = await createOrg()
      if (orgId) {
        localStorage.setItem('vigil_org_id', orgId)
        await getTemplate(orgId)
        setStep(2)
      }
    } else if (step === 2) {
      setStep(3)
    } else if (step === 3) {
      setStep(4)
    } else if (step === 4) {
      // Need orgId - store it in state or localStorage
      const orgId = localStorage.getItem('vigil_org_id')
      if (orgId) await connectAccount(parseInt(orgId))
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
        <Shield size={28} color="#3b82f6" />
        <span style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>Vigil Onboarding</span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} style={{
            width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 600,
            background: s <= step ? '#3b82f6' : '#1e293b',
            color: s <= step ? '#fff' : '#64748b'
          }}>
            {s < step ? <Check size={16} /> : s}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 600 }}>
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Create your organization</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>This helps us tailor compliance recommendations to your industry.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Organization Name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} required
                style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                placeholder="Acme Corp" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}>
                <option value="saas">SaaS / Technology</option>
                <option value="healthcare">Healthcare / HealthTech</option>
                <option value="fintech">Fintech / Banking</option>
                <option value="ecommerce">E-commerce</option>
                <option value="govtech">Government / GovTech</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ padding: 16, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 8, marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#60a5fa', marginBottom: 4 }}>Recommended frameworks for {industry === 'healthcare' ? 'Healthcare' : industry === 'fintech' ? 'Fintech' : 'SaaS'}:</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {industry === 'healthcare' && ['HIPAA', 'SOC2', 'GDPR', 'CIS'].map(f => <span key={f} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 4, fontWeight: 600 }}>{f}</span>)}
                {industry === 'fintech' && ['PCI DSS', 'SOC2', 'GDPR', 'CIS'].map(f => <span key={f} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: 4, fontWeight: 600 }}>{f}</span>)}
                {industry === 'saas' && ['SOC2', 'GDPR', 'ISO 27001', 'CIS'].map(f => <span key={f} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 4, fontWeight: 600 }}>{f}</span>)}
                {!['healthcare', 'fintech', 'saas'].includes(industry) && ['SOC2', 'ISO 27001', 'CIS'].map(f => <span key={f} style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: 4, fontWeight: 600 }}>{f}</span>)}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Connect AWS Account</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>We use a cross-account IAM role with read-only access. You maintain full control.</p>
            <div style={{ padding: 20, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <Cloud size={20} color="#3b82f6" />
                <span style={{ fontWeight: 600, color: '#f8fafc' }}>Cross-Account IAM Role</span>
              </div>
              <ul style={{ listStyle: 'none', fontSize: 13, color: '#94a3b8', lineHeight: 2 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={14} color="#22c55e" /> Read-only (SecurityAudit + ReadOnlyAccess)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={14} color="#22c55e" /> External ID protection against confused deputy</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={14} color="#22c55e" /> No long-term credentials stored</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Check size={14} color="#22c55e" /> Revoke anytime via your IAM console</li>
              </ul>
            </div>
            <div style={{ padding: 16, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b', marginBottom: 8 }}>Step-by-step instructions:</div>
              <ol style={{ fontSize: 13, color: '#94a3b8', lineHeight: 2, paddingLeft: 16 }}>
                <li>Log in to your AWS console as an administrator</li>
                <li>Go to CloudFormation → Create Stack → With new resources</li>
                <li>Upload our CloudFormation template (provided below)</li>
                <li>Enter your External ID: <strong style={{ color: '#f8fafc' }}>{externalId}</strong>
                  <button onClick={() => navigator.clipboard.writeText(externalId)} style={{ marginLeft: 8, color: '#3b82f6', fontSize: 12 }}>
                    <Copy size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Copy
                  </button>
                </li>
                <li>Create the stack and copy the output Role ARN</li>
              </ol>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Paste Role ARN</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>After creating the CloudFormation stack, paste the Role ARN output here.</p>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Account Name</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)}
                style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                placeholder="Production" />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>AWS Account ID</label>
              <input value={accountId} onChange={e => setAccountId(e.target.value)}
                style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                placeholder="123456789012" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Role ARN</label>
              <input value={roleArn} onChange={e => setRoleArn(e.target.value)}
                style={{ width: '100%', padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                placeholder="arn:aws:iam::123456789012:role/VigilScannerRole" />
            </div>
            <div style={{ padding: 16, background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 8 }}>
              <div style={{ fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Lock size={14} /> Your credentials are never stored. We only use temporary STS credentials.
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Ready to scan</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Review your connection details before starting the first assessment.</p>
            <div style={{ padding: 20, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Organization</span>
                <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{orgName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Industry</span>
                <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{industry}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>AWS Account</span>
                <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600 }}>{accountName} ({accountId})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>Role ARN</span>
                <span style={{ fontSize: 13, color: '#f8fafc', fontWeight: 600, maxWidth: 300, textAlign: 'right', wordBreak: 'break-all' }}>{roleArn}</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={32} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Account connected!</h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Your first scan is running. You will be redirected to the dashboard shortly.</p>
            <button onClick={() => navigate('/app')}
              style={{ padding: '12px 32px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step < 5 && (
          <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                style={{ padding: '12px 24px', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button onClick={handleNext} disabled={loading}
              style={{ flex: 1, padding: '12px 24px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : step === 4 ? 'Connect & Start Scan' : 'Next Step'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
