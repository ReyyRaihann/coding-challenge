import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><span>🔬</span> Lab Inventory</div>
        <div className="user-box">
          <b>{user.full_name}</b>
          <small>{user.role}</small>
        </div>

        <NavLink to="/" end>📊 Dashboard</NavLink>
        <NavLink to="/items">📦 Barang</NavLink>
        <NavLink to="/borrow">📝 Peminjaman</NavLink>
        <NavLink to="/return">↩️ Pengembalian</NavLink>
        <NavLink to="/history">🕘 Riwayat</NavLink>
        {user.role === 'ADMIN' && <NavLink to="/users">👥 Staff</NavLink>}

        <a href="#" className="logout" onClick={(e) => { e.preventDefault(); logout() }}>
          🚪 Logout
        </a>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}