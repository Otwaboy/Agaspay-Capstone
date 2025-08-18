import { useState } from 'react'

function WaterDropIcon({ className = "w-6 h-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.861 2.304a1.5 1.5 0 0 0-1.722 0C8.44 3.993 4 8.023 4 12.75 4 17.306 7.589 21 12 21s8-3.694 8-8.25c0-4.727-4.44-8.757-7.139-10.446zM12 19.5c-3.186 0-5.75-2.642-5.75-5.898 0-2.852 2.79-5.9 5.75-8.008 2.96 2.108 5.75 5.156 5.75 8.008 0 3.256-2.564 5.898-5.75 5.898z" />
    </svg>
  )
}

function Sidebar({ open, onClose, onNavigate }) {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-slate-900/40 z-30 lg:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-2 px-4 h-16 border-b border-slate-200">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <WaterDropIcon className="w-5 h-5" />
            </div>
            <div className="font-semibold tracking-wide">Agaspay Admin</div>
          </div>
          <nav className="flex-1 p-3 space-y-1">
            <NavItem label="Dashboard" onClick={() => onNavigate('dashboard')} />
            <NavItem label="Create Personnel" onClick={() => onNavigate('create')} />
            <NavItem label="Accounts" onClick={() => onNavigate('accounts')} />
          </nav>
          <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
            © {new Date().getFullYear()} Agaspay
          </div>
        </div>
      </aside>
    </>
  )
}

function NavItem({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}

function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-slate-600 hover:bg-slate-100"
            onClick={onMenuClick}
            aria-label="Open sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <WaterDropIcon className="w-5 h-5" />
            </div>
            <span className="font-semibold">Agaspay</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span>Online</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">A</div>
        </div>
      </div>
    </header>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
      <div className="p-3 rounded-lg bg-blue-50 text-blue-700">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
      </div>
    </div>
  )
}

function CreatePersonnelForm({ onCreate }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Operator')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!fullName || !email || !username || !password) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    onCreate({ id: crypto.randomUUID(), fullName, email, role, username, password })
    setFullName('')
    setEmail('')
    setRole('Operator')
    setUsername('')
    setPassword('')
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-900">Create Barangay Personnel Account</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Juan Dela Cruz"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
          <select
            className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option>Operator</option>
            <option>Cashier</option>
            <option>Reader</option>
            <option>Admin</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
          <input
            type="text"
            className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
          <input
            type="password"
            className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="temporary password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
            Create Account
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </form>
    </div>
  )
}

function AccountsTable({ accounts }) {
  return (
    <div className="overflow-hidden bg-white rounded-xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-700">
            <tr>
              <th className="text-left font-medium px-4 py-3">Name</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3">Username</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-slate-500" colSpan={4}>No accounts yet.</td>
              </tr>
            ) : (
              accounts.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{a.fullName}</td>
                  <td className="px-4 py-3">{a.email}</td>
                  <td className="px-4 py-3">{a.role}</td>
                  <td className="px-4 py-3">{a.username}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [route, setRoute] = useState('dashboard')
  const [accounts, setAccounts] = useState([])

  function handleCreate(account) {
    setAccounts((prev) => [account, ...prev])
    setRoute('accounts')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[18rem_1fr]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNavigate={(r) => { setRoute(r); setSidebarOpen(false) }} />

      <div className="lg:ml-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="px-4 py-6 max-w-7xl mx-auto">
          <section className="mb-6">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6">
              <h1 className="text-2xl font-semibold">Agaspay Admin Dashboard</h1>
              <p className="text-blue-50 mt-1">Barangay Waterworks Operation System</p>
            </div>
          </section>

          {route === 'dashboard' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Active Connections" value="1,248" icon={<WaterDropIcon className="w-6 h-6" />} />
              <StatCard label="Barangays" value="23" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 6a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v12H6a3 3 0 0 1-3-3V6z"/><path d="M13 9h5a3 3 0 0 1 3 3v6h-8V9z"/></svg>} />
              <StatCard label="Outstanding Bills" value="312" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 2h9a3 3 0 0 1 3 3v14l-4-2-4 2-4-2-4 2V5a3 3 0 0 1 3-3z"/></svg>} />
              <StatCard label="This Month's Revenue" value="₱ 482k" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0zm9-6v12m-4-4h8"/></svg>} />
            </div>
          )}

          {route === 'create' && (
            <div className="grid grid-cols-1 gap-6">
              <CreatePersonnelForm onCreate={handleCreate} />
            </div>
          )}

          {route === 'accounts' && (
            <div className="grid grid-cols-1 gap-6">
              <AccountsTable accounts={accounts} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
