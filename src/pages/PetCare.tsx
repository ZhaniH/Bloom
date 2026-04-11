import { useData } from '../context/DataContext'
import { Heart, Calendar, TrendingUp, Edit2, Check, X, AlertCircle } from 'lucide-react'
import { PetDisplay } from '../components/PetDisplay'
import { PetMood, PetStage } from '../types'
import { format } from 'date-fns'
import { useState } from 'react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

function getPetMood(happiness: number, stage: PetStage): PetMood {
  if (stage === 'egg') return 'neutral'
  if (happiness >= 80) return 'happy'
  if (happiness >= 60) return 'excited'
  if (happiness >= 40) return 'neutral'
  return 'sad'
}

function getStageInfo(stage: PetStage) {
  switch (stage) {
    case 'egg':
      return { name: 'Egg', description: 'Waiting to hatch...', nextStage: 'Baby', pointsNeeded: 50 }
    case 'baby':
      return { name: 'Baby', description: 'Just hatched and growing!', nextStage: 'Teen', pointsNeeded: 150 }
    case 'teen':
      return { name: 'Teen', description: 'Getting bigger every day!', nextStage: 'Adult', pointsNeeded: 300 }
    case 'adult':
      return { name: 'Adult', description: 'Fully grown and amazing!', nextStage: null, pointsNeeded: null }
  }
}

function getHappinessMessage(happiness: number): { message: string; color: string } {
  if (happiness >= 80) return { message: 'Your pet is very happy! 😊', color: 'success' }
  if (happiness >= 60) return { message: 'Your pet is doing well! 😄', color: 'accent' }
  if (happiness >= 40) return { message: 'Your pet could use some attention', color: 'text-secondary' }
  if (happiness >= 20) return { message: 'Your pet is getting hungry! 😟', color: 'danger' }
  return { message: 'Your pet really needs feeding! 😢', color: 'danger' }
}

