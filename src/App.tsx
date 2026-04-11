import { useState, useEffect } from 'react'
import { Navigation } from './components/Navigation'
import { Dashboard } from './pages/Dashboard'
import { Chores } from './pages/Chores'
import { Homework } from './pages/Homework'
import { WaterTracker } from './pages/WaterTracker'
import { DailyPlanner } from './pages/DailyPlanner'
import { Rewards } from './pages/Rewards'
import { PetCare } from './pages/PetCare'
import { DataProvider } from './context/DataContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useSwipeNavigation } from './hooks/useSwipeNavigation'
import { SyncIndicator } from './components/SyncIndicator'

export type Page = 'dashboard' | 'chores' | 'homework' | 'water' | 'planner' | 'rewards' | 'pet'

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  // Enable swipe navigation on mobile
  useSwipeNavigation(currentPage, setCurrentPage)

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />
      case 'chores':
        return <Chores />
      case 'homework':
        return <Homework />
      case 'water':
        return <WaterTracker />
      case 'planner':
        return <DailyPlanner />
      case 'rewards':
        return <Rewards />
      case 'pet':
        return <PetCare />
      default:
        return <Dashboard onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header 
        className="bg-background border-b border-border sticky top-0 z-10 shadow-subtle"
        style={{ 
          paddingTop: 'var(--safe-area-inset-top)',
          paddingLeft: 'var(--safe-area-inset-left)',
          paddingRight: 'var(--safe-area-inset-right)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-h2 font-bold text-center flex-1 text-accent">
            My Awesome Day! 🌟
          </h1>
          <SyncIndicator />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderPage()}
      </main>

      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ErrorBoundary>
  )
}

export default App
