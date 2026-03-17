interface WelcomePageProps {
  user: any | null
  isTelegramApp: boolean
}

export default function WelcomePage({ user, isTelegramApp }: WelcomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="text-7xl animate-float mb-6">🌸</div>
        
        <h1 className="text-4xl font-bold text-primary">Blooming</h1>
        <p className="text-text-secondary text-lg">Your AI-powered workout companion</p>
        
        {user ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <p className="text-xl font-medium">Welcome back, {user.first_name}!</p>
            <button 
              className="w-full bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:-translate-y-1 shadow-md hover:shadow-lg"
              onClick={() => alert('Welcome to Blooming!')}
            >
              Start Working Out
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-text-secondary">Open this app from Telegram to get started</p>
          </div>
        )}

        {isTelegramApp && (
          <p className="text-xs text-text-secondary opacity-70">Powered by Telegram WebApp</p>
        )}
      </div>
    </div>
  )
}
