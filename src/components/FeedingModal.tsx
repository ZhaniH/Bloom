import { X, Star } from 'lucide-react'
import { PetDisplay } from './PetDisplay'
import { PetStage } from '../types'
import { useEffect, useRef, useState } from 'react'

interface FeedingModalProps {
  isOpen: boolean
  onClose: () => void
  onFeed: () => void
  milestone: number
  petStage: PetStage
}

export function FeedingModal({ isOpen, onClose, onFeed, milestone, petStage }: FeedingModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detect mobile device
    setIsMobile(window.innerWidth < 768)

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setShowConfetti(false)
      return
    }

    // Show confetti when modal opens
    setShowConfetti(true)
    const confettiTimer = setTimeout(() => setShowConfetti(false), 3000)

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    // Focus first element when modal opens
    setTimeout(() => {
      firstFocusableRef.current?.focus()
    }, 100)

    return () => {
      clearTimeout(confettiTimer)
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleFeed = () => {
    // Haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }
    onFeed()
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 bg-text-primary/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 motion-safe:animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feeding-modal-title"
    >
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10%',
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${2 + Math.random() * 1}s`,
                color: ['#0E7C66', '#1F9D55', '#D64545', '#F59E0B'][Math.floor(Math.random() * 4)],
              }}
            />
          ))}
        </div>
      )}

      <div 
        ref={modalRef}
        className={`bg-background w-full sm:max-w-md sm:w-full shadow-medium relative ${
          isMobile 
            ? 'rounded-t-lg p-6 pb-8 motion-safe:animate-slide-up-mobile' 
            : 'rounded-lg p-6 motion-safe:animate-scale-in'
        }`}
        style={isMobile ? { 
          paddingBottom: `calc(2rem + var(--safe-area-inset-bottom))` 
        } : {}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="feeding-modal-title" className="text-h3 font-bold motion-safe:animate-celebration">🎉 Milestone Reached!</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:bg-surface active:bg-border transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center space-y-6">
          <div className="bg-accent/10 rounded-lg p-6 border-2 border-accent">
            <PetDisplay stage={petStage} mood="excited" size="large" />
          </div>

          <div>
            <p className="text-h2 font-bold text-accent flex items-center justify-center gap-2">
              <Star fill="currentColor" size={28} />
              {milestone} Points!
              <Star fill="currentColor" size={28} />
            </p>
            <p className="text-body text-text-secondary mt-2">
              Your pet is hungry and ready for a treat!
            </p>
          </div>

          <button
            ref={firstFocusableRef}
            onClick={handleFeed}
            className="w-full bg-success text-white rounded-md py-3 px-6 font-bold text-body hover:bg-success/90 active:scale-95 transition-all shadow-subtle focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 min-h-[44px]"
          >
            Feed Your Pet! 🍎
          </button>

          <button
            onClick={onClose}
            className="w-full bg-surface text-text-primary rounded-md py-2 px-6 font-semibold text-body hover:bg-border active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 min-h-[44px]"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
