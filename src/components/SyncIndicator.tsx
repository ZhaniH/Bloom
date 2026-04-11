import { useData } from '../context/DataContext'
import { CheckCircle, Cloud } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export function SyncIndicator() {
  const { lastSaved, isSaving } = useData()

  if (isSaving) {
    return (
      <div className="flex items-center gap-1 text-caption text-text-secondary">
        <Cloud size={14} className="motion-safe:animate-pulse" />
        <span className="hidden sm:inline">Saving...</span>
      </div>
    )
  }

  if (lastSaved) {
    return (
      <div className="flex items-center gap-1 text-caption text-success" title={`Last saved: ${new Date(lastSaved).toLocaleString()}`}>
        <CheckCircle size={14} />
        <span className="hidden sm:inline">
          {formatDistanceToNow(new Date(lastSaved), { addSuffix: true })}
        </span>
      </div>
    )
  }

  return null
}
