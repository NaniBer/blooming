import { useEffect, useState } from 'react'
import { init, backButton } from '@telegram-apps/sdk'
import HomePage from './pages/HomePage'
import LogWorkoutPage from './pages/LogWorkoutPage'
import HistoryPage from './pages/HistoryPage'
import SchedulerPage from './pages/SchedulerPage'

type Page = 'home' | 'log' | 'history' | 'scheduler'

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
          }
        }
      }
    }
  }
}

function App() {
  const [isTelegramApp, setIsTelegramApp] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState<Page>('home')

  useEffect(() => {
    try {
      init()

      // Check if running in Telegram WebApp
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready()
        setIsTelegramApp(true)

        // Get user data from Telegram
        const telegramUser = window.Telegram.WebApp.initDataUnsafe?.user
        if (telegramUser) {
          setUser(telegramUser)
        }
      }
    } catch (error) {
      console.error('Error initializing Telegram SDK:', error)
    }
  }, [])

  useEffect(() => {
    if (isTelegramApp) {
      backButton.show()
      backButton.onClick(() => {
        if (currentPage !== 'home') {
          setCurrentPage('home')
        }
      })
    }
  }, [currentPage, isTelegramApp])

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage user={user} onNavigate={setCurrentPage} />
      case 'log':
        return <LogWorkoutPage onBack={() => setCurrentPage('home')} onWorkoutSaved={() => {}} />
      case 'history':
        return <HistoryPage onBack={() => setCurrentPage('home')} onWorkoutDeleted={() => {}} />
      case 'scheduler':
        return <SchedulerPage onBack={() => setCurrentPage('home')} />
      default:
        return <HomePage user={user} onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="app">
      {renderPage()}
    </div>
  )
}

export default App
