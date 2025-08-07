import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import ComparisonPage from './pages/ComparisonPage'
import Navbar from './components/Navbar'

function App() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 dark">
        <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
        <main>
          <Routes>
            <Route path="/" element={<div className="p-8 text-center text-muted-foreground">Welcome to India Index Funds</div>} />
            <Route path="/screener" element={<div className="p-8 text-center text-muted-foreground">Screener Page - Coming Soon</div>} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/blog" element={<div className="p-8 text-center text-muted-foreground">Blog Page - Coming Soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
