import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Shield, User, Bell, Key, Globe, AlertTriangle, CreditCard, Wallet, ExternalLink } from 'lucide-react'

export default function SettingsPage() {
  const { user, logout, apiFetch } = useAuth()
  const [notifications, setNotifications] = useState({
    email: true,
    slack: false,
    critical: true,
    daily: true,
    weekly: true
  })
  const [subscription, setSubscription] = useState(null)
  const [plans, setPlans] = useState([])
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, plansRes] = await Promise.all([
          apiFetch('/billing/subscription'),
          apiFetch('/billing/plans')
        ])
        if (subRes.ok) setSubscription(await subRes.json())
        if (plansRes.ok) setPlans((await plansRes.json()).plans)
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [])

  const handleStripeCheckout = async (planId) => {
    setLoading(true)
    try {
      const res = await apiFetch('/billing/checkout', {
        method: 'POST',
        body: JSON.stringify({
          plan: planId,
          success_url: `${window.location.origin}/app/settings?upgraded=1`,
          cancel_url: `${window.location.origin}/app/settings?canceled=1`
        })
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePayMongoCheckout = async (planId, type) => {
    setLoading(true)
    try {
      const res = await apiFetch('/billing/checkout/paymongo', {
        method: 'POST',
        body: JSON.stringify({
          plan: planId,
          type,
          success_url: `${window.location.origin}/app/settings?upgraded=1`,
          failed_url: `${window.location.origin}/app/settings?canceled=1`
        })
      })
      const data = await res.json()
      if (data.checkout_url) window.location.href = data.checkout_url
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    setLoading(true)
    try {
      const res = await apiFetch('/billing/cancel', { method: 'POST' })
      if (res.ok) {
        alert('Subscription canceled.')
        window.location.reload()
      } else {
        const err = await res.json()
        alert(err.detail || 'Failed to cancel')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (status === 'active') return '#22c55e'
    if (status === 'trial') return '#3b82f6'
    if (status === 'past_due') return '#f97316'
    return '#ef4444'
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 24 }}>Settings</h1>

      <div style={{ display: 'grid', gap: 16 }}>
        {/* Profile */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <User size={20} color="#3b82f6" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Profile</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>Email</label>
              <input value={user?.email || ''} readOnly
                style={{ width: '100%', padding: 10, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 }}>Name</label>
              <input value={`${user?.first_name || ''} ${user?.last_name || ''}`} readOnly
                style={{ width: '100%', padding: 10, background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', fontSize: 14 }} />
            </div>
          </div>
        </div>

        {/* Billing & Subscription */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CreditCard size={20} color="#3b82f6" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Billing & Subscription</h2>
          </div>

          {subscription ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
                  padding: '4px 12px', borderRadius: 20,
                  background: `${getStatusColor(subscription.status)}20`,
                  color: getStatusColor(subscription.status)
                }}>
                  {subscription.status}
                </span>
                <span style={{ fontSize: 14, color: '#94a3b8' }}>
                  {subscription.plan} plan · {subscription.payment_provider || 'stripe'}
                </span>
                {subscription.trial_ends_at && (
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {subscription.status === 'active' ? (
                <button onClick={handleCancel} disabled={loading}
                  style={{ padding: '10px 20px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, fontSize: 13, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
                >
                  Cancel Subscription
                </button>
              ) : (
                <button onClick={() => setShowUpgrade(!showUpgrade)} disabled={loading}
                  style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
                >
                  {showUpgrade ? 'Hide Plans' : 'Upgrade Plan'}
                </button>
              )}
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: 14 }}>Loading subscription...</div>
          )}

          {/* Upgrade Plans */}
          {showUpgrade && plans.length > 0 && (
            <div style={{ marginTop: 20, display: 'grid', gap: 12 }}>
              {plans.map(plan => (
                <div key={plan.id} style={{ background: '#0a0e1a', border: '1px solid #334155', borderRadius: 8, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc' }}>{plan.name}</div>
                    <div style={{ fontSize: 14, color: '#94a3b8' }}>
                      {plan.price_monthly_display_usd} <span style={{ color: '#64748b', fontSize: 12 }}>/mo</span>
                      {plan.price_monthly_display_php && (
                        <span style={{ marginLeft: 8, color: '#22c55e' }}>{plan.price_monthly_display_php}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{plan.description}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {plan.features.map((f, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: '#1e293b', color: '#94a3b8', borderRadius: 4 }}>{f}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => handleStripeCheckout(plan.id)} disabled={loading}
                      style={{ flex: 1, padding: '8px 16px', background: '#3b82f6', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
                    >
                      Pay with Card (Stripe)
                    </button>
                    <button onClick={() => handlePayMongoCheckout(plan.id, 'gcash')} disabled={loading}
                      style={{ flex: 1, padding: '8px 16px', background: '#0a5c36', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
                    >
                      Pay with GCash
                    </button>
                    <button onClick={() => handlePayMongoCheckout(plan.id, 'paymaya')} disabled={loading}
                      style={{ flex: 1, padding: '8px 16px', background: '#0a4c8c', color: '#fff', borderRadius: 6, fontSize: 12, fontWeight: 600, opacity: loading ? 0.5 : 1 }}
                    >
                      Pay with Maya
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <Bell size={20} color="#3b82f6" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc' }}>Notifications</h2>
          </div>
          {[
            { key: 'email', label: 'Email alerts', desc: 'Receive email notifications for new findings' },
            { key: 'slack', label: 'Slack integration', desc: 'Send alerts to your Slack workspace' },
            { key: 'critical', label: 'Critical only', desc: 'Only notify for critical severity findings' },
            { key: 'daily', label: 'Daily digest', desc: 'Daily summary of all activity' },
            { key: 'weekly', label: 'Weekly report', desc: 'Weekly executive summary PDF' },
          ].map(opt => (
            <div key={opt.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f8fafc' }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{opt.desc}</div>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [opt.key]: !n[opt.key] }))}
                style={{
                  width: 44, height: 24, borderRadius: 12,
                  background: notifications[opt.key] ? '#3b82f6' : '#334155',
                  position: 'relative', transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: notifications[opt.key] ? 22 : 4,
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div style={{ background: '#0f172a', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <AlertTriangle size={20} color="#ef4444" />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444' }}>Danger Zone</h2>
          </div>
          <button onClick={logout}
            style={{ padding: '10px 20px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 8, fontSize: 13, fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
