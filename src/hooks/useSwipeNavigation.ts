import { useEffect, useRef } from 'react'
import { Page } from '../App'

const pages: Page[] = ['dashboard', 'chores', 'homework', 'water', 'planner', 'pet', 'rewards']

export function useSwipeNavigation(currentPage: Page, setCurrentPage: (page: Page) => void) {
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
      if (touchStartX.current === null || touchEndX.current === null) return

      const diffX = touchStartX.current - touchEndX.current
      const minSwipeDistance = 50

      if (Math.abs(diffX) > minSwipeDistance) {
        const currentIndex = pages.indexOf(currentPage)
        
        if (diffX > 0 && currentIndex < pages.length - 1) {
          // Swipe left - go to next page
          setCurrentPage(pages[currentIndex + 1])
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30)
          }
        } else if (diffX < 0 && currentIndex > 0) {
          // Swipe right - go to previous page
          setCurrentPage(pages[currentIndex - 1])
          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(30)
          }
        }
      }

      touchStartX.current = null
      touchEndX.current = null
    }

    document.addEventListener('touchstart', handleTouchStart)
    document.addEventListener('touchmove', handleTouchMove)
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [currentPage, setCurrentPage])
}
