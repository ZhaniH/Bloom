import { PetStage, PetMood, PetSpecies } from '../types'
import { useEffect, useState } from 'react'

interface PetDisplayProps {
  stage: PetStage
  mood: PetMood
  species?: PetSpecies
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  showEvolution?: boolean
}

// Egg stage is always a mystery egg regardless of species — the chosen
// animal is revealed once it hatches into the baby stage.
const speciesEmojis: Record<PetSpecies, { baby: string; teen: string; adult: string }> = {
  chicken: { baby: '🐣', teen: '🐥', adult: '🐔' },
  dog: { baby: '🐶', teen: '🐕', adult: '🦮' },
  cat: { baby: '🐱', teen: '🐈', adult: '🐈‍⬛' },
  dragon: { baby: '🐲', teen: '🐉', adult: '🐉' },
  bunny: { baby: '🐰', teen: '🐇', adult: '🐇' },
  fish: { baby: '🐠', teen: '🐟', adult: '🐡' },
}

const moodEmojis = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  excited: '🤩',
}

export function PetDisplay({ stage, mood, species = 'chicken', size = 'medium', animated = true, showEvolution = false }: PetDisplayProps) {
  const [isEvolving, setIsEvolving] = useState(false)
  const [prevStage, setPrevStage] = useState(stage)

  useEffect(() => {
    if (showEvolution && stage !== prevStage && prevStage !== 'egg') {
      setIsEvolving(true)
      const timer = setTimeout(() => {
        setIsEvolving(false)
        setPrevStage(stage)
      }, 1000)
      return () => clearTimeout(timer)
    }
    setPrevStage(stage)
  }, [stage, prevStage, showEvolution])

  const sizeClasses = {
    small: 'text-pet-sm',
    medium: 'text-pet-md',
    large: 'text-pet-lg',
  }

  const petEmoji = stage === 'egg' ? '🥚' : speciesEmojis[species][stage]
  const moodEmoji = moodEmojis[mood]

  return (
    <div className="relative inline-block">
      <div 
        className={`${sizeClasses[size]} ${animated ? 'motion-safe:animate-bounce-in' : ''} ${isEvolving ? 'motion-safe:animate-pulse motion-safe:scale-110' : ''} transition-transform duration-500`}
        style={{ willChange: isEvolving ? 'transform' : 'auto' }}
        role="img"
        aria-label={`${stage} pet feeling ${mood}`}
      >
        {petEmoji}
      </div>
      <div 
        className="absolute -bottom-2 -right-2 text-[24px] bg-background rounded-full p-1 border-2 border-accent shadow-subtle"
        role="img"
        aria-label={`mood: ${mood}`}
      >
        {moodEmoji}
      </div>
      {isEvolving && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-h1 motion-safe:animate-bounce-in">✨</div>
        </div>
      )}
    </div>
  )
}
