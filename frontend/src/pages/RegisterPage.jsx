import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shield, Mail, Lock, User, ArrowRight, AlertTriangle, Code, GitBranch, BookOpen } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register, backendReady } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, firstName, lastName)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0a0e1a' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 48 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
            <Shield size={28} color="#3b82f6" />
            <span style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>Vigil</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Get started</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Create an account to explore the demo.</p>

          {!backendReady && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: 16, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <AlertTriangle size={18} /> Backend Not Connected
              </div>
              <p style={{ marginBottom: 8 }}>The backend API is not reachable. Make sure it is running on <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>http://localhost:8000</code>.</p>
              <p style={{ fontSize: 12, opacity: 0.8 }}>Run this in a terminal:</p>
              <pre style={{ background: 'rgba(0,0,0,0.2)', padding: 10, borderRadius: 6, fontSize: 12, overflow: 'auto', marginTop: 8 }}>
cd vigil-cloud-security/backend
source venv/bin/activate
uvicorn app.main:app --reload
              </pre>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: 12, borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                    style={{ width: '100%', padding: '11px 11px 11px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                    placeholder="Jane" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} required
                  style={{ width: '100%', padding: 11, background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                  placeholder="Doe" />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '11px 11px 11px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                  placeholder="you@company.com" />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  style={{ width: '100%', padding: '11px 11px 11px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                  placeholder="Minimum 8 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading || !backendReady}
              style={{ width: '100%', padding: 12, background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || !backendReady ? 0.5 : 1 }}
            >
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{ color: '#3b82f6', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, background: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, borderLeft: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>
            What You Can Explore
          </h2>
          <ul style={{ listStyle: 'none' }}>
            {[
              'Pre-loaded demo data with realistic scan results',
              'ML-powered risk scoring dashboard with charts',
              'Filterable findings table across 7 frameworks',
              'Terraform auto-remediation patch generation',
              'Dual payment provider integration (Stripe + PayMongo)',
              'Full source code on GitHub under AGPL-3.0'
            ].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, fontSize: 14, color: '#94a3b8' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#f8fafc' }}>SB</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>SBTabanar</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Developer & Maintainer</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#3b82f6' }}>
                <GitBranch size={14} /> GitHub
              </a>
              <a href="https://github.com/SBTabanar/vigil-cloud-security/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#3b82f6' }}>
                <BookOpen size={14} /> Contribute
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
