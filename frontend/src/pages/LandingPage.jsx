import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Zap, Lock, BarChart3, CheckCircle, ArrowRight, Activity, Globe, FileCheck, AlertTriangle, Code, Terminal, GitBranch } from 'lucide-react'

export default function LandingPage() {
  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={28} color="#3b82f6" />
          <span style={{ fontWeight: 800, fontSize: 20, color: '#f8fafc' }}>Vigil</span>
        </div>
        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <a href="#features" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Features</a>
          <a href="#compliance" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Compliance</a>
          <a href="#start" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Quick Start</a>
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>GitHub</a>
          <Link to="/login" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>Sign In</Link>
          <Link to="/register" style={{
            background: '#3b82f6', color: '#fff', padding: '8px 20px', borderRadius: 8,
            fontSize: 14, fontWeight: 600
          }}>Try the Demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
          background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 20, fontSize: 13, color: '#60a5fa', marginBottom: 24
        }}>
          <Activity size={14} /> Open Source · AGPL-3.0
        </div>
        <h1 style={{ fontSize: 56, fontWeight: 800, color: '#f8fafc', lineHeight: 1.1, marginBottom: 24 }}>
          Stop Cloud Breaches<br />Before They Start
        </h1>
        <p style={{ fontSize: 20, color: '#94a3b8', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Vigil continuously monitors your AWS environment, predicts which misconfigurations attackers will exploit, and fixes 40% of them automatically. HIPAA, GDPR, SOC2, and PCI DSS ready.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/register" style={{
            background: '#3b82f6', color: '#fff', padding: '14px 32px', borderRadius: 10,
            fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
          }}>
            Launch Demo <ArrowRight size={18} />
          </Link>
          <a href="#features" style={{
            border: '1px solid #334155', color: '#e2e8f0', padding: '14px 32px', borderRadius: 10,
            fontSize: 16, fontWeight: 600
          }}>
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 800, margin: '60px auto 0' }}>
          {[
            { value: '1.9M+', label: 'Events Analyzed' },
            { value: '40%', label: 'Auto-Remediated' },
            { value: '7', label: 'Compliance Frameworks' },
            { value: '< 15 min', label: 'Time to Value' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#f8fafc' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ padding: '40px 24px', borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginBottom: 24, textTransform: 'uppercase', letterSpacing: 1 }}>
          Built with
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, opacity: 0.6 }}>
          {['FastAPI', 'React 18', 'XGBoost', 'PostgreSQL', 'Redis'].map(name => (
            <span key={name} style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>{name}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
            Continuous Security, Not Point-in-Time Checks
          </h2>
          <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
            Traditional pentests are snapshots. Vigil is a movie — tracking every change, every misconfiguration, every risky API call in real time.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
          {[
            { icon: Zap, title: 'ML-Powered Risk Prediction', desc: 'XGBoost model trained on millions of attack sequences predicts which misconfigurations will be exploited first.' },
            { icon: Activity, title: 'Kill Chain Detection', desc: 'Reconnaissance → Privilege Escalation → Data Access. We detect the full MITRE ATT&CK cloud sequence, not just individual events.' },
            { icon: Lock, title: 'Auto-Remediation', desc: '40% of findings are fixed automatically via Terraform patches, AWS CLI commands, or direct API calls. No engineer required.' },
            { icon: BarChart3, title: 'Dollar Quantification', desc: 'Every finding includes estimated breach cost range based on IBM Cost of Data Breach methodology and your asset criticality.' },
            { icon: Globe, title: 'Multi-Cloud Ready', desc: 'AWS today. Azure and GCP tomorrow. One platform for your entire cloud footprint.' },
            { icon: AlertTriangle, title: 'Drift Detection', desc: 'Detect manual console changes within minutes. If someone opens port 22 to 0.0.0.0/0, you know before they finish their coffee.' },
          ].map(f => (
            <div key={f.title} style={{
              background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 28
            }}>
              <f.icon size={28} color="#3b82f6" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 17, fontWeight: 600, color: '#f8fafc', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" style={{ padding: '80px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
              Compliance Without the Spreadsheet Hell
            </h2>
            <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 600, margin: '0 auto' }}>
              One policy check maps to 7 frameworks simultaneously. Generate audit-ready evidence with a single click.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {[
              { name: 'CIS AWS', version: '3.0', desc: 'Security benchmarks', color: '#3b82f6' },
              { name: 'SOC2', version: 'Type II', desc: 'Trust service criteria', color: '#22c55e' },
              { name: 'ISO 27001', version: '2022', desc: 'Information security', color: '#8b5cf6' },
              { name: 'PCI DSS', version: '4.0', desc: 'Payment card security', color: '#f59e0b' },
              { name: 'NIST CSF', version: '2.0', desc: 'Cybersecurity framework', color: '#ec4899' },
              { name: 'HIPAA', version: 'Final', desc: 'Healthcare data protection', color: '#ef4444' },
              { name: 'GDPR', version: '2016/679', desc: 'EU data protection', color: '#06b6d4' },
              { name: 'Custom', version: 'Your Rules', desc: 'Organization-specific policies', color: '#64748b' },
            ].map(fw => (
              <div key={fw.name} style={{
                background: '#0a0e1a', border: '1px solid #1e293b', borderRadius: 10, padding: 20,
                borderLeft: `3px solid ${fw.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>{fw.name}</span>
                  <span style={{ fontSize: 11, color: fw.color, fontWeight: 600 }}>{fw.version}</span>
                </div>
                <p style={{ fontSize: 13, color: '#64748b' }}>{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
            From Zero to Secure in 15 Minutes
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {[
            { step: '01', title: 'Connect AWS', desc: 'Deploy our CloudFormation template to create a read-only cross-account IAM role. Takes 3 minutes.' },
            { step: '02', title: 'First Scan', desc: 'We analyze your CloudTrail, IAM policies, S3 buckets, and security groups across all regions.' },
            { step: '03', title: 'Risk Scoring', desc: 'ML model ranks every finding by exploit probability and business impact. Not just CVSS.' },
            { step: '04', title: 'Auto-Fix', desc: 'Click once to generate Terraform patches and Jira tickets. 40% of issues fix themselves.' },
          ].map(s => (
            <div key={s.step} style={{ textAlign: 'center' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 16px', fontSize: 16, fontWeight: 700, color: '#3b82f6'
              }}>
                {s.step}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#f8fafc', marginBottom: 8 }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section id="start" style={{ padding: '80px 24px', background: '#0f172a' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc', marginBottom: 12 }}>
            Self-Host in 30 Seconds
          </h2>
          <p style={{ fontSize: 17, color: '#94a3b8', marginBottom: 40 }}>
            Vigil is free and open source. Run it locally with Docker Compose or deploy to your own infrastructure.
          </p>
          <div style={{
            background: '#0a0e1a', border: '1px solid #1e293b', borderRadius: 12, padding: '24px 32px',
            textAlign: 'left', fontFamily: 'monospace', fontSize: 14, color: '#e2e8f0', marginBottom: 32
          }}>
            <div style={{ color: '#64748b', marginBottom: 8 }}># Clone the repo</div>
            <div style={{ marginBottom: 16 }}>git clone https://github.com/SBTabanar/vigil-cloud-security.git</div>
            <div style={{ color: '#64748b', marginBottom: 8 }}># Start everything</div>
            <div>cd vigil-cloud-security && docker-compose up --build -d</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <Terminal size={24} color="#3b82f6" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>FastAPI Backend</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>localhost:8000</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Code size={24} color="#22c55e" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>React Frontend</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>localhost:5173</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <GitBranch size={24} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>AGPL-3.0 Licensed</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Free forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 36, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
          Ready to Explore?
        </h2>
        <p style={{ fontSize: 17, color: '#94a3b8', maxWidth: 500, margin: '0 auto 32px' }}>
          Try the live demo with pre-loaded scan data, or clone the repo and run it yourself.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link to="/register" style={{
            background: '#3b82f6', color: '#fff', padding: '16px 40px', borderRadius: 10,
            fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            Try the Demo <ArrowRight size={18} />
          </Link>
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" style={{
            border: '1px solid #334155', color: '#e2e8f0', padding: '16px 40px', borderRadius: 10,
            fontSize: 16, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 8
          }}>
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <Shield size={20} color="#3b82f6" />
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>Vigil</span>
        </div>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          Cloud Security & Compliance Automation — Built by SBTabanar
        </p>
        <p style={{ fontSize: 12, color: '#475569', marginTop: 8 }}>
          HIPAA · GDPR · SOC2 · PCI DSS · ISO 27001 · CIS · NIST CSF
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16 }}>
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#64748b' }}>
            GitHub
          </a>
          <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#64748b' }}>
            AGPL-3.0 License
          </a>
        </div>
        <p style={{ fontSize: 11, color: '#334155', marginTop: 16 }}>
          &copy; 2025 SBTabanar. Open source under AGPL-3.0.
        </p>
      </footer>
    </div>
  )
}
