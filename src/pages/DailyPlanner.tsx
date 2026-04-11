import { useData } from '../context/DataContext'
import { Check, Plus, Sun, CloudSun, Moon } from 'lucide-react'
import { useState } from 'react'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

export function DailyPlanner() {
  const { plannerItems, togglePlannerItem, addPlannerItem, isLoading, error } = useData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({
    title: '',
    timeSlot: 'morning' as 'morning' | 'afternoon' | 'evening',
    time: '09:00',
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (newItem.title.trim()) {
      addPlannerItem(newItem)
      setNewItem({
        title: '',
        timeSlot: 'morning',
        time: '09:00',
      })
      setShowAddForm(false)
    }
  }

  const timeSlots = {
    morning: { label: 'Morning', icon: Sun, items: plannerItems.filter(i => i.timeSlot === 'morning') },
    afternoon: { label: 'Afternoon', icon: CloudSun, items: plannerItems.filter(i => i.timeSlot === 'afternoon') },
    evening: { label: 'Evening', icon: Moon, items: plannerItems.filter(i => i.timeSlot === 'evening') },
  }

  const completedCount = plannerItems.filter(i => i.completed).length

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold">Daily Planner</h2>
          <p className="text-body text-text-secondary mt-1">
            {completedCount} of {plannerItems.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent text-white rounded-md px-4 py-2 font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Add new activity"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddItem} className="bg-background rounded-lg p-4 border border-border shadow-subtle animate-scale-in">
          <h3 className="font-semibold mb-3">Add New Activity</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="activity-title" className="block text-caption font-medium mb-1">Activity</label>
              <input
                id="activity-title"
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., Practice piano"
                required
              />
            </div>
            <div>
              <label htmlFor="activity-slot" className="block text-caption font-medium mb-1">Time of Day</label>
              <select
                id="activity-slot"
                value={newItem.timeSlot}
                onChange={(e) => setNewItem({ ...newItem, timeSlot: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label htmlFor="activity-time" className="block text-caption font-medium mb-1">Time</label>
              <input
                id="activity-time"
                type="time"
                value={newItem.time}
                onChange={(e) => setNewItem({ ...newItem, time: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent text-white rounded-md py-2 font-semibold hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                Add Activity
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

      {/* Time Slots */}
      <div className="space-y-6">
        {Object.entries(timeSlots).map(([key, slot]) => {
          const Icon = slot.icon
          const completedInSlot = slot.items.filter(i => i.completed).length
          
          return (
            <div key={key} className="animate-scale-in">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-accent">
                <Icon size={24} className="text-accent" />
                <h3 className="font-bold text-body">{slot.label}</h3>
                <span className="text-caption text-text-secondary ml-auto">
                  {completedInSlot}/{slot.items.length}
                </span>
              </div>

              {slot.items.length === 0 ? (
                <div className="bg-surface rounded-lg p-4 text-center text-caption text-text-secondary">
                  No activities scheduled
                </div>
              ) : (
                <div className="space-y-2">
                  {slot.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => togglePlannerItem(item.id)}
                      className={`w-full bg-background rounded-lg p-3 border-2 transition-all hover:shadow-medium flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                        item.completed 
                          ? 'border-success bg-success/5' 
                          : 'border-border hover:border-accent/30'
                      }`}
                      aria-label={`${item.completed ? 'Mark as incomplete' : 'Complete'} ${item.title}`}
                      aria-pressed={item.completed}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        item.completed 
                          ? 'bg-success border-success' 
                          : 'border-border'
                      }`}>
                        {item.completed && <Check size={18} className="text-white" strokeWidth={3} />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-medium text-body ${item.completed ? 'line-through text-text-secondary' : ''}`}>
                          {item.title}
                        </p>
                        <p className="text-caption text-text-secondary">{item.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
