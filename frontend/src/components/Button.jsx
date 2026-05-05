import React from 'react'

export default function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const variants = {
    primary: 'bg-vigil-primary text-white hover:bg-blue-600',
    danger: 'border border-vigil-danger text-vigil-danger hover:bg-vigil-danger hover:text-white',
    ghost: 'text-vigil-muted hover:text-vigil-text',
    outline: 'border border-vigil-border-light text-vigil-text hover:border-vigil-primary',
  }
  
  return (
    <button
      className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
