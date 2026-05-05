import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Shield, LayoutDashboard, AlertTriangle, FileCheck, Settings, LogOut, Menu, X } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navItems = [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/findings', label: 'Findings', icon: AlertTriangle },
    { to: '/app/compliance', label: 'Compliance', icon: FileCheck },
    { to: '/app/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0e1a' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        position: sidebarOpen ? 'fixed' : 'relative',
        height: '100vh',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ padding: 20, borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Shield size={28} color="#3b82f6" />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#f8fafc' }}>Vigil</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Risk Surface</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ marginLeft: 'auto', display: window.innerWidth >= 768 ? 'none' : 'block', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        <nav style={{ flex: 1, padding: 12 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 8,
                marginBottom: 4,
                fontSize: 14,
                fontWeight: 500,
                color: isActive ? '#60a5fa' : '#94a3b8',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid #1e293b' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{user?.email}</div>
          <button 
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: 13, fontWeight: 500 }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>
        <header style={{
          height: 60,
          background: '#0f172a',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: '#94a3b8', display: window.innerWidth >= 768 ? 'none' : 'block' }}>
            <Menu size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#64748b' }}>System Online</span>
          </div>
        </header>
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
