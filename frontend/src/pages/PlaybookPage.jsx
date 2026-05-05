import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, ChevronDown, ChevronRight, Shield, Brain, 
  Database, Cloud, Lock, Code, Server, CreditCard, 
  Mail, FileText, Zap, Terminal, Globe, Key, 
  Activity, Layers, ArrowLeft, Search, Lightbulb,
  Cpu, GitBranch, Box, AlertTriangle
} from 'lucide-react'

const Section = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ 
      background: '#0f172a', 
      border: '1px solid #1e293b', 
      borderRadius: 12, 
      marginBottom: 16,
      overflow: 'hidden'
    }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{ 
          width: '100%', 
          padding: '20px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 14,
          background: 'transparent',
          border: 'none',
          color: '#f8fafc',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ 
          width: 40, 
          height: 40, 
          borderRadius: 10, 
          background: 'rgba(59, 130, 246, 0.1)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Icon size={20} color="#3b82f6" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f8fafc', margin: 0 }}>{title}</h3>
        </div>
        {open ? <ChevronDown size={20} color="#64748b" /> : <ChevronRight size={20} color="#64748b" />}
      </button>
      {open && (
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid #1e293b' }}>
          {children}
        </div>
      )}
    </div>
  )
}

const CodeBlock = ({ title, code, lang = 'python' }) => (
  <div style={{ margin: '16px 0' }}>
    {title && <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6, fontWeight: 600 }}>{title}</div>}
    <pre style={{ 
      background: '#0a0e1a', 
      padding: 16, 
      borderRadius: 8, 
      overflow: 'auto',
      fontSize: 13,
      color: '#e2e8f0',
      border: '1px solid #1e293b',
      lineHeight: 1.6
    }}>
      <code>{code}</code>
    </pre>
  </div>
)

const Analogy = ({ children }) => (
  <div style={{ 
    background: 'rgba(245, 158, 11, 0.05)', 
    border: '1px solid rgba(245, 158, 11, 0.2)', 
    borderRadius: 8, 
    padding: '14px 18px',
    margin: '16px 0',
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start'
  }}>
    <Lightbulb size={18} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
    <div style={{ fontSize: 14, color: '#d4d4d8', lineHeight: 1.6 }}>
      <strong style={{ color: '#fbbf24' }}>Analogy:</strong> {children}
    </div>
  </div>
)

const KeyConcept = ({ term, children }) => (
  <div style={{ margin: '12px 0', paddingLeft: 16, borderLeft: '2px solid #3b82f6' }}>
    <span style={{ fontWeight: 600, color: '#60a5fa', fontSize: 14 }}>{term}</span>
    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>{children}</p>
  </div>
)

