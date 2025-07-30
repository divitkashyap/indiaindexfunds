import { useState } from 'react'
import './App.css'
import ComparisonPage from './pages/ComparisonPage'

function App() {
  const [count, setCount] = useState(0)

  return (
      <ComparisonPage />

  )
}

export default App
