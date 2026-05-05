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
    <div className="min-h-screen flex bg-vigil-bg">
      <div className="flex-1 flex flex-col justify-center items-center p-12">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-10">
            <Shield size={28} color="#3b82f6" />
            <span className="font-extrabold text-xl text-vigil-text">Vigil</span>
          </div>
          <h1 className="text-[28px] font-bold text-vigil-text mb-2">Welcome back</h1>
          <p className="text-sm text-vigil-muted mb-8">Sign in to your dashboard</p>

          {!backendReady && (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] p-4 rounded-lg mb-5 text-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <AlertTriangle size={18} /> Backend Not Connected
              </div>
              <p className="mb-2">The backend API is not reachable. Make sure it is running on <code className="bg-black/20 px-1.5 py-0.5 rounded">http://localhost:8000</code>.</p>
              <pre className="bg-black/20 p-2.5 rounded-md text-xs overflow-auto mt-2">
cd vigil-cloud-security/backend
source venv/bin/activate
uvicorn app.main:app --reload
              </pre>
            </div>
          )}

          {error && (
            <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] p-3 rounded-lg mb-5 text-[13px]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-[13px] text-vigil-muted-dark" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full py-[11px] pl-10 pr-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-[13px] text-vigil-muted-dark" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full py-[11px] pl-10 pr-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading || !backendReady}
              className="w-full p-3 bg-vigil-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-vigil-muted-dark">
            Don't have an account? <Link to="/register" className="text-vigil-primary font-semibold">Get started</Link>
          </p>
        </div>
      </div>
      <div className="flex-1 bg-vigil-surface flex flex-col justify-center p-12 border-l border-vigil-border">
        <div className="max-w-[400px]">
          <h2 className="text-[22px] font-bold text-vigil-text mb-6">
            Open-Source Cloud Security
          </h2>
          <p className="text-[15px] text-vigil-muted leading-[1.6] mb-8">
            Vigil is a portfolio project built to demonstrate full-stack engineering, machine learning for security, and DevOps skills. Self-host it, study the code, or contribute.
          </p>
          <div className="grid gap-4">
            {[
              { icon: Code, label: 'FastAPI + React', desc: 'Modern async backend, reactive frontend' },
              { icon: Zap, label: 'XGBoost ML Model', desc: 'Trained on attack sequence patterns' },
              { icon: Database, label: '7 Compliance Frameworks', desc: 'HIPAA, GDPR, SOC2, PCI, ISO, CIS, NIST' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-vigil-primary/10 flex items-center justify-center">
                  <item.icon size={18} color="#3b82f6" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-vigil-text">{item.label}</div>
                  <div className="text-xs text-vigil-muted-dark">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-vigil-border">
            <div className="text-[13px] text-vigil-muted-dark">
              Built by <a href="https://github.com/SBTabanar" target="_blank" rel="noopener noreferrer" className="text-vigil-primary font-semibold">SBTabanar</a>
            </div>
            <div className="text-xs text-slate-600 mt-1">
              Licensed under AGPL-3.0
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
