import { useData } from '../context/DataContext'
import { Trophy, Star, Award, Lock, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

export function Rewards() {
  const { achievements, totalPoints, isLoading, error } = useData()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const lockedAchievements = achievements.filter(a => !a.unlocked)

  const pointMilestones = [
    { points: 50, reward: 'Bronze Star', icon: '🥉', unlocked: totalPoints >= 50 },
    { points: 100, reward: 'Silver Star', icon: '🥈', unlocked: totalPoints >= 100 },
    { points: 200, reward: 'Gold Star', icon: '🥇', unlocked: totalPoints >= 200 },
    { points: 500, reward: 'Platinum Star', icon: '💎', unlocked: totalPoints >= 500 },
  ]

  const nextMilestone = pointMilestones.find(m => !m.unlocked)
  const progress = nextMilestone ? (totalPoints / nextMilestone.points) * 100 : 100

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-h2 font-bold">Rewards & Achievements</h2>
        <p className="text-body text-text-secondary mt-1">
          Keep up the great work!
        </p>
      </div>

      {/* Total Points Card */}
      <div className="bg-success rounded-lg p-6 shadow-medium text-white border-2 border-success">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-caption opacity-90 font-medium">Total Points Earned</p>
            <h3 className="text-h1 font-bold flex items-center gap-2">
              {totalPoints}
              <Star fill="currentColor" size={36} />
            </h3>
          </div>
          <Trophy size={64} className="opacity-30" />
        </div>

        {/* Next Milestone */}
        {nextMilestone && (
          <div className="bg-white/20 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-caption font-medium">Next: {nextMilestone.reward}</p>
              <span className="text-caption font-bold">{nextMilestone.points} pts</span>
            </div>
            <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            <p className="text-caption mt-2">
              {nextMilestone.points - totalPoints} points to go!
            </p>
          </div>
        )}
      </div>

      {/* Point Milestones */}
      <div>
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles size={20} className="text-accent" />
          Point Milestones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {pointMilestones.map((milestone, index) => (
            <div
              key={milestone.points}
              className={`rounded-lg p-4 text-center transition-all animate-scale-in ${
                milestone.unlocked
                  ? 'bg-accent text-white shadow-medium border-2 border-accent'
                  : 'bg-surface border border-border'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-h2 mb-2">
                {milestone.unlocked ? milestone.icon : '🔒'}
              </div>
              <p className={`font-semibold text-caption ${milestone.unlocked ? '' : 'text-text-secondary'}`}>
                {milestone.reward}
              </p>
              <p className={`text-caption mt-1 ${milestone.unlocked ? 'opacity-90' : 'text-text-secondary'}`}>
                {milestone.points} pts
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Award size={20} className="text-success" />
            Unlocked Achievements ({unlockedAchievements.length})
          </h3>
          <div className="space-y-3">
            {unlockedAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="bg-success/10 border-2 border-success rounded-lg p-4 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-h2">{achievement.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-body flex items-center gap-2">
                      {achievement.title}
                      <span className="text-success">✓</span>
                    </h4>
                    <p className="text-caption text-text-secondary mt-1">
                      {achievement.description}
                    </p>
                    {achievement.unlockedAt && (
                      <p className="text-caption text-success mt-2">
                        Unlocked {format(new Date(achievement.unlockedAt), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Lock size={20} className="text-text-secondary" />
            Locked Achievements ({lockedAchievements.length})
          </h3>
          <div className="space-y-3">
            {lockedAchievements.map((achievement, index) => (
              <div
                key={achievement.id}
                className="bg-surface border border-border rounded-lg p-4 opacity-60 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 text-h2 grayscale">🔒</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-body text-text-secondary">
                      {achievement.title}
                    </h4>
                    <p className="text-caption text-text-secondary mt-1">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-accent/10 border-2 border-accent rounded-lg p-4 text-center">
        <p className="text-body font-semibold text-accent">
          🌟 Keep completing tasks to unlock more achievements! 🌟
        </p>
      </div>
    </div>
  )
}