const Step = ({ number, title, desc }) => (
  <div style={{ display: 'flex', gap: 16, margin: '16px 0', alignItems: 'flex-start' }}>
    <div style={{ 
      width: 32, 
      height: 32, 
      borderRadius: '50%', 
      background: 'rgba(59, 130, 246, 0.1)', 
      border: '1px solid rgba(59, 130, 246, 0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 14,
      fontWeight: 700,
      color: '#3b82f6',
      flexShrink: 0
    }}>{number}</div>
    <div>
      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15 }}>{title}</div>
      <div style={{ color: '#94a3b8', fontSize: 14, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
    </div>
  </div>
)

export default function PlaybookPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('architecture')

  const tabs = [
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'security', label: 'Auth & Security', icon: Lock },
    { id: 'scanner', label: 'Scan Engine', icon: Zap },
    { id: 'ml', label: 'ML Brain', icon: Brain },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'remediation', label: 'Remediation', icon: Code },
    { id: 'aws', label: 'AWS Integration', icon: Cloud },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'deploy', label: 'Deployment', icon: Server },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a' }}>
      {/* Header */}
      <div style={{ 
        background: '#0f172a', 
        borderBottom: '1px solid #1e293b', 
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <button onClick={() => navigate('/app')} style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div style={{ width: 1, height: 20, background: '#334155' }} />
        <BookOpen size={20} color="#3b82f6" />
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc', margin: 0 }}>Vigil Master Playbook</h1>
        <span style={{ 
          fontSize: 11, 
          padding: '3px 10px', 
          background: 'rgba(239, 68, 68, 0.1)', 
          color: '#ef4444', 
          borderRadius: 4,
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontWeight: 600
        }}>ADMIN ONLY</span>
      </div>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: 240, 
          borderRight: '1px solid #1e293b', 
          padding: '24px 12px',
          position: 'sticky',
          top: 65,
          height: 'calc(100vh - 65px)',
          overflow: 'auto'
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, paddingLeft: 12 }}>
            Modules
          </div>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: '100%',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: 8,
                color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                marginBottom: 2
              }}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 900 }}>
          
          {/* ARCHITECTURE TAB */}
          {activeTab === 'architecture' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>System Architecture</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32, lineHeight: 1.6 }}>
                Understanding how all the pieces fit together. Think of Vigil as a security camera system for your cloud — 
                but instead of just recording, it understands what it sees, predicts threats, and fixes vulnerabilities automatically.
              </p>

              <Section title="The Big Picture" icon={Layers} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Vigil is a <strong style={{ color: '#e2e8f0' }}>multi-tenant SaaS platform</strong> built on a layered architecture. 
                  Each layer has a single responsibility, and they communicate through well-defined APIs.
                </p>
                
                <div style={{ 
                  background: '#0a0e1a', 
                  border: '1px solid #1e293b', 
                  borderRadius: 12, 
                  padding: 24,
                  margin: '20px 0'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { layer: 'Frontend (React)', desc: 'What the user sees — dashboards, forms, charts', color: '#3b82f6' },
                      { layer: 'API Gateway (FastAPI)', desc: 'Traffic cop — routes requests, validates auth, rate limits', color: '#8b5cf6' },
                      { layer: 'Business Logic', desc: 'The brain — scans, ML scoring, compliance checks', color: '#22c55e' },
                      { layer: 'Data Layer', desc: 'SQLite (now) / PostgreSQL (later) + Redis cache', color: '#f59e0b' },
                      { layer: 'External APIs', desc: 'AWS (scan target), Stripe (billing), SendGrid (email)', color: '#ef4444' }
                    ].map((item, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12,
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 8,
                        borderLeft: `3px solid ${item.color}`
                      }}>
                        <div style={{ fontWeight: 600, color: '#e2e8f0', minWidth: 180 }}>{item.layer}</div>
                        <div style={{ color: '#94a3b8', fontSize: 14 }}>{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Analogy>
                  Imagine a hospital. The frontend is the reception desk where patients check in. 
                  FastAPI is the triage nurse who checks your ID and routes you to the right department. 
                  The business logic is the doctors and lab technicians doing the actual diagnosis. 
                  The database is the medical records room. External APIs are the specialist clinics 
                  you refer patients to.
                </Analogy>

                <KeyConcept term="Request Lifecycle">
                  When a user clicks "Run Scan," the request travels: <br/>
                  Browser → Vite Dev Server → FastAPI Router → Auth Middleware → Service Layer → Database → AWS API → Back to Browser.
                  Each hop adds latency, so we use async/await and Redis caching to keep it under 200ms.
                </KeyConcept>
              </Section>

              <Section title="Request Flow Diagram" icon={Activity}>
                <Step 
                  number={1} 
                  title="User clicks 'Run Scan' in React"
                  desc="The frontend makes a POST request to /api/v1/organizations/{id}/scans with the JWT token in the Authorization header."
                />
                <Step 
                  number={2} 
                  title="FastAPI receives the request"
                  desc="The router matches the URL to the create_scan() function. Depends() injections fetch the DB session and current user automatically."
                />
                <Step 
                  number={3} 
                  title="Auth middleware validates JWT"
                  desc="The token is decoded using the SECRET_KEY. If valid, the User object is attached to the request. If expired, 401 Unauthorized."
                />
                <Step 
                  number={4} 
                  title="Permission check"
                  desc="We verify the user is a member of the organization they're trying to scan. If not, 403 Forbidden."
                />
                <Step 
                  number={5} 
                  title="AWS account validation"
                  desc="Check if the org has connected AWS accounts with is_connected=true. If not, reject with 400."
                />
                <Step 
                  number={6} 
                  title="Scan record created"
                  desc="A Scan row is inserted into SQLite with status='running'. This gives the user immediate feedback."
                />
                <Step 
                  number={7} 
                  title="Async processing (simulated)"
                  desc="In production, this triggers a Celery worker. For now, _simulate_scan() runs immediately, generating findings."
                />
                <Step 
                  number={8} 
                  title="Email notification sent"
                  desc="SendGrid fires a scan_complete email to the org owner with summary stats."
                />
                <Step 
                  number={9} 
                  title="Response returned"
                  desc="The ScanResponse Pydantic model serializes the scan object to JSON and returns it to the frontend."
                />
              </Section>

              <Section title="Database Schema" icon={Database}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  We use <strong>SQLAlchemy ORM</strong> with SQLite for development. In production, you'd swap to PostgreSQL 
                  by changing the DATABASE_URL environment variable. No code changes needed.
                </p>
                
                <CodeBlock title="User Table" code={`class User(Base):
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    
    # Relationship: one user can be in many orgs
    organizations = relationship("OrganizationMember", back_populates="user")`} />

                <Analogy>
                  Think of SQLAlchemy as a translator. You write Python objects (User, Organization), 
                  and SQLAlchemy translates those into SQL CREATE TABLE statements. When you query 
                  db.query(User).filter(User.email == 'x'), it becomes SELECT * FROM users WHERE email = 'x'.
                  The relationship() directive is like saying "a person can have multiple memberships at different gyms."
                </Analogy>

                <KeyConcept term="Foreign Keys & Relationships">
                  OrganizationMember is a <strong>junction table</strong> (also called associative entity). 
                  It connects User to Organization with extra metadata (role). This is how you implement 
                  many-to-many relationships in relational databases. Without it, you'd have to choose: 
                  either a user can only be in one org, or an org can only have one user.
                </KeyConcept>

                <CodeBlock title="OrganizationMember (Junction Table)" code={`class OrganizationMember(Base):
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    organization_id = Column(Integer, ForeignKey("organizations.id"))
    role = Column(String, default="member")  # owner, admin, member
    
    user = relationship("User", back_populates="organizations")
    organization = relationship("Organization", back_populates="members")`} />
              </Section>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Authentication & Security</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How we keep bad actors out while letting legitimate users in. This is the bouncer at the club.
              </p>

              <Section title="Password Hashing with BCrypt" icon={Lock} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  We never store passwords in plain text. BCrypt is a <strong>one-way hashing algorithm</strong> 
                  specifically designed to be slow. This makes brute-force attacks impractical.
                </p>

                <CodeBlock title="How it works" code={`from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Registration: hash the password
hashed = pwd_context.hash("my_password")
# Stored in DB: $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiAYMyzJ/I0q

# Login: verify against hash
is_valid = pwd_context.verify("my_password", hashed)  # True
is_valid = pwd_context.verify("wrong_password", hashed)  # False`} />

                <Analogy>
                  Imagine BCrypt as a meat grinder. You can put meat in and get ground beef out, 
                  but you cannot reconstruct the original steak from the ground beef. 
                  The "slowness" is intentional — it's like making the grinder turn extra slowly 
                  so that someone trying to grind 10 million steaks (brute force) gives up.
                </Analogy>

                <KeyConcept term="Salting">
                  BCrypt automatically adds a <strong>salt</strong> — random data prepended to the password 
                  before hashing. This means two users with the same password get completely different hashes. 
                  Without salting, attackers could pre-compute hashes (rainbow tables) and instantly crack common passwords.
                </KeyConcept>
              </Section>

              <Section title="JWT Tokens" icon={Key}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  After login, we don't ask for the password on every request. Instead, we issue a 
                  <strong>JSON Web Token (JWT)</strong> — a signed ticket that proves identity.
                </p>

                <CodeBlock title="JWT Structure" code={`# A JWT looks like: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzc4MDM0MDkzfQ.signature
# It has 3 parts separated by dots:

# Part 1 - Header (Base64 encoded)
{"alg": "HS256", "typ": "JWT"}

# Part 2 - Payload (the claims)
{"sub": "1", "exp": 1778034093}  # sub = user_id, exp = expiration timestamp

# Part 3 - Signature
HMACSHA256(base64(header) + "." + base64(payload), SECRET_KEY)`} />

                <Analogy>
                  A JWT is like a concert wristband. When you enter the venue (login), security checks your ticket 
                  and puts a wristband on you. For the rest of the night, you just show the wristband to access 
                  different areas. The wristband has an expiration time — after the concert ends, it's useless.
                  The signature is like a hologram on the wristband that proves it's real, not a counterfeit.
                </Analogy>

                <KeyConcept term="Why stateless?">
                  JWTs are <strong>stateless</strong> — the server doesn't need to look up the token in a database. 
                  It just validates the signature and reads the payload. This scales horizontally: you can have 
                  100 backend servers and any of them can validate the token without sharing session state.
                </KeyConcept>

                <KeyConcept term="The trade-off">
                  You cannot revoke a JWT before it expires (unless you maintain a blacklist, which ruins the stateless benefit). 
                  That's why we keep the expiration short (24 hours). For critical operations, we can add a 
                  "token version" in the database and reject old versions.
                </KeyConcept>
              </Section>

              <Section title="CORS (Cross-Origin Resource Sharing)" icon={Globe}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Browsers enforce a security rule: a webpage from domain A cannot make requests to domain B 
                  unless domain B explicitly allows it. This prevents malicious websites from calling your API 
                  using the user's logged-in cookies.
                </p>

                <Analogy>
                  CORS is like a building's visitor policy. If you work in Building A, you can't just walk into 
                  Building B's secure areas. Building B has to explicitly put your company on the approved visitor list.
                  In our case, the frontend runs on localhost:5173 and the API on localhost:8000 — different ports 
                  count as different origins, so we add localhost:5173 to the CORS allowlist.
                </Analogy>

                <CodeBlock title="CORS Middleware" code={`origins = [settings.FRONTEND_URL]
if settings.DEBUG:
    origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)`} />

                <AlertTriangle size={16} color="#f59e0b" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                <span style={{ color: '#fbbf24', fontSize: 14 }}>
                  We use a strict origin whitelist. Never allow credentials with wildcard origins — this is enforced even in development.
                </span>
              </Section>
            </div>
          )}

          {/* SCANNER TAB */}
          {activeTab === 'scanner' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>The Scan Engine</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How we turn raw AWS CloudTrail logs into actionable security intelligence.
              </p>

              <Section title="CloudTrail Ingestion" icon={Cloud} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  CloudTrail records every API call made in your AWS account. It's like a security camera 
                  that films everything — who did what, when, from where, and what happened.
                </p>

                <CodeBlock title="CloudTrail Event Structure" code={`{
  "eventTime": "2024-01-15T09:40:09Z",
  "eventName": "PutBucketPolicy",
  "eventSource": "s3.amazonaws.com",
  "userIdentity": {
    "type": "IAMUser",
    "arn": "arn:aws:iam::123:user/admin",
    "principalId": "AIDA..."
  },
  "sourceIPAddress": "203.0.113.45",
  "requestParameters": {
    "bucketName": "customer-data",
    "bucketPolicy": "{\"Principal\":\"*\"...}"
  },
  "responseElements": null,
  "errorCode": null
}`} />

                <Analogy>
                  CloudTrail is like a bank's transaction log. Every deposit, withdrawal, and account change 
                  is recorded with the teller's ID, the customer's ID, the time, and the amount. 
                  If money goes missing, you replay the log to find out what happened.
                </Analogy>

                <KeyConcept term="EventSource vs EventName">
                  <strong>eventSource</strong> is the AWS service (s3.amazonaws.com, ec2.amazonaws.com, iam.amazonaws.com). 
                  <strong>eventName</strong> is the specific action (PutBucketPolicy, RunInstances, CreateAccessKey). 
                  Together they form a unique fingerprint of what happened.
                </KeyConcept>
              </Section>

              <Section title="Attack Sequence Detection" icon={Activity}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Individual API calls are meaningless. The real signal is in <strong>sequences</strong> — patterns 
                  of calls that reveal attacker behavior. We group events by actor and time window.
                </p>

                <CodeBlock title="Sequence Builder Logic" code={`def build_attack_sequences(events, window_minutes=10, max_gap_minutes=5):
    # Group by actor (who made the calls)
    actor_events = defaultdict(list)
    for event in events:
        actor_events[event.actor_arn].append(event)
    
    sequences = []
    for actor, evts in actor_events.items():
        evts.sort(key=lambda e: e.event_time)
        current_sequence = []
        
        for event in evts:
            if not current_sequence:
                current_sequence = [event]
                continue
            
            time_gap = (event.event_time - current_sequence[-1].event_time).minutes
            
            if time_gap > max_gap_minutes:
                # Start new sequence — too much time passed
                if len(current_sequence) >= 2:
                    sequences.append(current_sequence)
                current_sequence = [event]
            else:
                current_sequence.append(event)
        
        # Don't forget the last sequence
        if len(current_sequence) >= 2:
            sequences.append(current_sequence)
    
    return sequences`} />

                <Analogy>
                  Imagine watching security footage. If someone walks through the lobby at 9:00, 
                  checks the directory at 9:02, and tries a door handle at 9:03 — that's a sequence. 
                  If the same person comes back at 2:00 PM, that's a different sequence. 
                  The time gap threshold (5 minutes) is what separates "one continuous action" from "two separate visits."
                </Analogy>

                <KeyConcept term="Why sequences matter">
                  A single `ListBuckets` call is normal. But `ListBuckets` → `GetBucketAcl` → `PutBucketPolicy` 
                  in 30 seconds is a reconnaissance-to-exploitation chain. The sequence reveals intent.
                </KeyConcept>
              </Section>

              <Section title="The Kill Chain Model" icon={AlertTriangle}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  We classify API calls into MITRE ATT&CK phases to understand where an attacker is in their operation.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { phase: 'Reconnaissance', events: 'ListBuckets, ListRoles, DescribeInstances, GetAccountAuthorizationDetails', desc: 'Gathering intel — "What do they have?"' },
                    { phase: 'Privilege Escalation', events: 'CreateAccessKey, AttachRolePolicy, UpdateAssumeRolePolicy', desc: 'Gaining more power — "How do I get admin?"' },
                    { phase: 'Credential Access', events: 'GetSecretValue, GetPasswordData', desc: 'Stealing keys — "What secrets can I find?"' },
                    { phase: 'Data Access', events: 'GetObject, CreateSnapshot, DescribeSecret', desc: 'Touching valuable data — "What can I steal?"' },
                    { phase: 'Impact', events: 'DeleteBucket, TerminateInstances, PutBucketPolicy', desc: 'Causing damage — "How do I hurt them?"' }
                  ].map((chain, i) => (
                    <div key={i} style={{ 
                      padding: '14px 18px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 8,
                      borderLeft: `3px solid ${['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#dc2626'][i]}`
                    }}>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 15, marginBottom: 4 }}>{chain.phase}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4, fontFamily: 'monospace' }}>{chain.events}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>{chain.desc}</div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* ML TAB */}
          {activeTab === 'ml' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>The ML Brain</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How XGBoost learns to distinguish between a CI/CD pipeline and a crypto miner.
              </p>

              <Section title="XGBoost: The Algorithm" icon={Brain} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  <strong>XGBoost</strong> (eXtreme Gradient Boosting) is a decision-tree ensemble algorithm. 
                  It builds hundreds of small decision trees, each correcting the errors of the previous ones.
                </p>

                <Analogy>
                  Imagine you're trying to predict if someone is a shoplifter. One security guard might look 
                  at bag size. Another at how long they linger. A third at eye contact. Each guard alone 
                  is mediocre. But if you combine all their opinions — weighted by accuracy — you get a 
                  much better predictor. XGBoost is that committee of 200 security guards, where each new 
                  guard specializes in the cases the previous guards got wrong.
                </Analogy>

                <KeyConcept term="Why XGBoost for security?">
                  Security data is <strong>tabular, sparse, and imbalanced</strong>. Neural networks need millions 
                  of examples. XGBoost works well with thousands. It handles missing values naturally and 
                  provides feature importance — you can explain WHY it flagged something.
                </KeyConcept>

                <CodeBlock title="Feature Vector (22 dimensions)" code={`features = [
    num_events,              # How many API calls in the sequence
    duration_minutes,        # How long did it last
    recon_count,             # How many reconnaissance calls
    priv_esc_count,          # How many privilege escalation calls
    data_access_count,       # How many data access calls
    privileged_api_count,    # How many admin-level calls
    error_count,             # How many errors (probing behavior)
    auth_error_count,        # How many auth failures (brute force)
    unique_event_names,      # Diversity of API calls
    unique_services,         # How many AWS services touched
    unique_regions,          # Geographic spread
    unique_ips,              # Source IP diversity
    burstiness,              # Coefficient of variation (automation signal)
    avg_time_between_events, # Speed pattern
    max_gap_seconds,         # Longest pause
    starts_with_recon,       # Binary: did sequence start with recon?
    ends_with_impact,        # Binary: did sequence end with destruction?
    has_priv_esc_after_recon,# Kill chain progression
    has_data_access_after_priv_esc,
    any_mfa,                 # Was MFA present?
    all_errors,              # Did every call fail?
    mixed_success_errors     # Both success and failure?
]`} />
              </Section>

              <Section title="Synthetic Training Data" icon={Cpu}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  We can't wait for real breaches to train the model. Instead, we generate <strong>synthetic 
                  labeled sequences</strong> — fake data that mimics real attack patterns.
                </p>

                <Analogy>
                  Fighter pilots don't train by crashing real planes. They use flight simulators. 
                  Our synthetic data generator is a flight simulator for cloud attacks. We define rules: 
                  "a crypto miner uses RunInstances in odd regions with high burstiness." Then we generate 
                  10,000 examples of that pattern. The model learns from the simulator before seeing real combat.
                </Analogy>

                <KeyConcept term="Benign Patterns">
                  <strong>CI/CD pipelines</strong> have moderate burst, few services, no privilege escalation. 
                  <strong>Admin tasks</strong> are sparse, long gaps, MFA present. 
                  <strong>Backups</strong> are regular, single service, no errors.
                </KeyConcept>

                <KeyConcept term="Malicious Patterns">
                  <strong>Recon + PrivEsc</strong> = high burst, many auth errors, no data access yet. 
                  <strong>Full kill chain</strong> = recon → privesc → data access → impact, all in under 30 minutes. 
                  <strong>Credential stuffing</strong> = 100% errors, single event type, multiple IPs.
                </KeyConcept>
              </Section>

              <Section title="Risk Score Calculation" icon={Activity}>
                <CodeBlock title="From Probability to Business Score" code={`def predict_risk_score(sequence_features):
    # XGBoost outputs probability of maliciousness (0.0 - 1.0)
    probability = model.predict_proba(sequence_features)[1]
    
    # Convert to 0-1000 scale for readability
    # 0.5 threshold = 500/1000 = "flip a coin"
    # 0.95 = 950/1000 = "almost certainly an attack"
    risk_score = probability * 1000
    
    return min(risk_score, 1000)`} />

                <Analogy>
                  The raw probability is like a weather forecast saying "70% chance of rain." 
                  The risk score is the meteorologist adding: "And you have a $2M outdoor wedding today, 
                  so the real impact is critical." We combine exploit likelihood (ML) with business impact 
                  (asset criticality, data sensitivity) to produce the final score.
                </Analogy>
              </Section>
            </div>
          )}

          {/* COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>The Compliance Engine</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                One policy check. Seven frameworks. Zero manual spreadsheet work.
              </p>

              <Section title="Policy-to-Framework Mapping" icon={Shield} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Traditional compliance: you write 15 separate checks for 15 frameworks. 
                  Vigil: you write 1 check, and it automatically maps to all relevant frameworks.
                </p>

                <CodeBlock title="Single Policy, Multiple Frameworks" code={`"s3-public-access": {
    "id": "s3-public-access",
    "name": "S3 Bucket Public Access Enabled",
    "severity": "critical",
    "frameworks": [
        "CIS AWS Foundations 3.0:2.1.5",
        "PCI DSS 4.0:1.3.1",
        "SOC2 Type II:CC6.6",
        "HIPAA:164.312(a)(1)",
        "GDPR:Art. 32(1)(b)",
        "GDPR:Art. 5(1)(f)"
    ]
}`} />

                <Analogy>
                  Imagine writing a restaurant health inspection. In the old world, you'd fill out a form 
                  for the city health department, a different form for the state, another for the insurance 
                  company, and a fourth for the franchise HQ. In Vigil, you note "refrigerator at 45°F" once, 
                  and it populates all four forms automatically.
                </Analogy>
              </Section>

              <Section title="HIPAA Deep Dive" icon={FileText}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  HIPAA is the most complex framework because it mixes technical controls with administrative procedures.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { rule: '164.312(a)(1)', name: 'Access Control', check: 'S3 public access, IAM over-permission', penalty: '$100 - $50K per violation' },
                    { rule: '164.312(a)(2)(iv)', name: 'Encryption', check: 'Unencrypted EBS, RDS, S3', penalty: '$1K - $50K' },
                    { rule: '164.312(b)', name: 'Audit Controls', check: 'Missing CloudTrail, VPC Flow Logs', penalty: '$10K - $50K' },
                    { rule: '164.308(a)(7)', name: 'Data Backup', check: 'No automated RDS backups', penalty: '$10K - $50K' },
                    { rule: '164.502(b)', name: 'Minimum Necessary', check: 'IAM policies too broad for PHI', penalty: '$100 - $50K' }
                  ].map((rule, i) => (
                    <div key={i} style={{ 
                      padding: '14px 18px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 8,
                      borderLeft: '3px solid #ef4444'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{rule.rule}</span>
                        <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>{rule.penalty}</span>
                      </div>
                      <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 4 }}>{rule.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>Vigil checks: {rule.check}</div>
                    </div>
                  ))}
                </div>

                <Analogy>
                  HIPAA is like a building code for hospitals. 164.312(a)(1) is "locks on doors." 
                  164.312(a)(2)(iv) is "fireproof walls." 164.312(b) is "security cameras." 
                  Vigil is the building inspector that checks all three automatically and tells you 
                  exactly which rooms fail.
                </Analogy>
              </Section>

              <Section title="GDPR Deep Dive" icon={Globe}>
                <KeyConcept term="Art. 32(1) — Security of Processing">
                  Requires "appropriate technical measures" to protect personal data. 
                  Vigil validates: encryption at rest, encryption in transit, access controls, and audit logging.
                </KeyConcept>

                <KeyConcept term="Art. 25(1) — Data Protection by Design">
                  Privacy must be built in, not bolted on. Vigil checks: default deny IAM policies, 
                  private S3 buckets by default, encryption enabled by default.
                </KeyConcept>

                <KeyConcept term="Art. 17 — Right to Erasure">
                  Users can demand deletion. Vigil checks: lifecycle policies on S3, automated cleanup 
                  rules, and data residency (no personal data stored outside EU without safeguards).
                </KeyConcept>

                <KeyConcept term="Art. 33 — Breach Notification">
                  72-hour notification requirement. Vigil monitors: real-time alerts for unauthorized access, 
                  drift detection, and automated incident timeline generation.
                </KeyConcept>
              </Section>
            </div>
          )}

          {/* REMEDIATION TAB */}
          {activeTab === 'remediation' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>The Remediation Pipeline</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                Finding problems is useless if you don't fix them. Here's how we go from alert to resolved.
              </p>

              <Section title="Terraform Patch Generation" icon={Code} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  For every finding, we generate an <strong>Infrastructure-as-Code patch</strong>. 
                  This is better than clicking "fix" in the console because it's auditable, reversible, and version-controlled.
                </p>

                <CodeBlock title="Example: S3 Public Access Fix" code={`# Finding: S3 bucket allows public read access
# Resource: arn:aws:s3:::customer-data

resource "aws_s3_bucket_public_access_block" "customer_data_block" {
  bucket = "customer-data"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Additional: enforce TLS-only connections
resource "aws_s3_bucket_policy" "customer_data_tls" {
  bucket = "customer-data"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource  = [
        "arn:aws:s3:::customer-data",
        "arn:aws:s3:::customer-data/*"
      ]
      Condition = {
        Bool = { "aws:SecureTransport" = "false" }
      }
    }]
  })
}`} />

                <Analogy>
                  Clicking "fix" in the AWS console is like duct-taping a leaky pipe. It works, but there's 
                  no record of what you did. Terraform is like hiring a plumber who leaves a detailed invoice 
                  and warranty. If the leak comes back, you know exactly what was changed and can roll it back.
                </Analogy>

                <KeyConcept term="GitHub PR Integration">
                  Instead of applying Terraform directly, Vigil can open a Pull Request in your infrastructure repo. 
                  This means: (1) code review before changes, (2) CI/CD pipeline validation, (3) audit trail via Git history.
                </KeyConcept>
              </Section>

              <Section title="Remediation Complexity Tiers" icon={Layers}>
                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { tier: 'One-Click', example: 'Enable S3 Block Public Access', risk: 'None', time: '3 min', auto: true },
                    { tier: 'Automated', example: 'Attach MFA enforcement policy', risk: 'Low', time: '10 min', auto: true },
                    { tier: 'Semi-Automated', example: 'Restrict security group CIDR blocks', risk: 'Medium', time: '15 min', auto: false },
                    { tier: 'Manual', example: 'Redesign VPC network segmentation', risk: 'High', time: '4 hours', auto: false }
                  ].map((item, i) => (
                    <div key={i} style={{ 
                      padding: '14px 18px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 8,
                      borderLeft: `3px solid ${item.auto ? '#22c55e' : '#f59e0b'}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: '#f8fafc' }}>{item.tier}</span>
                        <span style={{ fontSize: 12, color: item.auto ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                          {item.auto ? 'Auto-Apply' : 'Requires Review'}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, color: '#94a3b8' }}>{item.example}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        Blast radius: {item.risk} · Time: {item.time}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

          {/* AWS TAB */}
          {activeTab === 'aws' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>AWS Integration</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How we read your AWS environment without ever storing your credentials.
              </p>

              <Section title="Cross-Account IAM Role" icon={Cloud} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Instead of asking for AWS access keys (which never expire and are hard to revoke), 
                  we use a <strong>cross-account IAM role with External ID</strong>. This is the AWS-recommended 
                  pattern for third-party access.
                </p>

                <CodeBlock title="Trust Policy (in your AWS account)" code={`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "AWS": "arn:aws:iam::VIGIL_ACCOUNT:root"
    },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": {
        "sts:ExternalId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      }
    }
  }]
}`} />

                <Analogy>
                  Imagine you hire a cleaning service. Instead of giving them your house keys permanently 
                  (access keys), you install a smart lock that only opens when the cleaning company calls 
                  you from their verified office phone number (External ID), and even then, they can only 
                  enter during scheduled hours (AssumeRole). You can revoke their access instantly from your app.
                </Analogy>

                <KeyConcept term="The Confused Deputy Problem">
                  Without an External ID, a malicious actor could trick Vigil into accessing THEIR account 
                  by pretending to be a legitimate customer. The External ID is a shared secret that proves 
                  the customer actually authorized the connection. It's like a PIN code for the smart lock.
                </KeyConcept>

                <KeyConcept term="Temporary Credentials">
                  When Vigil calls sts:AssumeRole, AWS returns temporary credentials that expire in 1 hour. 
                  Vigil never stores long-term keys. If our server is compromised, the attacker gets nothing 
                  useful — the tokens expire before they can be exploited.
                </KeyConcept>
              </Section>

              <Section title="Least Privilege Permissions" icon={Shield}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  The cross-account role uses two AWS-managed policies plus one custom inline policy. 
                  Total access: read-only, no data modification possible.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #22c55e' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>SecurityAudit (AWS Managed)</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Read-only access to security configuration: IAM, KMS, CloudTrail, Config, GuardDuty</div>
                  </div>
                  <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #22c55e' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>ReadOnlyAccess (AWS Managed)</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>Read-only access to all AWS resources: EC2, S3, RDS, Lambda, etc. Cannot modify anything.</div>
                  </div>
                  <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, borderLeft: '3px solid #3b82f6' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>VigilScannerAdditional (Custom)</div>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>cloudtrail:LookupEvents, cloudtrail:GetTrail, config:Get*, config:List*</div>
                  </div>
                </div>

                <Analogy>
                  These permissions are like a museum security guard's access card. They can walk through 
                  every gallery (ReadOnlyAccess), check the alarm system status (SecurityAudit), and review 
                  the visitor logbook (CloudTrail). But they cannot touch the paintings, open the vault, 
                  or change the alarm codes.
                </Analogy>
              </Section>
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Billing & Subscriptions</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How Stripe handles money while you handle security.
              </p>

              <Section title="Stripe Integration Flow" icon={CreditCard} defaultOpen={true}>
                <Step 
                  number={1} 
                  title="Customer clicks 'Upgrade'"
                  desc="Frontend calls POST /api/v1/billing/checkout with plan='professional'"
                />
                <Step 
                  number={2} 
                  title="Backend creates Stripe Checkout Session"
                  desc="We pass the Stripe Price ID, customer email, and metadata (org_id, plan). Stripe returns a unique URL."
                />
                <Step 
                  number={3} 
                  title="Customer enters card on Stripe-hosted page"
                  desc="We never see or touch credit card numbers. PCI compliance handled entirely by Stripe."
                />
                <Step 
                  number={4} 
                  title="Stripe redirects to success URL"
                  desc="Customer lands back on our platform. Meanwhile, Stripe fires webhook checkout.session.completed."
                />
                <Step 
                  number={5} 
                  title="Webhook activates subscription"
                  desc="Our /billing/webhook endpoint receives the event, extracts org_id from metadata, and updates the database: subscription_status='active', plan='professional'."
                />

                <Analogy>
                  Stripe is like a payment processing company that sets up a booth at your event. 
                  They handle the cash register, credit card swipes, and receipts. You just tell them 
                  "this person bought a ticket" and they hand you the money (minus their fee). 
                  You never touch the money directly, which means you don't need a money-transmitter license.
                </Analogy>
              </Section>

              <Section title="Webhook Security" icon={Lock}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Webhooks are HTTP requests from Stripe to our server. Anyone could fake them. 
                  We verify authenticity using the <strong>Stripe-Signature header</strong>.
                </p>

                <CodeBlock title="Webhook Verification" code={`event = stripe.Webhook.construct_event(
    payload=request.body,
    sig_header=request.headers["Stripe-Signature"],
    secret=STRIPE_WEBHOOK_SECRET  # Only Stripe and we know this
)`} />

                <KeyConcept term="Why this matters">
                  Without signature verification, an attacker could POST a fake "payment succeeded" webhook 
                  and get premium access for free. The webhook secret is a shared key that proves the message 
                  came from Stripe, not an impostor.
                </KeyConcept>
              </Section>
            </div>
          )}

          {/* DEPLOYMENT TAB */}
          {activeTab === 'deploy' && (
            <div className="animate-fade-in">
              <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f8fafc', marginBottom: 8 }}>Deployment & Operations</h2>
              <p style={{ color: '#94a3b8', marginBottom: 32 }}>
                How Docker Compose turns code into a running business.
              </p>

              <Section title="Docker Compose Architecture" icon={Server} defaultOpen={true}>
                <p style={{ color: '#94a3b8', lineHeight: 1.7, marginBottom: 16 }}>
                  Docker Compose orchestrates three containers that talk to each other over an internal network.
                </p>

                <div style={{ display: 'grid', gap: 12 }}>
                  {[
                    { name: 'Backend Container', image: 'Python 3.11 + FastAPI', ports: '8000:8000', network: 'vigil_default', data: 'SQLite volume (backend_data)' },
                    { name: 'Frontend Container', image: 'Node 20 + Vite + React', ports: '5173:5173', network: 'vigil_default', data: 'None (build-time assets)' },
                    { name: 'Redis Container', image: 'Redis 7 Alpine', ports: '6379:6379', network: 'vigil_default', data: 'In-memory (ephemeral)' }
                  ].map((c, i) => (
                    <div key={i} style={{ 
                      padding: '14px 18px', 
                      background: 'rgba(255,255,255,0.02)', 
                      borderRadius: 8,
                      borderLeft: '3px solid #3b82f6'
                    }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b' }}>{c.image}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Port: {c.ports} · Network: {c.network}</div>
                      <div style={{ fontSize: 13, color: '#94a3b8' }}>Persistence: {c.data}</div>
                    </div>
                  ))}
                </div>

                <Analogy>
                  Docker Compose is like a property manager for an apartment building. You define the units 
                  (containers), their addresses (ports), shared utilities (network), and storage lockers (volumes). 
                  One command (`docker-compose up`) moves everyone in and connects the utilities. 
                  One command (`docker-compose down`) evicts everyone and cleans up.
                </Analogy>
              </Section>

              <Section title="Networking Flow" icon={GitBranch}>
                <CodeBlock title="Request Path in Docker" code={`# Browser makes request to localhost:5173
