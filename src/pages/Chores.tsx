import { useData } from '../context/DataContext'
import { Check, Plus, Star } from 'lucide-react'
import { useState } from 'react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

export function Chores() {
  const { chores, toggleChore, addChore, isLoading, error } = useData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newChore, setNewChore] = useState({ title: '', points: 10, icon: '🧹' })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const handleAddChore = (e: React.FormEvent) => {
    e.preventDefault()
    if (newChore.title.trim()) {
      addChore(newChore)
      setNewChore({ title: '', points: 10, icon: '🧹' })
      setShowAddForm(false)
    }
  }

  const completedCount = chores.filter(c => c.completed).length

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold">My Chores</h2>
          <p className="text-body text-text-secondary mt-1">
            {completedCount} of {chores.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent text-white rounded-md px-4 py-2 font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Add new chore"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {/* Add Chore Form */}
      {showAddForm && (
        <form onSubmit={handleAddChore} className="bg-background rounded-lg p-4 border border-border shadow-subtle animate-scale-in">
          <h3 className="font-semibold mb-3">Add New Chore</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="chore-title" className="block text-caption font-medium mb-1">Chore Name</label>
              <input
                id="chore-title"
                type="text"
                value={newChore.title}
                onChange={(e) => setNewChore({ ...newChore, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., Take out trash"
                required
              />
            </div>
            <div>
              <label htmlFor="chore-points" className="block text-caption font-medium mb-1">Points</label>
              <input
                id="chore-points"
                type="number"
                value={newChore.points}
                onChange={(e) => setNewChore({ ...newChore, points: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                min="5"
                max="50"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent text-white rounded-md py-2 font-semibold hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                Add Chore
              </button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-surface text-text-primary rounded-md py-2 font-semibold hover:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Chores List */}
      {chores.length === 0 ? (
        <div className="bg-background rounded-lg p-8 border border-border text-center">
          <p className="text-h3 mb-2">🧹</p>
          <h3 className="font-semibold mb-1">No chores yet</h3>
          <p className="text-caption text-text-secondary">Add your first chore to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chores.map((chore, index) => (
            <button
              key={chore.id}
              onClick={() => toggleChore(chore.id)}
              className={`w-full bg-background rounded-lg p-4 border-2 transition-all hover:shadow-medium animate-scale-in focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                chore.completed 
                  ? 'border-success bg-success/5' 
                  : 'border-border hover:border-accent/30'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
              aria-label={`${chore.completed ? 'Mark as incomplete' : 'Complete'} ${chore.title}`}
              aria-pressed={chore.completed}
            >
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-h2 ${
                  chore.completed ? 'bg-success/20' : 'bg-surface'
                }`}>
                  {chore.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-semibold text-body ${chore.completed ? 'line-through text-text-secondary' : ''}`}>
                    {chore.title}
                  </h3>
                  <p className={`text-caption flex items-center gap-1 mt-1 ${
                    chore.completed ? 'text-text-secondary' : 'text-accent'
                  }`}>
                    <Star size={14} fill="currentColor" />
                    {chore.points} points
                  </p>
                </div>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                  chore.completed 
                    ? 'bg-success border-success' 
                    : 'border-border'
                }`}>
                  {chore.completed && <Check size={24} className="text-white" strokeWidth={3} />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
