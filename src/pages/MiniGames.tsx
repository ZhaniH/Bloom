import { useState, useEffect } from 'react'
import { Gamepad2, RotateCcw, ArrowLeft, PartyPopper } from 'lucide-react'

type Game = 'menu' | 'memory'

const EMOJIS = ['🌟', '🎈', '🌈', '🦋', '🍎', '🐸']

function MemoryMatch({ onExit }: { onExit: () => void }) {
  const [cards, setCards] = useState<string[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [moves, setMoves] = useState(0)

  const shuffle = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .map((emoji) => ({ emoji, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((c) => c.emoji)
    setCards(deck)
    setFlipped([])
    setMatched([])
    setMoves(0)
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
        <div className="bg-accent/10 border-2 border-accent rounded-lg p-6 text-center w-full max-w-sm animate-scale-in">
          <PartyPopper size={40} className="mx-auto text-accent mb-2" />
          <p className="text-h3 font-bold text-accent">You matched them all!</p>
          <p className="text-caption text-text-secondary mt-1">Finished in {moves} moves</p>
          <button
            onClick={shuffle}
            className="mt-4 inline-flex items-center gap-2 bg-accent text-white rounded-md px-4 py-2 text-body font-semibold shadow-subtle hover:opacity-90 transition-opacity"
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

export default function MiniGames() {
  const [game, setGame] = useState<Game>('menu')

  if (game === 'memory') {
    return (
      <div className="space-y-6 animate-slide-up">
        <MemoryMatch onExit={() => setGame('menu')} />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div>
        <h2 className="text-h2 font-bold">Mini Games</h2>
        <p className="text-body text-text-secondary mt-1">
          Take a break and have some fun!
        </p>
      </div>

      <button
        onClick={() => setGame('memory')}
        className="w-full bg-surface border border-border rounded-lg p-6 flex items-center gap-4 text-left shadow-subtle hover:shadow-medium transition-shadow animate-scale-in"
      >
        <div className="bg-accent/10 rounded-md p-3">
          <Gamepad2 size={32} className="text-accent" />
        </div>
        <div>
          <h3 className="font-bold text-body">Memory Match</h3>
          <p className="text-caption text-text-secondary mt-1">
            Flip the cards and find all the matching pairs
          </p>
        </div>
      </button>
    </div>
  )
}
