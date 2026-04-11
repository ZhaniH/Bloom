import { useData } from '../context/DataContext'
import { Check, Plus, AlertCircle, Clock } from 'lucide-react'
import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorState } from '../components/ErrorState'

export function Homework() {
  const { homework, toggleHomework, addHomework, isLoading, error } = useData()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHomework, setNewHomework] = useState({
    subject: '',
    title: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState message={error} />
  }

  const handleAddHomework = (e: React.FormEvent) => {
    e.preventDefault()
    if (newHomework.subject.trim() && newHomework.title.trim()) {
      addHomework(newHomework)
      setNewHomework({
        subject: '',
        title: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        priority: 'medium',
      })
      setShowAddForm(false)
    }
  }

  const completedCount = homework.filter(h => h.completed).length

  const priorityConfig = {
    high: { label: 'High', color: 'danger', icon: AlertCircle },
    medium: { label: 'Medium', color: 'text-secondary', icon: Clock },
    low: { label: 'Low', color: 'success', icon: Clock },
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold">My Homework</h2>
          <p className="text-body text-text-secondary mt-1">
            {completedCount} of {homework.length} completed
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-accent text-white rounded-md px-4 py-2 font-semibold flex items-center gap-2 hover:bg-accent/90 transition-colors shadow-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          aria-label="Add new homework"
        >
          <Plus size={20} />
          Add
        </button>
      </div>

      {/* Add Homework Form */}
      {showAddForm && (
        <form onSubmit={handleAddHomework} className="bg-background rounded-lg p-4 border border-border shadow-subtle animate-scale-in">
          <h3 className="font-semibold mb-3">Add New Homework</h3>
          <div className="space-y-3">
            <div>
              <label htmlFor="hw-subject" className="block text-caption font-medium mb-1">Subject</label>
              <input
                id="hw-subject"
                type="text"
                value={newHomework.subject}
                onChange={(e) => setNewHomework({ ...newHomework, subject: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., Math"
                required
              />
            </div>
            <div>
              <label htmlFor="hw-title" className="block text-caption font-medium mb-1">Assignment</label>
              <input
                id="hw-title"
                type="text"
                value={newHomework.title}
                onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e.g., Practice problems 1-10"
                required
              />
            </div>
            <div>
              <label htmlFor="hw-date" className="block text-caption font-medium mb-1">Due Date</label>
              <input
                id="hw-date"
                type="date"
                value={newHomework.dueDate}
                onChange={(e) => setNewHomework({ ...newHomework, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
            <div>
              <label htmlFor="hw-priority" className="block text-caption font-medium mb-1">Priority</label>
              <select
                id="hw-priority"
                value={newHomework.priority}
                onChange={(e) => setNewHomework({ ...newHomework, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-accent text-white rounded-md py-2 font-semibold hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                Add Homework
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

      {/* Homework List */}
      {homework.length === 0 ? (
        <div className="bg-background rounded-lg p-8 border border-border text-center">
          <p className="text-h3 mb-2">📚</p>
          <h3 className="font-semibold mb-1">No homework yet</h3>
          <p className="text-caption text-text-secondary">Add your assignments to track them!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {homework.map((item, index) => {
            const priorityInfo = priorityConfig[item.priority]
            const PriorityIcon = priorityInfo.icon
            const dueDate = parseISO(item.dueDate)
            
            return (
              <button
                key={item.id}
                onClick={() => toggleHomework(item.id)}
                className={`w-full bg-background rounded-lg p-4 border-2 transition-all hover:shadow-medium animate-scale-in focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${
                  item.completed 
                    ? 'border-success bg-success/5' 
                    : 'border-border hover:border-accent/30'
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
                aria-label={`${item.completed ? 'Mark as incomplete' : 'Complete'} ${item.title}`}
                aria-pressed={item.completed}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-body ${
                    item.completed ? 'bg-success/20 text-success' : 'bg-surface text-text-primary'
                  }`}>
                    {item.subject.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`font-semibold text-body ${item.completed ? 'line-through text-text-secondary' : ''}`}>
                      {item.title}
                    </h3>
                    <p className="text-caption text-text-secondary mt-1">{item.subject}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-caption flex items-center gap-1 ${
                        item.completed ? 'text-text-secondary' : `text-${priorityInfo.color}`
                      }`}>
                        <PriorityIcon size={14} />
                        {priorityInfo.label}
                      </span>
                      <span className="text-caption text-text-secondary">
                        Due: {format(dueDate, 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    item.completed 
                      ? 'bg-success border-success' 
                      : 'border-border'
                  }`}>
                    {item.completed && <Check size={24} className="text-white" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
