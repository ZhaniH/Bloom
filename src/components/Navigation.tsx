import { Home, CheckSquare, BookOpen, Droplet, Calendar, Trophy, Heart, Gamepad2 } from 'lucide-react'
import { Page } from '../App'
import { useEffect } from 'react'

interface NavigationProps {
  currentPage: Page
  onNavigate: (page: Page) => void
}

const navItems = [
  { id: 'dashboard' as Page, label: 'Home', icon: Home, key: '1' },
  { id: 'chores' as Page, label: 'Chores', icon: CheckSquare, key: '2' },
  { id: 'homework' as Page, label: 'Homework', icon: BookOpen, key: '3' },
  { id: 'water' as Page, label: 'Water', icon: Droplet, key: '4' },
  { id: 'planner' as Page, label: 'Planner', icon: Calendar, key: '5' },
  { id: 'pet' as Page, label: 'Pet', icon: Heart, key: '6' },
  { id: 'rewards' as Page, label: 'Rewards', icon: Trophy, key: '7' },
  { id: 'games' as Page, label: 'Games', icon: Gamepad2, key: '8' },
]

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle number keys 1-8
      const key = e.key
      if (key >= '1' && key <= '8') {
        const index = parseInt(key) - 1
        if (navItems[index]) {
          onNavigate(navItems[index].id)
          // Haptic feedback on mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(30)
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onNavigate])

  const handleNavigate = (page: Page) => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    onNavigate(page)
  }

  return (
    <nav 
      className="bg-background border-t border-border"
      style={{ 
        paddingBottom: 'var(--safe-area-inset-bottom)',
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)'
      }}
    >
      <div className="max-w-7xl mx-auto px-1">
        <ul className="flex overflow-x-auto sm:justify-around items-center py-2 gap-1 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <li key={item.id} className="flex-shrink-0 sm:flex-1" style={{ minWidth: '72px' }}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex flex-col items-center gap-0.5 py-2 px-0.5 rounded-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 min-h-[44px] min-w-[44px] ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-surface active:bg-border'
                  }`}
                  aria-label={`${item.label} (Press ${item.key})`}
                  aria-current={isActive ? 'page' : undefined}
                  title={`${item.label} (${item.key})`}
                >
                  <Icon 
                    size={18}
                    className={isActive ? 'motion-safe:animate-bounce-in' : ''}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className="text-[11px] sm:text-caption font-medium leading-tight whitespace-nowrap">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}