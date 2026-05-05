import React from 'react'

export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-vigil-border text-vigil-muted',
    primary: 'bg-blue-500/10 text-vigil-primary-light',
    success: 'bg-green-500/10 text-vigil-success',
    warning: 'bg-yellow-500/10 text-vigil-warning',
    danger: 'bg-red-500/10 text-vigil-danger',
    info: 'bg-slate-500/10 text-vigil-muted',
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
