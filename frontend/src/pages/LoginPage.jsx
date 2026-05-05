import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shield, Mail, Lock, ArrowRight, AlertTriangle, Code, Zap, Database } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, backendReady } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
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
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>Sign in to your dashboard</p>

          {!backendReady && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: 16, borderRadius: 8, marginBottom: 20, fontSize: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 600 }}>
                <AlertTriangle size={18} /> Backend Not Connected
              </div>
              <p style={{ marginBottom: 8 }}>The backend API is not reachable. Make sure it is running on <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: 4 }}>http://localhost:8000</code>.</p>
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
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ width: '100%', padding: '11px 11px 11px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#94a3b8', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  style={{ width: '100%', padding: '11px 11px 11px 40px', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f8fafc', fontSize: 14 }}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading || !backendReady}
              style={{ width: '100%', padding: 12, background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 14, fontWeight: 600, opacity: loading || !backendReady ? 0.5 : 1 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
            Don't have an account? <Link to="/register" style={{ color: '#3b82f6', fontWeight: 600 }}>Get started</Link>
          </p>
        </div>
      </div>
      <div style={{ flex: 1, background: '#0f172a', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 48, borderLeft: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 400 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>
            Open-Source Cloud Security
          </h2>
          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 32 }}>
            Vigil is a portfolio project built to demonstrate full-stack engineering, machine learning for security, and DevOps skills. Self-host it, study the code, or contribute.
          </p>
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { icon: Code, label: 'FastAPI + React', desc: 'Modern async backend, reactive frontend' },
              { icon: Zap, label: 'XGBoost ML Model', desc: 'Trained on attack sequence patterns' },
              { icon: Database, label: '7 Compliance Frameworks', desc: 'HIPAA, GDPR, SOC2, PCI, ISO, CIS, NIST' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <item.icon size={18} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #1e293b' }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Built by <a href="https://github.com/SBTabanar" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontWeight: 600 }}>SBTabanar</a>
            </div>
            <div style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
              Licensed under AGPL-3.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
