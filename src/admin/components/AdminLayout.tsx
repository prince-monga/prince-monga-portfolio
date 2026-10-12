import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  LayoutDashboard, FolderKanban, FileText, MapPin, BookOpen,
  Flame, Inbox, Settings, LogOut, Menu, X, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import BrandMark from '../../components/BrandMark'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/journey', label: 'Journey', icon: MapPin },
  { to: '/admin/journal', label: 'Journal', icon: BookOpen },
  { to: '/admin/streak', label: 'Streak', icon: Flame },
  { to: '/admin/inquiries', label: 'Inquiries', icon: Inbox },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
    }`

  const sidebar = (
    <aside className="admin-sidebar w-56 flex-shrink-0 flex flex-col bg-neutral-900 border-r border-neutral-800 h-full">
      <div className="px-4 py-4 border-b border-neutral-800 flex items-center justify-between">
        <BrandMark admin compact />
        <button
          className="lg:hidden text-neutral-400 hover:text-neutral-100"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto" aria-label="Admin navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-800 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
        >
          <ExternalLink size={16} />
          View site
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
        <p className="px-3 pt-2 text-xs text-neutral-600 truncate">{email}</p>
      </div>
    </aside>
  )

  return (
    <>
      <Helmet>
        <title>Admin | Prince Monga</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="admin-shell admin-surface min-h-screen flex text-neutral-100">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-56">
        {sidebar}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50 flex flex-col w-56">
            {sidebar}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-neutral-800 bg-neutral-900">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="text-neutral-400 hover:text-neutral-100"
          >
            <Menu size={20} />
          </button>
          <BrandMark admin compact />
        </header>

        <main className="admin-content flex-1 p-4 sm:p-6 w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
      </div>
    </>
  )
}
