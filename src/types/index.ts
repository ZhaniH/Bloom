export interface Chore {
  id: string
  title: string
  points: number
  completed: boolean
  icon: string
}

export interface HomeworkItem {
  id: string
  subject: string
  title: string
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

export interface WaterLog {
  id: string
  amount: number
  timestamp: string
}

export interface PlannerItem {
  id: string
  title: string
  timeSlot: 'morning' | 'afternoon' | 'evening'
  time: string
  completed: boolean
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

export type PetStage = 'egg' | 'baby' | 'teen' | 'adult'
export type PetMood = 'happy' | 'neutral' | 'sad' | 'excited'

export interface FeedingRecord {
  id: string
  timestamp: string
  milestone: number
  pointsAtFeeding: number
}

export interface PetState {
  name: string
  stage: PetStage
  happiness: number
  lastFed: string | null
  feedingHistory: FeedingRecord[]
  unlockedMilestones: number[]
}

export interface AppData {
  chores: Chore[]
  homework: HomeworkItem[]
  waterLogs: WaterLog[]
  plannerItems: PlannerItem[]
  achievements: Achievement[]
  totalPoints: number
  waterGoal: number
  lastUpdated: string
  pet: PetState
}
