import { AlertCircle } from 'lucide-react'

interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-danger/10 border-2 border-danger rounded-lg p-6 text-center">
      <AlertCircle size={48} className="text-danger mx-auto mb-4" />
      <h3 className="text-h3 font-bold text-danger mb-2">Oops! Something went wrong</h3>
      <p className="text-body text-text-secondary mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-danger text-white rounded-md px-4 py-2 font-semibold hover:bg-danger/90 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
