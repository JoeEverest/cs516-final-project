import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import MathQuizPage from './pages/MathQuizPage'
import LeaderboardPage from './pages/LeaderboardPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🧠 Mind Sprinter 🚀</h1>
            <p className="text-gray-600">Test your knowledge and have fun learning! 🎉</p>
          </header>

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz/:topicId" element={<QuizPage />} />
            <Route path="/quiz/math" element={<MathQuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App