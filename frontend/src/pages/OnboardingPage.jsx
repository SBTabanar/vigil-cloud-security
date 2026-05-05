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
    <div className="min-h-screen bg-vigil-bg flex flex-col items-center py-15 px-6">
      <div className="flex items-center gap-2.5 mb-10">
        <Shield size={28} color="#3b82f6" />
        <span className="font-extrabold text-xl text-vigil-text">Vigil Onboarding</span>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold"
            style={{
              background: s <= step ? '#3b82f6' : '#1e293b',
              color: s <= step ? '#fff' : '#64748b'
            }}>
            {s < step ? <Check size={16} /> : s}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[600px]">
        {error && (
          <div className="bg-vigil-danger/10 border border-vigil-danger/20 text-vigil-danger p-3 rounded-lg mb-5 text-[13px]">
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-vigil-text mb-2">Create your organization</h2>
            <p className="text-sm text-vigil-muted mb-8">This helps us tailor compliance recommendations to your industry.</p>
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Organization Name</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} required
                className="w-full p-3 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                placeholder="Acme Corp" />
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Industry</label>
              <select value={industry} onChange={e => setIndustry(e.target.value)}
                className="w-full p-3 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm">
                <option value="saas">SaaS / Technology</option>
                <option value="healthcare">Healthcare / HealthTech</option>
                <option value="fintech">Fintech / Banking</option>
                <option value="ecommerce">E-commerce</option>
                <option value="govtech">Government / GovTech</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="p-4 bg-vigil-primary/5 border border-vigil-primary/20 rounded-lg mb-6">
              <div className="text-[13px] font-semibold text-vigil-primary-light mb-1">Recommended frameworks for {industry === 'healthcare' ? 'Healthcare' : industry === 'fintech' ? 'Fintech' : 'SaaS'}:</div>
              <div className="flex gap-2 flex-wrap mt-2">
                {industry === 'healthcare' && ['HIPAA', 'SOC2', 'GDPR', 'CIS'].map(f => <span key={f} className="text-[11px] py-[3px] px-2.5 bg-vigil-danger/10 text-vigil-danger rounded font-semibold">{f}</span>)}
                {industry === 'fintech' && ['PCI DSS', 'SOC2', 'GDPR', 'CIS'].map(f => <span key={f} className="text-[11px] py-[3px] px-2.5 bg-amber-500/10 text-amber-500 rounded font-semibold">{f}</span>)}
                {industry === 'saas' && ['SOC2', 'GDPR', 'ISO 27001', 'CIS'].map(f => <span key={f} className="text-[11px] py-[3px] px-2.5 bg-vigil-primary/10 text-vigil-primary rounded font-semibold">{f}</span>)}
                {!['healthcare', 'fintech', 'saas'].includes(industry) && ['SOC2', 'ISO 27001', 'CIS'].map(f => <span key={f} className="text-[11px] py-[3px] px-2.5 bg-vigil-primary/10 text-vigil-primary rounded font-semibold">{f}</span>)}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-vigil-text mb-2">Connect AWS Account</h2>
            <p className="text-sm text-vigil-muted mb-8">We use a cross-account IAM role with read-only access. You maintain full control.</p>
            <div className="p-5 bg-vigil-surface border border-vigil-border rounded-xl mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <Cloud size={20} color="#3b82f6" />
                <span className="font-semibold text-vigil-text">Cross-Account IAM Role</span>
              </div>
              <ul className="list-none text-[13px] text-vigil-muted leading-[2]">
                <li className="flex items-center gap-2"><Check size={14} color="#22c55e" /> Read-only (SecurityAudit + ReadOnlyAccess)</li>
                <li className="flex items-center gap-2"><Check size={14} color="#22c55e" /> External ID protection against confused deputy</li>
                <li className="flex items-center gap-2"><Check size={14} color="#22c55e" /> No long-term credentials stored</li>
                <li className="flex items-center gap-2"><Check size={14} color="#22c55e" /> Revoke anytime via your IAM console</li>
              </ul>
            </div>
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
              <div className="text-[13px] font-semibold text-amber-500 mb-2">Step-by-step instructions:</div>
              <ol className="text-[13px] text-vigil-muted leading-[2] pl-4">
                <li>Log in to your AWS console as an administrator</li>
                <li>Go to CloudFormation → Create Stack → With new resources</li>
                <li>Upload our CloudFormation template (provided below)</li>
                <li>Enter your External ID: <strong className="text-vigil-text">{externalId}</strong>
                  <button onClick={() => navigator.clipboard.writeText(externalId)} className="ml-2 text-vigil-primary text-xs">
                    <Copy size={12} className="inline align-middle" /> Copy
                  </button>
                </li>
                <li>Create the stack and copy the output Role ARN</li>
              </ol>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-vigil-text mb-2">Paste Role ARN</h2>
            <p className="text-sm text-vigil-muted mb-8">After creating the CloudFormation stack, paste the Role ARN output here.</p>
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Account Name</label>
              <input value={accountName} onChange={e => setAccountName(e.target.value)}
                className="w-full p-3 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                placeholder="Production" />
            </div>
            <div className="mb-5">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">AWS Account ID</label>
              <input value={accountId} onChange={e => setAccountId(e.target.value)}
                className="w-full p-3 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                placeholder="123456789012" />
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Role ARN</label>
              <input value={roleArn} onChange={e => setRoleArn(e.target.value)}
                className="w-full p-3 bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                placeholder="arn:aws:iam::123456789012:role/VigilScannerRole" />
            </div>
            <div className="p-4 bg-vigil-success/5 border border-vigil-success/20 rounded-lg">
              <div className="text-[13px] text-vigil-success flex items-center gap-2">
                <Lock size={14} /> Your credentials are never stored. We only use temporary STS credentials.
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-vigil-text mb-2">Ready to scan</h2>
            <p className="text-sm text-vigil-muted mb-8">Review your connection details before starting the first assessment.</p>
            <div className="p-5 bg-vigil-surface border border-vigil-border rounded-xl mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-[13px] text-vigil-muted-dark">Organization</span>
                <span className="text-[13px] text-vigil-text font-semibold">{orgName}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-[13px] text-vigil-muted-dark">Industry</span>
                <span className="text-[13px] text-vigil-text font-semibold">{industry}</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-[13px] text-vigil-muted-dark">AWS Account</span>
                <span className="text-[13px] text-vigil-text font-semibold">{accountName} ({accountId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-vigil-muted-dark">Role ARN</span>
                <span className="text-[13px] text-vigil-text font-semibold max-w-[300px] text-right break-all">{roleArn}</span>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-fade-in text-center">
            <div className="w-16 h-16 rounded-full bg-vigil-success/10 flex items-center justify-center mx-auto mb-6">
              <Check size={32} color="#22c55e" />
            </div>
            <h2 className="text-2xl font-bold text-vigil-text mb-2">Account connected!</h2>
            <p className="text-sm text-vigil-muted mb-8">Your first scan is running. You will be redirected to the dashboard shortly.</p>
            <button onClick={() => navigate('/app')}
              className="py-3 px-8 bg-vigil-primary text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2"
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step < 5 && (
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="py-3 px-6 border border-vigil-border-light text-vigil-muted rounded-lg text-sm font-semibold flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button onClick={handleNext} disabled={loading}
              className="flex-1 py-3 px-6 bg-vigil-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Processing...' : step === 4 ? 'Connect & Start Scan' : 'Next Step'} <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
