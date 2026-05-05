import React, { createContext, useContext, useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || '/api/v1'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('vigil_token'))
  const [loading, setLoading] = useState(true)
  const [backendReady, setBackendReady] = useState(true)

  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setBackendReady(true)
      } else {
        logout()
      }
    } catch (err) {
      console.error('Backend unreachable:', err)
      setBackendReady(false)
      logout()
    }
    setLoading(false)
  }

  const login = async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)
    
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }))
      throw new Error(err.detail || 'Invalid credentials')
    }
    
    const data = await res.json()
    localStorage.setItem('vigil_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    setBackendReady(true)
    return data
  }

  const register = async (email, password, firstName, lastName) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName })
    })
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }))
      throw new Error(err.detail || 'Registration failed')
    }
    
    const data = await res.json()
    localStorage.setItem('vigil_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    setBackendReady(true)
    return data
  }

  const logout = () => {
    localStorage.removeItem('vigil_token')
    setToken(null)
    setUser(null)
  }

  const apiFetch = async (path, options = {}) => {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    if (res.status === 401) {
      logout()
      throw new Error('Session expired')
    }
    return res
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, apiFetch, loading, backendReady }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
