import { useData } from '../context/DataContext'
import { Droplet, Plus } from 'lucide-react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

export function WaterTracker() {
  const { waterLogs, waterGoal, addWaterLog, isLoading, error } = useData()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const totalWater = waterLogs.reduce((sum, log) => sum + log.amount, 0)
  const progress = Math.min((totalWater / waterGoal) * 100, 100)
  const remaining = Math.max(waterGoal - totalWater, 0)

  const quickAmounts = [
    { amount: 1, label: '1 Cup', icon: '🥤' },
    { amount: 2, label: '2 Cups', icon: '🥤🥤' },
    { amount: 0.5, label: 'Half Cup', icon: '💧' },
  ]

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-h2 font-bold">Water Tracker</h2>
        <p className="text-body text-text-secondary mt-1">
          Stay hydrated! Goal: {waterGoal} cups
        </p>
      </div>

      {/* Water Glass Visualization */}
      <div className="bg-background rounded-lg p-6 border border-border shadow-subtle">
        <div className="max-w-xs mx-auto">
          {/* Glass Container */}
          <div className="relative w-48 h-80 mx-auto mb-6">
            {/* Glass outline */}
            <div className="absolute inset-0 border-4 border-accent rounded-b-3xl rounded-t-lg" />
            
            {/* Water fill */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-accent rounded-b-3xl transition-all duration-700 ease-out"
              style={{ height: `${progress}%` }}
            >
              {/* Water surface animation */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-white/30 animate-pulse" />
            </div>

            {/* Measurement lines */}
            {[0.25, 0.5, 0.75, 1].map((fraction) => (
              <div
                key={fraction}
                className="absolute left-0 right-0 border-t border-border/50"
                style={{ bottom: `${fraction * 100}%` }}
              >
                <span className="absolute -right-12 -top-2 text-caption text-text-secondary">
                  {waterGoal * fraction}
                </span>
              </div>
            ))}

            {/* Droplet icon */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <Droplet 
                size={64} 
                className={`transition-all duration-500 ${
                  progress < 50 ? 'text-border' : 'text-white/50'
                }`}
              />
            </div>
          </div>

          {/* Progress Text */}
          <div className="text-center">
            <p className="text-h2 font-bold text-accent mb-1">
              {totalWater} / {waterGoal} cups
            </p>
            <p className="text-body text-text-secondary">
              {remaining > 0 ? `${remaining} cups to go!` : '🎉 Goal reached!'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Plus size={20} className="text-accent" />
          Quick Add
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {quickAmounts.map((item, index) => (
            <button
              key={item.amount}
              onClick={() => addWaterLog(item.amount)}
              className="bg-background border-2 border-accent hover:bg-accent/10 rounded-lg p-4 transition-all hover:shadow-medium animate-scale-in focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              style={{ animationDelay: `${index * 0.1}s` }}
              aria-label={`Add ${item.label}`}
            >
              <div className="text-h2 mb-2">{item.icon}</div>
              <p className="font-semibold text-caption">{item.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Log */}
      {waterLogs.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Today's Log</h3>
          <div className="bg-background rounded-lg border border-border p-4">
            <div className="space-y-2">
              {waterLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Droplet size={16} className="text-accent" />
                    <span className="font-medium">{log.amount} cup{log.amount !== 1 ? 's' : ''}</span>
                  </div>
                  <span className="text-caption text-text-secondary">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className={`rounded-lg p-4 text-center ${
        progress >= 100 
          ? 'bg-success/10 border-2 border-success' 
          : 'bg-accent/10 border-2 border-accent'
      }`}>
        <p className="text-body font-semibold">
          {progress >= 100 && '🎉 Amazing! You reached your water goal!'}
          {progress >= 75 && progress < 100 && '💪 Almost there! Keep it up!'}
          {progress >= 50 && progress < 75 && '👍 Great progress! You\'re halfway there!'}
          {progress >= 25 && progress < 50 && '🌟 Good start! Keep drinking water!'}
          {progress < 25 && '💧 Remember to drink water throughout the day!'}
        </p>
      </div>
    </div>
  )
}