# ↓
# Host OS routes port 5173 to Frontend Container
# ↓
# Frontend (Vite dev server) proxies /api/* to backend:8000
#    Note: "backend" resolves to the backend container's internal IP
#    via Docker's embedded DNS server
# ↓
# Backend (FastAPI/Uvicorn) receives request
# ↓
# If caching needed: Backend connects to redis:6379
#    (also resolved via Docker DNS)
# ↓
# Backend reads/writes SQLite from mounted volume`} />

                <KeyConcept term="Container DNS">
                  Inside the Docker network, containers can reach each other by service name. 
                  The frontend container calls `http://backend:8000`, not `http://localhost:8000`. 
                  Docker's internal DNS resolves `backend` to the backend container's IP address.
                </KeyConcept>
              </Section>

              <Section title="Production Checklist" icon={Terminal}>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[
                    'Replace SQLite with PostgreSQL (RDS or managed)',
                    'Add PostgreSQL container to docker-compose.yml',
                    'Use environment variables for all secrets (never commit .env)',
                    'Set CORS allow_origins to exact domain only',
                    'Add nginx reverse proxy for SSL termination',
                    'Configure Stripe webhooks with live endpoint URL',
                    'Set up SendGrid domain authentication (SPF, DKIM, DMARC)',
                    'Add AWS CloudWatch or Datadog monitoring',
                    'Enable database backups (automated daily snapshots)',
                    'Set up log aggregation (CloudWatch Logs or ELK)',
                    'Add rate limiting on auth endpoints (prevent brute force)',
                    'Run security scan on Docker images (Trivy, Snyk)',
                    'Enable AWS WAF if using ALB/CloudFront',
                    'Set up health checks and auto-restart policies'
                  ].map((item, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 10,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 6
                    }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: '#334155' }} />
                      </div>
                      <span style={{ color: '#94a3b8', fontSize: 14 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
