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
    <div className="flex min-h-screen bg-vigil-bg">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'fixed' : 'relative'} md:relative flex flex-col h-screen z-50 w-[260px] bg-vigil-surface border-r border-vigil-border transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-5 border-b border-vigil-border flex items-center gap-3">
          <Shield size={28} className="text-vigil-primary" />
          <div>
            <div className="font-bold text-base text-vigil-text">Vigil</div>
            <div className="text-[11px] text-vigil-muted-dark">Risk Surface</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto block md:hidden text-vigil-muted-dark"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/app'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-200 ${isActive ? 'text-vigil-primary-light bg-vigil-primary/10' : 'text-vigil-muted bg-transparent'}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-vigil-border">
          <div className="text-xs text-vigil-muted-dark mb-2">{user?.email}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-vigil-danger text-[13px] font-medium"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-[60px] bg-vigil-surface border-b border-vigil-border flex items-center px-6 justify-between sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-vigil-muted block md:hidden"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-vigil-success animate-[pulse_2s_infinite]" />
            <span className="text-xs text-vigil-muted-dark">System Online</span>
          </div>
        </header>
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
