import { useState, useEffect, useRef, useCallback } from 'react'
import { Gamepad2, RotateCcw, ArrowLeft, PartyPopper, Zap, Palette } from 'lucide-react'
import { useData } from '../context/DataContext'

type Game = 'menu' | 'memory' | 'quicktap' | 'simon'

// ---------- Reward banner shown after a win, so kids see exactly what
// their pet got out of it, in the same language as the rest of the app ----------
function RewardBanner({ points, happiness }: { points: number; happiness: number }) {
  return (
    <div className="bg-success/10 border-2 border-success rounded-lg p-3 text-center animate-scale-in">
      <p className="text-caption font-semibold text-success">
        +{points} points &nbsp;•&nbsp; 🍎 Your pet gained {happiness}% happiness!
      </p>
    </div>
  )
}

// ============ Game 1: Memory Match ============
const EMOJIS = ['🌟', '🎈', '🌈', '🦋', '🍎', '🐸']

function MemoryMatch({ onExit }: { onExit: () => void }) {
  const { awardGameReward } = useData()
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [rewardGiven, setRewardGiven] = useState(false)

  const shuffle = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .map((emoji) => ({ emoji, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((c) => c.emoji)
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setRewardGiven(false)
  }

  useEffect(() => {
    shuffle()
  }, [])

  const handleFlip = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return

    const newFlipped = [...flipped, index]
    setFlipped(newFlipped)

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1)
      const [first, second] = newFlipped
      if (cards[first] === cards[second]) {
        setMatched((m) => [...m, first, second])
        setFlipped([])
      } else {
        setTimeout(() => setFlipped([]), 800)
      }
    }
  }

  const isWon = matched.length === cards.length && cards.length > 0

  useEffect(() => {
    if (isWon && !rewardGiven) {
      // Fewer moves = a slightly better reward, minimum 10 points.
      const points = Math.max(10, 25 - moves)
      awardGameReward(points, 10)
      setRewardGiven(true)
    }
  }, [isWon, rewardGiven, moves, awardGameReward])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-caption font-medium">Back</span>
        </button>
        <p className="text-caption font-semibold text-text-secondary">Moves: {moves}</p>
      </div>

      {isWon ? (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center w-full animate-scale-in">
            <PartyPopper size={40} className="mx-auto text-accent mb-2" />
            <p className="text-h3 font-bold text-accent">You matched them all!</p>
            <p className="text-caption text-text-secondary mt-1">Finished in {moves} moves</p>
          </div>
          <RewardBanner points={Math.max(10, 25 - moves)} happiness={10} />
          <button
            onClick={shuffle}
            className="inline-flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={16} />
            Play again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
          {cards.map((emoji, index) => {
            const isFaceUp = flipped.includes(index) || matched.includes(index)
            return (
              <button
                key={index}
                onClick={() => handleFlip(index)}
                className={`aspect-square rounded-md flex items-center justify-center text-h2 transition-all border-2 ${
                  isFaceUp
                    ? matched.includes(index)
                      ? 'bg-success/10 border-success'
                      : 'bg-surface border-accent'
                    : 'bg-accent border-accent hover:opacity-90'
                }`}
              >
                {isFaceUp ? emoji : ''}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ============ Game 2: Quick Tap (whack-a-mole style reaction game) ============
function QuickTap({ onExit }: { onExit: () => void }) {
  const { awardGameReward } = useData()
  const GRID_SIZE = 9
  const GAME_LENGTH = 15 // seconds
  const [activeSpot, setActiveSpot] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_LENGTH)
  const [status, setStatus] = useState<'ready' | 'playing' | 'done'>('ready')
  const [rewardGiven, setRewardGiven] = useState(false)
  const spotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const popNewSpot = useCallback(() => {
    setActiveSpot(Math.floor(Math.random() * GRID_SIZE))
    const nextDelay = 500 + Math.random() * 600
    spotTimerRef.current = setTimeout(popNewSpot, nextDelay)
  }, [])

  const startGame = () => {
    setScore(0)
    setTimeLeft(GAME_LENGTH)
    setStatus('playing')
    setRewardGiven(false)
    popNewSpot()
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current)
          if (spotTimerRef.current) clearTimeout(spotTimerRef.current)
          setActiveSpot(null)
          setStatus('done')
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (spotTimerRef.current) clearTimeout(spotTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  const handleTap = (index: number) => {
    if (status !== 'playing' || index !== activeSpot) return
    setScore((s) => s + 1)
    setActiveSpot(null)
    if ('vibrate' in navigator) navigator.vibrate(20)
  }

  useEffect(() => {
    if (status === 'done' && !rewardGiven) {
      const points = Math.min(30, Math.max(5, score * 2))
      awardGameReward(points, 8)
      setRewardGiven(true)
    }
  }, [status, rewardGiven, score, awardGameReward])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-caption font-medium">Back</span>
        </button>
        <p className="text-caption font-semibold text-text-secondary">
          {status === 'playing' ? `Time: ${timeLeft}s` : `Score: ${score}`}
        </p>
      </div>

      {status === 'ready' && (
        <div className="bg-background rounded-lg border border-border p-6 text-center w-full max-w-sm">
          <Zap size={36} className="mx-auto text-accent mb-2" />
          <p className="font-bold mb-1">Quick Tap</p>
          <p className="text-caption text-text-secondary mb-4">Tap the glowing square as fast as you can!</p>
          <button
            onClick={startGame}
            className="bg-accent text-white rounded-md px-5 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
          >
            Start
          </button>
        </div>
      )}

      {status === 'playing' && (
        <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
          {Array.from({ length: GRID_SIZE }).map((_, index) => (
            <button
              key={index}
              onClick={() => handleTap(index)}
              className={`aspect-square rounded-md border-2 transition-all ${
                activeSpot === index
                  ? 'bg-accent border-accent scale-95'
                  : 'bg-surface border-border'
              }`}
              aria-label={activeSpot === index ? 'Tap here!' : 'Empty spot'}
            />
          ))}
        </div>
      )}

      {status === 'done' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center w-full animate-scale-in">
            <PartyPopper size={40} className="mx-auto text-accent mb-2" />
            <p className="text-h3 font-bold text-accent">Time's up!</p>
            <p className="text-caption text-text-secondary mt-1">You tapped {score} times</p>
          </div>
          <RewardBanner points={Math.min(30, Math.max(5, score * 2))} happiness={8} />
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={16} />
            Play again
          </button>
        </div>
      )}
    </div>
  )
}

// ============ Game 3: Simon Says (color pattern memory) ============
const COLORS = [
  { id: 0, className: 'bg-danger', label: 'Red' },
  { id: 1, className: 'bg-accent', label: 'Green' },
  { id: 2, className: 'bg-[#F5B301]', label: 'Yellow' },
  { id: 3, className: 'bg-[#3B82F6]', label: 'Blue' },
]

function SimonSays({ onExit }: { onExit: () => void }) {
  const { awardGameReward } = useData()
  const [sequence, setSequence] = useState<number[]>([])
  const [playerStep, setPlayerStep] = useState(0)
  const [litColor, setLitColor] = useState<number | null>(null)
  const [status, setStatus] = useState<'ready' | 'showing' | 'playing' | 'lost'>('ready')
  const [level, setLevel] = useState(0)
  const [rewardGiven, setRewardGiven] = useState(false)

  const playSequence = useCallback(async (seq: number[]) => {
    setStatus('showing')
    await new Promise((r) => setTimeout(r, 500))
    for (const colorId of seq) {
      setLitColor(colorId)
      await new Promise((r) => setTimeout(r, 450))
      setLitColor(null)
      await new Promise((r) => setTimeout(r, 200))
    }
    setStatus('playing')
    setPlayerStep(0)
  }, [])

  const startGame = () => {
    const first = [Math.floor(Math.random() * 4)]
    setSequence(first)
    setLevel(0)
    setRewardGiven(false)
    playSequence(first)
  }

  const handleColorTap = (colorId: number) => {
    if (status !== 'playing') return
    if ('vibrate' in navigator) navigator.vibrate(20)

    if (colorId !== sequence[playerStep]) {
      setStatus('lost')
      return
    }

    if (playerStep + 1 === sequence.length) {
      const newLevel = level + 1
      setLevel(newLevel)
      const nextSequence = [...sequence, Math.floor(Math.random() * 4)]
      setSequence(nextSequence)
      setTimeout(() => playSequence(nextSequence), 600)
    } else {
      setPlayerStep((s) => s + 1)
    }
  }

  useEffect(() => {
    if (status === 'lost' && !rewardGiven) {
      const points = Math.min(30, Math.max(5, level * 5))
      awardGameReward(points, 8)
      setRewardGiven(true)
    }
  }, [status, rewardGiven, level, awardGameReward])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
          <span className="text-caption font-medium">Back</span>
        </button>
        <p className="text-caption font-semibold text-text-secondary">Level: {level}</p>
      </div>

      {status === 'ready' && (
        <div className="bg-background rounded-lg border border-border p-6 text-center w-full max-w-sm">
          <Palette size={36} className="mx-auto text-accent mb-2" />
          <p className="font-bold mb-1">Simon Says</p>
          <p className="text-caption text-text-secondary mb-4">Watch the pattern, then repeat it!</p>
          <button
            onClick={startGame}
            className="bg-accent text-white rounded-md px-5 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
          >
            Start
          </button>
        </div>
      )}

      {(status === 'showing' || status === 'playing') && (
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          {COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => handleColorTap(color.id)}
              disabled={status !== 'playing'}
              className={`aspect-square rounded-lg transition-all ${color.className} ${
                litColor === color.id ? 'opacity-100 scale-95 ring-4 ring-white' : 'opacity-70'
              } disabled:cursor-not-allowed`}
              aria-label={color.label}
            />
          ))}
        </div>
      )}

      {status === 'lost' && (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center w-full animate-scale-in">
            <PartyPopper size={40} className="mx-auto text-accent mb-2" />
            <p className="text-h3 font-bold text-accent">Nice try!</p>
            <p className="text-caption text-text-secondary mt-1">You reached level {level}</p>
          </div>
          <RewardBanner points={Math.min(30, Math.max(5, level * 5))} happiness={8} />
          <button
            onClick={startGame}
            className="inline-flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
          >
            <RotateCcw size={16} />
            Play again
          </button>
        </div>
      )}
    </div>
  )
}

