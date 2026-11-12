import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
useEffect(() => {
  if (user) navigate('/', { replace: true })
}, [user, navigate])

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ maxWidth: 360, margin: '80px auto', fontFamily: 'sans-serif' }}>
      <h2>Lab Inventory</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        <input type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button disabled={busy} style={{ padding: '8px 16px' }}>
          {busy ? 'Masuk...' : 'Login'}
        </button>
      </form>
    </div>
  )
}