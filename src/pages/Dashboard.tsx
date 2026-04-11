import { useData } from '../context/DataContext'
import { Trophy, Star, Target, Sparkles, ArrowRight, X, RefreshCw } from 'lucide-react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'
import { PetDisplay } from '../components/PetDisplay'
import { PetMood, PetStage } from '../types'
import { useState, useEffect, useRef } from 'react'
import { FeedingModal } from '../components/FeedingModal'
import { Page } from '../App'

interface DashboardProps {
  onNavigate?: (page: Page) => void
}

function getPetMood(happiness: number, stage: PetStage): PetMood {
  if (stage === 'egg') return 'neutral'
  if (happiness >= 80) return 'happy'
  if (happiness >= 60) return 'excited'
  if (happiness >= 40) return 'neutral'
  return 'sad'
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { chores, homework, waterLogs, plannerItems, totalPoints, waterGoal, pet, feedPet, isLoading, error, happinessAlert, clearHappinessAlert, refreshData } = useData()
  const [showFeedingModal, setShowFeedingModal] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState<number | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    // Safely access unlockedMilestones with fallback to empty array
    const unlockedMilestones = pet?.unlockedMilestones || []
    const milestones = [50, 100, 150, 200, 300, 500]
    const availableMilestone = milestones.find(m => 
      totalPoints >= m && !unlockedMilestones.includes(m)
    )
    
    if (availableMilestone) {
      setCurrentMilestone(availableMilestone)
      setShowFeedingModal(true)
    }
  }, [totalPoints, pet?.unlockedMilestones])

  // Pull to refresh functionality
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartY.current === null || window.scrollY > 0) return

      const touchY = e.touches[0].clientY
      const distance = touchY - touchStartY.current

      if (distance > 0 && distance < 150) {
        setPullDistance(distance)
        setIsPulling(true)
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance > 80) {
        // Trigger refresh
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        await refreshData()
      }
      
      touchStartY.current = null
      setPullDistance(0)
      setIsPulling(false)
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, refreshData])

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  // Ensure pet object exists with fallback
  if (!pet) {
    return <ErrorState message="Pet data not available. Please refresh the page." />
  }

  const completedChores = chores.filter(c => c.completed).length
  const completedHomework = homework.filter(h => h.completed).length
  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0)
  const completedPlanner = plannerItems.filter(p => p.completed).length

  const choresProgress = chores.length > 0 ? (completedChores / chores.length) * 100 : 0
  const homeworkProgress = homework.length > 0 ? (completedHomework / homework.length) * 100 : 0
  const waterProgress = (totalWater / waterGoal) * 100
  const plannerProgress = plannerItems.length > 0 ? (completedPlanner / plannerItems.length) * 100 : 0

  const stats = [
    { label: 'Chores', completed: completedChores, total: chores.length, progress: choresProgress, icon: '🧹' },
    { label: 'Homework', completed: completedHomework, total: homework.length, progress: homeworkProgress, icon: '📚' },
    { label: 'Water Cups', completed: totalWater, total: waterGoal, progress: waterProgress, icon: '💧' },
    { label: 'Schedule', completed: completedPlanner, total: plannerItems.length, progress: plannerProgress, icon: '📅' },
  ]

  const mood = getPetMood(pet.happiness, pet.stage)

  const handleFeed = () => {
    if (currentMilestone) {
      feedPet(currentMilestone)
    }
  }

  const handleNavigateToPet = () => {
    setIsNavigating(true)
    setTimeout(() => {
      onNavigate?.('pet')
      setIsNavigating(false)
    }, 150)
  }

  const handleDismissAlert = () => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(30)
    }
    clearHappinessAlert()
  }

  return (
    <>
      {/* Pull to refresh indicator */}
      {isPulling && (
        <div 
          className="pull-to-refresh transition-opacity"
          style={{ opacity: Math.min(pullDistance / 80, 1) }}
        >
          <RefreshCw 
            size={24} 
            className={`text-accent ${pullDistance > 80 ? 'motion-safe:animate-spin' : ''}`}
          />
        </div>
      )}

      <div className="space-y-6 motion-safe:animate-slide-up">
        {/* Happiness Alert */}
        {happinessAlert && (
          <div className="bg-danger/10 border-2 border-danger rounded-lg p-4 flex items-start gap-3 motion-safe:animate-scale-in">
            <span className="text-h3 flex-shrink-0">😢</span>
            <div className="flex-1">
              <p className="text-body font-semibold text-danger mb-1">Pet Needs Attention!</p>
              <p className="text-caption text-text-secondary">{happinessAlert}</p>
            </div>
            <button
              onClick={handleDismissAlert}
              className="text-text-secondary hover:text-text-primary hover:bg-surface active:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-2 flex-shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Dismiss alert"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Pet Preview Card */}
        <button
          onClick={handleNavigateToPet}
          disabled={isNavigating}
          className="w-full bg-background rounded-lg p-4 border-2 border-accent shadow-subtle hover:shadow-medium active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-70 min-h-[80px]"
        >
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <PetDisplay stage={pet.stage} mood={mood} size="small" animated={false} />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-body">{pet.name}</h3>
              <p className="text-caption text-text-secondary">
                Happiness: {pet.happiness}% • Tap to visit
              </p>
            </div>
            <ArrowRight size={24} className="text-accent flex-shrink-0" />
          </div>
        </button>

        {/* Points Card */}
        <div className="bg-accent rounded-lg p-6 shadow-medium text-white border-2 border-accent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption opacity-90 font-medium">Your Total Points</p>
              <h2 className="text-h1 font-bold flex items-center gap-2">
                {totalPoints}
                <Star fill="currentColor" size={32} />
              </h2>
            </div>
            <Trophy size={64} className="opacity-30" />
          </div>
          <div className="mt-4 flex items-center gap-2 bg-white/20 rounded-md px-3 py-2">
            <Sparkles size={16} />
            <p className="text-caption font-medium">Keep going! You're doing amazing!</p>
          </div>
        </div>

        {/* Today's Progress */}
        <div>
          <h3 className="text-h3 font-bold mb-4 flex items-center gap-2">
            <Target size={24} className="text-accent" />
            Today's Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="bg-background rounded-lg p-4 border border-border shadow-subtle motion-safe:animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-h2">{stat.icon}</span>
                    <h4 className="font-semibold text-body">{stat.label}</h4>
                  </div>
                  <span className="text-accent font-bold text-body">
                    {stat.completed}/{stat.total}
                  </span>
                </div>
                <div className="relative h-3 bg-surface rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stat.progress, 100)}%` }}
                  />
                </div>
                <p className="text-caption text-text-secondary mt-2 text-right">
                  {Math.round(stat.progress)}% Complete
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-success/10 border-2 border-success rounded-lg p-4 text-center">
          <p className="text-h3 font-bold text-success mb-2">🎉 You're Awesome! 🎉</p>
          <p className="text-body text-text-secondary">
            {totalPoints === 0 && "Let's start your amazing day! Complete some tasks to earn points!"}
            {totalPoints > 0 && totalPoints < 50 && "Great start! Keep up the good work!"}
            {totalPoints >= 50 && totalPoints < 100 && "You're on fire! Almost halfway to 100 points!"}
            {totalPoints >= 100 && "Wow! You're a superstar! 🌟"}
          </p>
        </div>
      </div>

      <FeedingModal
        isOpen={showFeedingModal}
        onClose={() => setShowFeedingModal(false)}
        onFeed={handleFeed}
        milestone={currentMilestone || 0}
        petStage={pet.stage}
      />
    </>
  )
}
