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
      <h1 className="text-2xl font-bold text-vigil-text mb-6">Settings</h1>

      <div className="grid gap-4">
        {/* Profile */}
        <div className="bg-vigil-surface border border-vigil-border rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <User size={20} color="#3b82f6" />
            <h2 className="text-base font-bold text-vigil-text">Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] text-vigil-muted-dark mb-1.5">Email</label>
              <input value={user?.email || ''} readOnly
                className="w-full p-2.5 bg-vigil-bg border border-vigil-border-light rounded-lg text-vigil-muted text-sm" />
            </div>
            <div>
              <label className="block text-[13px] text-vigil-muted-dark mb-1.5">Name</label>
              <input value={`${user?.first_name || ''} ${user?.last_name || ''}`} readOnly
                className="w-full p-2.5 bg-vigil-bg border border-vigil-border-light rounded-lg text-vigil-muted text-sm" />
            </div>
          </div>
        </div>

        {/* Billing & Subscription */}
        <div className="bg-vigil-surface border border-vigil-border rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <CreditCard size={20} color="#3b82f6" />
            <h2 className="text-base font-bold text-vigil-text">Billing & Subscription</h2>
          </div>

          {subscription ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wide py-1 px-3 rounded-full"
                  style={{
                    background: `${getStatusColor(subscription.status)}20`,
                    color: getStatusColor(subscription.status)
                  }}>
                  {subscription.status}
                </span>
                <span className="text-sm text-vigil-muted">
                  {subscription.plan} plan · {subscription.payment_provider || 'stripe'}
                </span>
                {subscription.trial_ends_at && (
                  <span className="text-xs text-vigil-muted-dark">
                    Trial ends: {new Date(subscription.trial_ends_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              {subscription.status === 'active' ? (
                <button onClick={handleCancel} disabled={loading}
                  className="py-2.5 px-5 border border-vigil-danger text-vigil-danger rounded-lg text-[13px] font-semibold"
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  Cancel Subscription
                </button>
              ) : (
                <button onClick={() => setShowUpgrade(!showUpgrade)} disabled={loading}
                  className="py-2.5 px-5 bg-vigil-primary text-white rounded-lg text-[13px] font-semibold"
                  style={{ opacity: loading ? 0.5 : 1 }}
                >
                  {showUpgrade ? 'Hide Plans' : 'Upgrade Plan'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-vigil-muted-dark text-sm">Loading subscription...</div>
          )}

          {/* Upgrade Plans */}
          {showUpgrade && plans.length > 0 && (
            <div className="mt-5 grid gap-3">
              {plans.map(plan => (
                <div key={plan.id} className="bg-vigil-bg border border-vigil-border-light rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-[15px] font-bold text-vigil-text">{plan.name}</div>
                    <div className="text-sm text-vigil-muted">
                      {plan.price_monthly_display_usd} <span className="text-vigil-muted-dark text-xs">/mo</span>
                      {plan.price_monthly_display_php && (
                        <span className="ml-2 text-vigil-success">{plan.price_monthly_display_php}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-vigil-muted-dark mb-3">{plan.description}</div>
                  <div className="flex gap-2 flex-wrap">
                    {plan.features.map((f, i) => (
                      <span key={i} className="text-[11px] py-0.5 px-2 bg-vigil-border text-vigil-muted rounded">{f}</span>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button onClick={() => handleStripeCheckout(plan.id)} disabled={loading}
                      className="flex-1 py-2 px-4 bg-vigil-primary text-white rounded-md text-xs font-semibold"
                      style={{ opacity: loading ? 0.5 : 1 }}
                    >
                      Pay with Card (Stripe)
                    </button>
                    <button onClick={() => handlePayMongoCheckout(plan.id, 'gcash')} disabled={loading}
                      className="flex-1 py-2 px-4 bg-[#0a5c36] text-white rounded-md text-xs font-semibold"
                      style={{ opacity: loading ? 0.5 : 1 }}
                    >
                      Pay with GCash
                    </button>
                    <button onClick={() => handlePayMongoCheckout(plan.id, 'paymaya')} disabled={loading}
                      className="flex-1 py-2 px-4 bg-[#0a4c8c] text-white rounded-md text-xs font-semibold"
                      style={{ opacity: loading ? 0.5 : 1 }}
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
        <div className="bg-vigil-surface border border-vigil-border rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <Bell size={20} color="#3b82f6" />
            <h2 className="text-base font-bold text-vigil-text">Notifications</h2>
          </div>
          {[
            { key: 'email', label: 'Email alerts', desc: 'Receive email notifications for new findings' },
            { key: 'slack', label: 'Slack integration', desc: 'Send alerts to your Slack workspace' },
            { key: 'critical', label: 'Critical only', desc: 'Only notify for critical severity findings' },
            { key: 'daily', label: 'Daily digest', desc: 'Daily summary of all activity' },
            { key: 'weekly', label: 'Weekly report', desc: 'Weekly executive summary PDF' },
          ].map(opt => (
            <div key={opt.key} className="flex justify-between items-center py-3 border-b border-vigil-border">
              <div>
                <div className="text-sm font-semibold text-vigil-text">{opt.label}</div>
                <div className="text-xs text-vigil-muted-dark">{opt.desc}</div>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [opt.key]: !n[opt.key] }))}
                className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: notifications[opt.key] ? '#3b82f6' : '#334155' }}
              >
                <div
                  className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-[left]"
                  style={{ left: notifications[opt.key] ? 22 : 4 }}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-vigil-surface border border-vigil-danger/30 rounded-xl p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <AlertTriangle size={20} color="#ef4444" />
            <h2 className="text-base font-bold text-vigil-danger">Danger Zone</h2>
          </div>
          <button onClick={logout}
            className="py-2.5 px-5 border border-vigil-danger text-vigil-danger rounded-lg text-[13px] font-semibold"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