export function PetCare() {
  const { pet, totalPoints, feedPet, updatePetName, isLoading, error } = useData()
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(pet.name)
  const [isSavingName, setIsSavingName] = useState(false)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const mood = getPetMood(pet.happiness, pet.stage)
  const stageInfo = getStageInfo(pet.stage)
  const happinessInfo = getHappinessMessage(pet.happiness)

  const handleSaveName = async () => {
    if (editedName.trim()) {
      setIsSavingName(true)
      // Simulate brief async operation for consistency
      await new Promise(resolve => setTimeout(resolve, 200))
      updatePetName(editedName.trim())
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
      setIsSavingName(false)
      setIsEditingName(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedName(pet.name)
    setIsEditingName(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const handleFeedPet = (milestone: number) => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    feedPet(milestone)
  }

  const milestones = [50, 100, 150, 200, 300, 500]
  const availableMilestones = milestones.filter(m => 
    totalPoints >= m && !pet.unlockedMilestones.includes(m)
  )

  return (
    <div className="space-y-6 motion-safe:animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <label htmlFor="pet-name-input" className="sr-only">Pet name</label>
              <input
                id="pet-name-input"
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-h2 font-bold text-center border-2 border-accent rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                maxLength={20}
                autoFocus
                disabled={isSavingName}
                aria-label="Edit pet name"
              />
              <button
                onClick={handleSaveName}
                disabled={isSavingName}
                className="text-success hover:text-success/80 hover:bg-success/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-success rounded-md p-1 disabled:opacity-50"
                aria-label="Save name"
              >
                <Check size={24} />
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSavingName}
                className="text-danger hover:text-danger/80 hover:bg-danger/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-danger rounded-md p-1 disabled:opacity-50"
                aria-label="Cancel"
              >
                <X size={24} />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-h2 font-bold">{pet.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-accent hover:text-accent/80 hover:bg-accent/10 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-1"
                aria-label="Edit pet name"
              >
                <Edit2 size={20} />
              </button>
            </>
          )}
        </div>
        <p className="text-body text-text-secondary">
          {stageInfo.name} Stage • {stageInfo.description}
        </p>
      </div>

      {/* Pet Display */}
      <div className="bg-background rounded-lg p-8 border-2 border-accent shadow-medium text-center">
        <PetDisplay stage={pet.stage} mood={mood} size="large" showEvolution={true} />
        
        {/* Happiness Bar */}
        <div className="mt-6 max-w-xs mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-caption font-semibold flex items-center gap-1">
              <Heart size={16} className="text-danger" fill="currentColor" />
              Happiness
            </span>
            <span className="text-caption font-bold text-accent">{pet.happiness}%</span>
          </div>
          <div className="relative h-4 bg-surface rounded-full overflow-hidden border border-border">
            <div 
              className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500"
              style={{ width: `${pet.happiness}%` }}
            />
          </div>
          <p className={`text-caption text-${happinessInfo.color} mt-2 flex items-center justify-center gap-1`}>
            {pet.happiness < 40 && <AlertCircle size={14} />}
            {happinessInfo.message}
          </p>
        </div>
      </div>

      {/* Growth Progress */}
      {stageInfo.nextStage && stageInfo.pointsNeeded && (
        <div className="bg-background rounded-lg p-4 border border-border shadow-subtle">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-accent" />
            <h3 className="font-bold">Growth Progress</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-caption">
              <span className="text-text-secondary">Next Stage: {stageInfo.nextStage}</span>
              <span className="font-bold text-accent">
                {totalPoints} / {stageInfo.pointsNeeded}
              </span>
            </div>
            <div className="relative h-3 bg-surface rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-success rounded-full transition-all duration-500"
                style={{ width: `${Math.min((totalPoints / stageInfo.pointsNeeded) * 100, 100)}%` }}
              />
            </div>
            <p className="text-caption text-text-secondary text-center">
              {stageInfo.pointsNeeded - totalPoints > 0 
                ? `${stageInfo.pointsNeeded - totalPoints} points until evolution!`
                : 'Ready to evolve! Keep earning points!'}
            </p>
          </div>
        </div>
      )}

      {/* Available Feedings */}
      {availableMilestones.length > 0 && (
        <div className="bg-success/10 border-2 border-success rounded-lg p-4">
          <h3 className="font-bold mb-3 text-success">🎉 Milestones Ready!</h3>
          <p className="text-body text-text-secondary mb-4">
            You've unlocked {availableMilestones.length} feeding{availableMilestones.length > 1 ? 's' : ''}!
          </p>
          <div className="space-y-2">
            {availableMilestones.map((milestone) => (
              <button
                key={milestone}
                onClick={() => handleFeedPet(milestone)}
                className="w-full bg-success text-white rounded-md py-3 px-4 font-semibold hover:bg-success/90 active:scale-95 transition-all shadow-subtle focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 flex items-center justify-between"
              >
                <span>Feed at {milestone} points milestone</span>
                <span>🍎</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feeding History */}
      {pet.feedingHistory.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={20} className="text-accent" />
            <h3 className="font-bold">Feeding History</h3>
          </div>
          <div className="bg-background rounded-lg border border-border overflow-hidden">
            <div className="divide-y divide-border">
              {pet.feedingHistory.slice().reverse().map((record) => (
                <div key={record.id} className="p-3 flex items-center justify-between hover:bg-surface active:bg-border transition-colors">
                  <div>
                    <p className="font-semibold text-body">
                      {record.milestone} Points Milestone
                    </p>
                    <p className="text-caption text-text-secondary">
                      {format(new Date(record.timestamp), 'MMM d, yyyy • h:mm a')}
                    </p>
                  </div>
                  <span className="text-h3">🍎</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pet Care Tips */}
      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4">
        <h3 className="font-bold mb-2 text-accent">💡 Pet Care Tips</h3>
        <ul className="space-y-2 text-caption text-text-secondary">
          <li>• Complete tasks to earn points and reach milestones</li>
          <li>• Feed your pet when you unlock new milestones</li>
          <li>• Your pet grows as you earn more points</li>
          <li>• Keep your pet happy by staying active!</li>
        </ul>
      </div>
    </div>
  )
}
