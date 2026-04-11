import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AppData, Chore, HomeworkItem, WaterLog, PlannerItem, Achievement, PetState, PetStage, FeedingRecord } from '../types'
import { format } from 'date-fns'

interface DataContextType extends AppData {
  toggleChore: (id: string) => void
  toggleHomework: (id: string) => void
  addWaterLog: (amount: number) => void
  togglePlannerItem: (id: string) => void
  addChore: (chore: Omit<Chore, 'id' | 'completed'>) => void
  addHomework: (homework: Omit<HomeworkItem, 'id' | 'completed'>) => void
  addPlannerItem: (item: Omit<PlannerItem, 'id' | 'completed'>) => void
  resetDaily: () => void
  feedPet: (milestone: number) => void
  updatePetName: (name: string) => void
  refreshData: () => Promise<void>
  isLoading: boolean
  error: string | null
  happinessAlert: string | null
  clearHappinessAlert: () => void
  lastSaved: string | null
  isSaving: boolean
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const STORAGE_KEY = 'kid-chore-tracker-data'

const defaultAchievements: Achievement[] = [
  { id: '1', title: 'First Step', description: 'Complete your first chore', icon: '🎯', unlocked: false },
  { id: '2', title: 'Study Star', description: 'Complete 5 homework assignments', icon: '📚', unlocked: false },
  { id: '3', title: 'Water Warrior', description: 'Reach your water goal', icon: '💧', unlocked: false },
  { id: '4', title: 'Perfect Day', description: 'Complete all tasks in one day', icon: '⭐', unlocked: false },
  { id: '5', title: 'Week Champion', description: 'Earn 100 points', icon: '🏆', unlocked: false },
  { id: '6', title: 'Early Bird', description: 'Complete morning tasks', icon: '🌅', unlocked: false },
  { id: '7', title: 'Pet Parent', description: 'Hatch your pet egg', icon: '🥚', unlocked: false },
  { id: '8', title: 'Growing Up', description: 'Evolve your pet to teen stage', icon: '🌱', unlocked: false },
  { id: '9', title: 'Fully Grown', description: 'Evolve your pet to adult stage', icon: '🌟', unlocked: false },
]

const defaultChores: Chore[] = [
  { id: '1', title: 'Make Your Bed', points: 10, completed: false, icon: '🛏️' },
  { id: '2', title: 'Brush Your Teeth', points: 5, completed: false, icon: '🪥' },
  { id: '3', title: 'Clean Your Room', points: 20, completed: false, icon: '🧹' },
  { id: '4', title: 'Help with Dishes', points: 15, completed: false, icon: '🍽️' },
  { id: '5', title: 'Feed the Pet', points: 10, completed: false, icon: '🐕' },
]

const defaultHomework: HomeworkItem[] = [
  { id: '1', subject: 'Math', title: 'Practice multiplication', dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'high', completed: false },
  { id: '2', subject: 'Reading', title: 'Read chapter 5', dueDate: format(new Date(), 'yyyy-MM-dd'), priority: 'medium', completed: false },
]

const defaultPlannerItems: PlannerItem[] = [
  { id: '1', title: 'Wake up & breakfast', timeSlot: 'morning', time: '7:00 AM', completed: false },
  { id: '2', title: 'School time', timeSlot: 'morning', time: '8:30 AM', completed: false },
  { id: '3', title: 'Lunch break', timeSlot: 'afternoon', time: '12:00 PM', completed: false },
  { id: '4', title: 'Homework time', timeSlot: 'afternoon', time: '3:00 PM', completed: false },
  { id: '5', title: 'Play time', timeSlot: 'afternoon', time: '5:00 PM', completed: false },
  { id: '6', title: 'Dinner', timeSlot: 'evening', time: '6:30 PM', completed: false },
  { id: '7', title: 'Bedtime routine', timeSlot: 'evening', time: '8:00 PM', completed: false },
]

const defaultPet: PetState = {
  name: 'My Pet',
  stage: 'egg',
  happiness: 50,
  lastFed: null,
  feedingHistory: [],
  unlockedMilestones: [],
}

function getPetStage(points: number): PetStage {
  if (points >= 300) return 'adult'
  if (points >= 150) return 'teen'
  if (points >= 50) return 'baby'
  return 'egg'
}

// Data migration function to ensure pet object has all required properties
function migratePetData(pet: any): PetState {
  if (!pet) {
    return { ...defaultPet }
  }

  return {
    name: pet.name || defaultPet.name,
    stage: pet.stage || defaultPet.stage,
    happiness: typeof pet.happiness === 'number' ? pet.happiness : defaultPet.happiness,
    lastFed: pet.lastFed || null,
    feedingHistory: Array.isArray(pet.feedingHistory) ? pet.feedingHistory : [],
    unlockedMilestones: Array.isArray(pet.unlockedMilestones) ? pet.unlockedMilestones : [],
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [happinessAlert, setHappinessAlert] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [data, setData] = useState<AppData>({
    chores: defaultChores,
    homework: defaultHomework,
    waterLogs: [],
    plannerItems: defaultPlannerItems,
    achievements: defaultAchievements,
    totalPoints: 0,
    waterGoal: 8,
    lastUpdated: new Date().toISOString(),
    pet: defaultPet,
  })

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        
        // Migrate pet data to ensure all properties exist
        const migratedPet = migratePetData(parsed.pet)
        
        const lastUpdated = new Date(parsed.lastUpdated)
        const today = new Date()
        
        if (lastUpdated.toDateString() !== today.toDateString()) {
          setData({
            ...parsed,
            chores: parsed.chores.map((c: Chore) => ({ ...c, completed: false })),
            homework: parsed.homework.map((h: HomeworkItem) => ({ ...h, completed: false })),
            waterLogs: [],
            plannerItems: parsed.plannerItems.map((p: PlannerItem) => ({ ...p, completed: false })),
            lastUpdated: today.toISOString(),
            pet: migratedPet,
          })
        } else {
          setData({
            ...parsed,
            pet: migratedPet,
          })
        }
        setLastSaved(parsed.lastUpdated)
      }
    } catch (err) {
      setError('Failed to load saved data. Starting fresh.')
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading) {
      setIsSaving(true)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setLastSaved(new Date().toISOString())
      } catch (err) {
        setError('Failed to save data. Changes may not persist.')
        console.error('Error saving data:', err)
      } finally {
        setTimeout(() => setIsSaving(false), 300)
      }
    }
  }, [data, isLoading])

  const checkAchievements = (newData: AppData) => {
    const achievements = [...newData.achievements]
    let updated = false

    if (!achievements[0].unlocked && newData.chores.some(c => c.completed)) {
      achievements[0].unlocked = true
      achievements[0].unlockedAt = new Date().toISOString()
      updated = true
    }

    const completedHomework = newData.homework.filter(h => h.completed).length
    if (!achievements[1].unlocked && completedHomework >= 5) {
      achievements[1].unlocked = true
      achievements[1].unlockedAt = new Date().toISOString()
      updated = true
    }

    const totalWater = newData.waterLogs.reduce((sum, log) => sum + log.amount, 0)
    if (!achievements[2].unlocked && totalWater >= newData.waterGoal) {
      achievements[2].unlocked = true
      achievements[2].unlockedAt = new Date().toISOString()
      updated = true
    }

    const allChoresDone = newData.chores.every(c => c.completed)
    const allHomeworkDone = newData.homework.every(h => h.completed)
    const allPlannerDone = newData.plannerItems.every(p => p.completed)
    if (!achievements[3].unlocked && allChoresDone && allHomeworkDone && allPlannerDone) {
      achievements[3].unlocked = true
      achievements[3].unlockedAt = new Date().toISOString()
      updated = true
    }

    if (!achievements[4].unlocked && newData.totalPoints >= 100) {
      achievements[4].unlocked = true
      achievements[4].unlockedAt = new Date().toISOString()
      updated = true
    }

    const morningTasks = newData.plannerItems.filter(p => p.timeSlot === 'morning')
    if (!achievements[5].unlocked && morningTasks.every(t => t.completed)) {
      achievements[5].unlocked = true
      achievements[5].unlockedAt = new Date().toISOString()
      updated = true
    }

    // Pet achievements
    if (!achievements[6].unlocked && newData.pet.stage !== 'egg') {
      achievements[6].unlocked = true
      achievements[6].unlockedAt = new Date().toISOString()
      updated = true
    }

    if (!achievements[7].unlocked && newData.pet.stage === 'teen') {
      achievements[7].unlocked = true
      achievements[7].unlockedAt = new Date().toISOString()
      updated = true
    }

    if (!achievements[8].unlocked && newData.pet.stage === 'adult') {
      achievements[8].unlocked = true
      achievements[8].unlockedAt = new Date().toISOString()
      updated = true
    }

    if (updated) {
      return { ...newData, achievements }
    }
    return newData
  }

  const updatePetState = (newData: AppData) => {
    const newStage = getPetStage(newData.totalPoints)
    const pet = { ...newData.pet }
    const prevHappiness = pet.happiness
    
    // Update stage if it changed
    if (pet.stage !== newStage) {
      pet.stage = newStage
    }

    // Update happiness based on activity
    const now = new Date()
    const lastFedDate = pet.lastFed ? new Date(pet.lastFed) : null
    const hoursSinceLastFed = lastFedDate 
      ? (now.getTime() - lastFedDate.getTime()) / (1000 * 60 * 60)
      : 999

    // Decay happiness over time if not fed recently
    if (hoursSinceLastFed > 24) {
      pet.happiness = Math.max(0, pet.happiness - 10)
    } else if (hoursSinceLastFed > 12) {
      pet.happiness = Math.max(0, pet.happiness - 5)
    }

    // Check for happiness threshold alerts
    if (prevHappiness >= 40 && pet.happiness < 40 && pet.stage !== 'egg') {
      setHappinessAlert('Your pet is getting hungry! Complete tasks to earn milestones and feed them.')
    } else if (prevHappiness >= 20 && pet.happiness < 20 && pet.stage !== 'egg') {
      setHappinessAlert('Your pet really needs feeding! They miss you!')
    }

    return { ...newData, pet }
  }

  const toggleChore = (id: string) => {
    setData(prevData => {
      const chores = prevData.chores.map(chore => {
        if (chore.id === id) {
          return { ...chore, completed: !chore.completed }
        }
        return chore
      })
      const chore = prevData.chores.find(c => c.id === id)!
      const pointsDelta = !chore.completed ? chore.points : -chore.points
      
      // Haptic feedback on mobile for completing tasks
      if (!chore.completed && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      let newData = {
        ...prevData,
        chores,
        totalPoints: Math.max(0, prevData.totalPoints + pointsDelta),
      }
      newData = updatePetState(newData)
      return checkAchievements(newData)
    })
  }

  const toggleHomework = (id: string) => {
    setData(prevData => {
      const homework = prevData.homework.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
      const item = prevData.homework.find(h => h.id === id)!
      const pointsDelta = !item.completed ? 15 : -15
      
      // Haptic feedback on mobile for completing tasks
      if (!item.completed && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      let newData = {
        ...prevData,
        homework,
        totalPoints: Math.max(0, prevData.totalPoints + pointsDelta),
      }
      newData = updatePetState(newData)
      return checkAchievements(newData)
    })
  }

  const addWaterLog = (amount: number) => {
    setData(prevData => {
      const newLog: WaterLog = {
        id: Date.now().toString(),
        amount,
        timestamp: new Date().toISOString(),
      }
      
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
      
      let newData = {
        ...prevData,
        waterLogs: [...prevData.waterLogs, newLog],
        totalPoints: prevData.totalPoints + 5,
      }
      newData = updatePetState(newData)
      return checkAchievements(newData)
    })
  }

  const togglePlannerItem = (id: string) => {
    setData(prevData => {
      const plannerItems = prevData.plannerItems.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
      const item = prevData.plannerItems.find(p => p.id === id)!
      const pointsDelta = !item.completed ? 5 : -5
      
      // Haptic feedback on mobile for completing tasks
      if (!item.completed && 'vibrate' in navigator) {
        navigator.vibrate(50)
      }
      
      let newData = {
        ...prevData,
        plannerItems,
        totalPoints: Math.max(0, prevData.totalPoints + pointsDelta),
      }
      newData = updatePetState(newData)
      return checkAchievements(newData)
    })
  }

  const addChore = (chore: Omit<Chore, 'id' | 'completed'>) => {
    setData(prevData => ({
      ...prevData,
      chores: [...prevData.chores, { ...chore, id: Date.now().toString(), completed: false }],
    }))
  }

  const addHomework = (homework: Omit<HomeworkItem, 'id' | 'completed'>) => {
    setData(prevData => ({
      ...prevData,
      homework: [...prevData.homework, { ...homework, id: Date.now().toString(), completed: false }],
    }))
  }

  const addPlannerItem = (item: Omit<PlannerItem, 'id' | 'completed'>) => {
    setData(prevData => ({
      ...prevData,
      plannerItems: [...prevData.plannerItems, { ...item, id: Date.now().toString(), completed: false }],
    }))
  }

  const feedPet = (milestone: number) => {
    setData(prevData => {
      const pet = { ...prevData.pet }
      
      // Ensure unlockedMilestones array exists
      if (!Array.isArray(pet.unlockedMilestones)) {
        pet.unlockedMilestones = []
      }
      
      // Only feed if this milestone hasn't been unlocked yet
      if (pet.unlockedMilestones.includes(milestone)) {
        return prevData
      }

      const feedingRecord: FeedingRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        milestone,
        pointsAtFeeding: prevData.totalPoints,
      }

      pet.feedingHistory = [...(pet.feedingHistory || []), feedingRecord]
      pet.unlockedMilestones = [...pet.unlockedMilestones, milestone]
      pet.lastFed = new Date().toISOString()
      pet.happiness = Math.min(100, pet.happiness + 20)

      // Clear any happiness alerts when feeding
      setHappinessAlert(null)

      return { ...prevData, pet }
    })
  }

  const updatePetName = (name: string) => {
    setData(prevData => ({
      ...prevData,
      pet: { ...prevData.pet, name },
    }))
  }

  const resetDaily = () => {
    setData(prevData => ({
      ...prevData,
      chores: prevData.chores.map(c => ({ ...c, completed: false })),
      homework: prevData.homework.map(h => ({ ...h, completed: false })),
      waterLogs: [],
      plannerItems: prevData.plannerItems.map(p => ({ ...p, completed: false })),
      lastUpdated: new Date().toISOString(),
    }))
  }

  const refreshData = async () => {
    // Simulate refresh delay for pull-to-refresh UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Re-check achievements and pet state
    setData(prevData => {
      let newData = updatePetState(prevData)
      return checkAchievements(newData)
    })
  }

  const clearHappinessAlert = () => {
    setHappinessAlert(null)
  }

  return (
    <DataContext.Provider value={{
      ...data,
      toggleChore,
      toggleHomework,
      addWaterLog,
      togglePlannerItem,
      addChore,
      addHomework,
      addPlannerItem,
      resetDaily,
      feedPet,
      updatePetName,
      refreshData,
      isLoading,
      error,
      happinessAlert,
      clearHappinessAlert,
      lastSaved,
      isSaving,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within DataProvider')
  }
  return context
}