// ============ Menu ============
const gameList: { id: Game; title: string; description: string; icon: typeof Gamepad2 }[] = [
  { id: 'memory', title: 'Memory Match', description: 'Flip the cards and find all the matching pairs', icon: Gamepad2 },
  { id: 'quicktap', title: 'Quick Tap', description: 'Tap the glowing square before it disappears', icon: Zap },
  { id: 'simon', title: 'Simon Says', description: 'Watch the color pattern, then repeat it', icon: Palette },
]

export default function MiniGames() {
  const [game, setGame] = useState<Game>('menu')

  if (game === 'memory') {
    return (
      <div className="space-y-6 animate-slide-up">
        <MemoryMatch onExit={() => setGame('menu')} />
      </div>
    )
  }

  if (game === 'quicktap') {
    return (
      <div className="space-y-6 animate-slide-up">
        <QuickTap onExit={() => setGame('menu')} />
      </div>
    )
  }

  if (game === 'simon') {
    return (
      <div className="space-y-6 animate-slide-up">
        <SimonSays onExit={() => setGame('menu')} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-h2 font-bold">Mini Games</h2>
        <p className="text-body text-text-secondary mt-1">
          Win games to earn points and feed your pet!
        </p>
      </div>

      <div className="space-y-3">
        {gameList.map((g) => {
          const Icon = g.icon
          return (
            <button
              key={g.id}
              onClick={() => setGame(g.id)}
              className="w-full bg-surface border border-border rounded-lg p-6 flex items-center gap-4 text-left shadow-subtle hover:shadow-medium transition-shadow animate-scale-in"
            >
              <div className="bg-accent/10 rounded-md p-3">
                <Icon size={32} className="text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-body">{g.title}</h3>
                <p className="text-caption text-text-secondary mt-1">{g.description}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
