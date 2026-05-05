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
    <div className="min-h-screen flex bg-vigil-bg">
      <div className="flex-1 flex flex-col justify-center items-center p-12">
        <div className="w-full max-w-[400px]">
          <div className="flex items-center gap-2.5 mb-10">
            <Shield size={28} color="#3b82f6" />
            <span className="font-extrabold text-xl text-vigil-text">Vigil</span>
          </div>
          <h1 className="text-[28px] font-bold text-vigil-text mb-2">Get started</h1>
          <p className="text-sm text-vigil-muted mb-8">Create an account to explore the demo.</p>

          {!backendReady && (
            <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] p-4 rounded-lg mb-5 text-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold">
                <AlertTriangle size={18} /> Backend Not Connected
              </div>
              <p className="mb-2">The backend API is not reachable. Make sure it is running on <code className="bg-black/20 px-1.5 py-0.5 rounded">http://localhost:8000</code>.</p>
              <p className="text-xs opacity-80">Run this in a terminal:</p>
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
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">First Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-[13px] text-vigil-muted-dark" />
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required
                    className="w-full py-[11px] pl-10 pr-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                    placeholder="Jane" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Last Name</label>
                <input value={lastName} onChange={e => setLastName(e.target.value)} required
                  className="w-full p-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                  placeholder="Doe" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-[13px] text-vigil-muted-dark" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full py-[11px] pl-10 pr-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                  placeholder="you@company.com" />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-[13px] font-medium text-vigil-muted mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-[13px] text-vigil-muted-dark" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                  className="w-full py-[11px] pl-10 pr-[11px] bg-vigil-surface border border-vigil-border-light rounded-lg text-vigil-text text-sm"
                  placeholder="Minimum 8 characters" />
              </div>
            </div>
            <button type="submit" disabled={loading || !backendReady}
              className="w-full p-3 bg-vigil-primary text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-vigil-muted-dark">
            Already have an account? <Link to="/login" className="text-vigil-primary font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
      <div className="flex-1 bg-vigil-surface flex flex-col justify-center p-12 border-l border-vigil-border">
        <div className="max-w-[400px]">
          <h2 className="text-[22px] font-bold text-vigil-text mb-6">
            What You Can Explore
          </h2>
          <ul className="list-none">
            {[
              'Pre-loaded demo data with realistic scan results',
              'ML-powered risk scoring dashboard with charts',
              'Filterable findings table across 7 frameworks',
              'Terraform auto-remediation patch generation',
              'Dual payment provider integration (Stripe + PayMongo)',
              'Full source code on GitHub under AGPL-3.0'
            ].map(item => (
              <li key={item} className="flex items-center gap-2.5 mb-3.5 text-sm text-vigil-muted">
                <div className="w-5 h-5 rounded-full bg-vigil-success/10 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-vigil-success" />
                </div>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-8 pt-6 border-t border-vigil-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-vigil-border-light flex items-center justify-center font-bold text-vigil-text">SB</div>
              <div>
                <div className="text-sm font-semibold text-vigil-text">SBTabanar</div>
                <div className="text-xs text-vigil-muted-dark">Developer & Maintainer</div>
              </div>
            </div>
            <div className="flex gap-3">
              <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-vigil-primary">
                <GitBranch size={14} /> GitHub
              </a>
              <a href="https://github.com/SBTabanar/vigil-cloud-security/blob/master/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-vigil-primary">
                <BookOpen size={14} /> Contribute
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
