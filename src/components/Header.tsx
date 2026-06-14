import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

export default function Header() {
  const { pathname } = useLocation()
  const isAdmin = pathname === '/admin'

  return (
    <header className="no-print bg-white/80 backdrop-blur-sm border-b border-navy-100 sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
            <span className="text-gold font-extrabold text-sm">E</span>
          </div>
          <div className="leading-tight">
            <p className="text-xs font-bold text-navy">영어홀릭</p>
            <p className="text-[10px] text-gray-400">Achievement Report</p>
          </div>
        </Link>

        <Link
          to={isAdmin ? '/' : '/admin'}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors px-3 py-1.5 rounded-lg hover:bg-navy-50"
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          {isAdmin ? '홈으로' : '기록 조회'}
        </Link>
      </div>
    </header>
  )
}
