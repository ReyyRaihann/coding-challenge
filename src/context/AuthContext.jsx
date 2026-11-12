import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // data dari tabel profiles
  const [loading, setLoading] = useState(true)

  async function loadProfile(session) {
    if (!session) {
      setUser(null)
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // akun nonaktif tidak boleh masuk
    if (!data || !data.is_active) {
      await supabase.auth.signOut()
      setUser(null)
    } else {
      setUser(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => loadProfile(data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      loadProfile(session)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function login(username, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${username.trim().toLowerCase()}@lab.local`,
      password,
    })
    if (error) throw new Error('Username atau password salah')
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)