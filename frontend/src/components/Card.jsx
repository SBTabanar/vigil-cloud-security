import React from 'react'

export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-vigil-surface border border-vigil-border rounded-xl p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}
