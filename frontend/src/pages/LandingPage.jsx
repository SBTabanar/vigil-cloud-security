import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Zap, Lock, BarChart3, CheckCircle, ArrowRight, Activity, Globe, FileCheck, AlertTriangle, Code, Terminal, GitBranch } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="bg-vigil-bg min-h-screen">
      {/* Navigation */}
      <nav className="flex justify-between items-center py-5 px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-2.5">
          <Shield size={28} className="text-vigil-primary" />
          <span className="font-extrabold text-xl text-vigil-text">Vigil</span>
        </div>
        <div className="flex gap-8 items-center">
          <a href="#features" className="text-vigil-muted text-sm font-medium">Features</a>
          <a href="#compliance" className="text-vigil-muted text-sm font-medium">Compliance</a>
          <a href="#start" className="text-vigil-muted text-sm font-medium">Quick Start</a>
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" className="text-vigil-muted text-sm font-medium">GitHub</a>
          <Link to="/login" className="text-vigil-muted text-sm font-medium">Sign In</Link>
          <Link to="/register" className="bg-vigil-primary text-white px-5 py-2 rounded-lg text-sm font-semibold">
            Try the Demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center pt-[100px] px-6 pb-20 max-w-[900px] mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-vigil-primary/10 border border-vigil-primary/20 rounded-[20px] text-[13px] text-vigil-primary-light mb-6">
          <Activity size={14} /> Open Source · AGPL-3.0
        </div>
        <h1 className="text-[56px] font-extrabold text-vigil-text leading-[1.1] mb-6">
          Stop Cloud Breaches<br />Before They Start
        </h1>
        <p className="text-xl text-vigil-muted max-w-[600px] mx-auto mb-10 leading-[1.6]">
          Vigil continuously monitors your AWS environment, predicts which misconfigurations attackers will exploit, and fixes 40% of them automatically. HIPAA, GDPR, SOC2, and PCI DSS ready.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-vigil-primary text-white py-3.5 px-8 rounded-[10px] text-base font-semibold inline-flex items-center gap-2">
            Launch Demo <ArrowRight size={18} />
          </Link>
          <a href="#features" className="border border-vigil-border-light text-slate-200 py-3.5 px-8 rounded-[10px] text-base font-semibold">
            See How It Works
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 max-w-[800px] mx-auto mt-[60px]">
          {[
            { value: '1.9M+', label: 'Events Analyzed' },
            { value: '40%', label: 'Auto-Remediated' },
            { value: '7', label: 'Compliance Frameworks' },
            { value: '< 15 min', label: 'Time to Value' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[28px] font-bold text-vigil-text">{s.value}</div>
              <div className="text-[13px] text-vigil-muted-dark mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-10 px-6 border-t border-b border-vigil-border">
        <div className="text-center text-[13px] text-vigil-muted-dark mb-6 uppercase tracking-[1px]">
          Built with
        </div>
        <div className="flex justify-center gap-12 opacity-60">
          {['FastAPI', 'React 18', 'XGBoost', 'PostgreSQL', 'Redis'].map(name => (
            <span key={name} className="text-[15px] font-semibold text-vigil-muted">{name}</span>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-[1200px] mx-auto">
        <div className="text-center mb-[60px]">
          <h2 className="text-4xl font-bold text-vigil-text mb-3">
            Continuous Security, Not Point-in-Time Checks
          </h2>
          <p className="text-[17px] text-vigil-muted max-w-[600px] mx-auto">
            Traditional pentests are snapshots. Vigil is a movie — tracking every change, every misconfiguration, every risky API call in real time.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'ML-Powered Risk Prediction', desc: 'XGBoost model trained on millions of attack sequences predicts which misconfigurations will be exploited first.' },
            { icon: Activity, title: 'Kill Chain Detection', desc: 'Reconnaissance → Privilege Escalation → Data Access. We detect the full MITRE ATT&CK cloud sequence, not just individual events.' },
            { icon: Lock, title: 'Auto-Remediation', desc: '40% of findings are fixed automatically via Terraform patches, AWS CLI commands, or direct API calls. No engineer required.' },
            { icon: BarChart3, title: 'Dollar Quantification', desc: 'Every finding includes estimated breach cost range based on IBM Cost of Data Breach methodology and your asset criticality.' },
            { icon: Globe, title: 'Multi-Cloud Ready', desc: 'AWS today. Azure and GCP tomorrow. One platform for your entire cloud footprint.' },
            { icon: AlertTriangle, title: 'Drift Detection', desc: 'Detect manual console changes within minutes. If someone opens port 22 to 0.0.0.0/0, you know before they finish their coffee.' },
          ].map(f => (
            <div key={f.title} className="bg-vigil-surface border border-vigil-border rounded-xl p-7">
              <f.icon size={28} className="text-vigil-primary mb-4" />
              <h3 className="text-[17px] font-semibold text-vigil-text mb-2.5">{f.title}</h3>
              <p className="text-sm text-vigil-muted leading-[1.6]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance" className="py-20 px-6 bg-vigil-surface">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="text-4xl font-bold text-vigil-text mb-3">
              Compliance Without the Spreadsheet Hell
            </h2>
            <p className="text-[17px] text-vigil-muted max-w-[600px] mx-auto">
              One policy check maps to 7 frameworks simultaneously. Generate audit-ready evidence with a single click.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5">
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
              <div key={fw.name} className="bg-vigil-bg border border-vigil-border rounded-[10px] p-5" style={{ borderLeft: `3px solid ${fw.color}` }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[15px] font-bold text-vigil-text">{fw.name}</span>
                  <span className="text-[11px] font-semibold" style={{ color: fw.color }}>{fw.version}</span>
                </div>
                <p className="text-[13px] text-vigil-muted-dark">{fw.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 max-w-[1000px] mx-auto">
        <div className="text-center mb-[60px]">
          <h2 className="text-4xl font-bold text-vigil-text mb-3">
            From Zero to Secure in 15 Minutes
          </h2>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Connect AWS', desc: 'Deploy our CloudFormation template to create a read-only cross-account IAM role. Takes 3 minutes.' },
            { step: '02', title: 'First Scan', desc: 'We analyze your CloudTrail, IAM policies, S3 buckets, and security groups across all regions.' },
            { step: '03', title: 'Risk Scoring', desc: 'ML model ranks every finding by exploit probability and business impact. Not just CVSS.' },
            { step: '04', title: 'Auto-Fix', desc: 'Click once to generate Terraform patches and Jira tickets. 40% of issues fix themselves.' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 rounded-full bg-vigil-primary/10 border border-vigil-primary/20 flex items-center justify-center mx-auto mb-4 text-base font-bold text-vigil-primary">
                {s.step}
              </div>
              <h3 className="text-base font-semibold text-vigil-text mb-2">{s.title}</h3>
              <p className="text-sm text-vigil-muted leading-[1.6]">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section id="start" className="py-20 px-6 bg-vigil-surface">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-vigil-text mb-3">
            Self-Host in 30 Seconds
          </h2>
          <p className="text-[17px] text-vigil-muted mb-10">
            Vigil is free and open source. Run it locally with Docker Compose or deploy to your own infrastructure.
          </p>
          <div className="bg-vigil-bg border border-vigil-border rounded-xl py-6 px-8 text-left font-mono text-sm text-slate-200 mb-8">
            <div className="text-vigil-muted-dark mb-2"># Clone the repo</div>
            <div className="mb-4">git clone https://github.com/SBTabanar/vigil-cloud-security.git</div>
            <div className="text-vigil-muted-dark mb-2"># Start everything</div>
            <div>cd vigil-cloud-security && docker-compose up --build -d</div>
          </div>
          <div className="flex justify-center gap-6">
            <div className="text-center">
              <Terminal size={24} className="text-vigil-primary mx-auto mb-2" />
              <div className="text-sm font-semibold text-vigil-text">FastAPI Backend</div>
              <div className="text-xs text-vigil-muted-dark">localhost:8000</div>
            </div>
            <div className="text-center">
              <Code size={24} className="text-vigil-success mx-auto mb-2" />
              <div className="text-sm font-semibold text-vigil-text">React Frontend</div>
              <div className="text-xs text-vigil-muted-dark">localhost:5173</div>
            </div>
            <div className="text-center">
              <GitBranch size={24} className="text-amber-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-vigil-text">AGPL-3.0 Licensed</div>
              <div className="text-xs text-vigil-muted-dark">Free forever</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold text-vigil-text mb-4">
          Ready to Explore?
        </h2>
        <p className="text-[17px] text-vigil-muted max-w-[500px] mx-auto mb-8">
          Try the live demo with pre-loaded scan data, or clone the repo and run it yourself.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-vigil-primary text-white py-3.5 px-8 rounded-[10px] text-base font-semibold inline-flex items-center gap-2">
            Try the Demo <ArrowRight size={18} />
          </Link>
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" className="border border-vigil-border-light text-slate-200 py-3.5 px-8 rounded-[10px] text-base font-semibold inline-flex items-center gap-2">
            View on GitHub
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vigil-border py-10 px-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-4">
          <Shield size={20} className="text-vigil-primary" />
          <span className="font-bold text-vigil-text">Vigil</span>
        </div>
        <p className="text-[13px] text-vigil-muted-dark">
          Cloud Security & Compliance Automation — Built by SBTabanar
        </p>
        <p className="text-xs text-slate-600 mt-2">
          HIPAA · GDPR · SOC2 · PCI DSS · ISO 27001 · CIS · NIST CSF
        </p>
        <div className="flex justify-center gap-5 mt-4">
          <a href="https://github.com/SBTabanar/vigil-cloud-security" target="_blank" rel="noopener noreferrer" className="text-xs text-vigil-muted-dark">
            GitHub
          </a>
          <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noopener noreferrer" className="text-xs text-vigil-muted-dark">
            AGPL-3.0 License
          </a>
        </div>
        <p className="text-[11px] text-vigil-border-light mt-4">
          &copy; 2025 SBTabanar. Open source under AGPL-3.0.
        </p>
      </footer>
    </div>
  )
}
