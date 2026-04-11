export function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-background rounded-lg p-6 border border-border">
        <div className="h-20 bg-surface rounded-md mb-4"></div>
        <div className="h-4 bg-surface rounded-md w-3/4"></div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-background rounded-lg p-4 border border-border">
            <div className="h-6 bg-surface rounded-md mb-3"></div>
            <div className="h-3 bg-surface rounded-full"></div>
          </div>
        ))}
      </div>

      <div className="bg-background rounded-lg p-4 border border-border">
        <div className="h-4 bg-surface rounded-md w-1/2"></div>
      </div>
    </div>
  )
}
