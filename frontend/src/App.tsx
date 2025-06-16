import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import MathQuizPage from './pages/MathQuizPage'
import LeaderboardPage from './pages/LeaderboardPage'
import Auth from './pages/Auth'
import { DropdownMenu, DropdownMenuSeparator, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuItem } from './components/ui/dropdown-menu'
import { Button } from './components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { ChevronDownIcon, LogInIcon, LogOutIcon } from 'lucide-react'
import { } from '@radix-ui/react-dropdown-menu'

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL

function ProfileIcon({ name, email }: { name: string, email: string }) {


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
          <Avatar>
            <AvatarImage src="./avatar.jpg" alt="Profile image" />
            <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <ChevronDownIcon
            size={16}
            className="opacity-60"
            aria-hidden="true"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-64">
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {name}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {
          localStorage.removeItem("auth");
          window.location.href = LOGIN_URL || '/';
        }}>
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}



function App() {

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState<{ userId: string, username: string, email: string } | null>(null);
  const getUserFromToken = () => {
    try {
      const authData = localStorage.getItem("auth");
      if (!authData) return null;

      const { idToken } = JSON.parse(authData);
      if (!idToken) return null;

      // Decode JWT token (split and decode base64)
      const payload = idToken.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));

      return {
        userId: decodedPayload.sub,
        username: decodedPayload['cognito:username'],
        email: decodedPayload.email
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  React.useEffect(() => {
    const user = getUserFromToken();
    if (user) {
      setIsLoggedIn(true);
      setLoggedInUser(user);
      // You can set user details in state or context if needed
      console.log('User logged in:', user);
    } else {
      setIsLoggedIn(false);
      console.log('No user logged in');
    }
  }, [])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between">
            <header className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">🧠 Mind Sprinter 🚀</h1>
              <p className="text-gray-600">Test your knowledge and have fun learning! 🎉</p>
            </header>
            {
              isLoggedIn ? (
                <div className="flex justify-end mb-4">
                  <ProfileIcon
                    name={loggedInUser?.username || 'Guest'}
                    email={loggedInUser?.email || ""}
                  />
                </div>)

                :

                <Button
                  onClick={() => {
                    window.location.href = LOGIN_URL || '/';
                  }}
                  variant={"outline"}
                >Login

                  <LogInIcon />
                </Button>
            }
          </div>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz/:topicId" element={<QuizPage />} />
            <Route path="/quiz/math" element={<MathQuizPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/Auth" element={<Auth />} />
          </Routes>
        </div>
      </div>
    </Router >
  )
}

export default App