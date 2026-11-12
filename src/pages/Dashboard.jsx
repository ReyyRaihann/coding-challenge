import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h2>Dashboard</h2>
      <p>Halo, {user.full_name} ({user.role})</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}