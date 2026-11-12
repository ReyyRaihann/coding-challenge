import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="app">
      <aside className="sidebar">
        <h3>Lab Inventory</h3>
        <small>{user.full_name} ({user.role})</small>

        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/items">Barang</NavLink>
        {/* menu lain (Peminjaman, Pengembalian, Riwayat, Staff) ditambah nanti */}

        <button className="red" onClick={logout}>Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}