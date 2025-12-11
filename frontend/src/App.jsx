import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    // Check backend health
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    fetch(`${apiUrl}/api/health`)
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => {
        console.error('Backend health check failed:', err)
        setHealth({ status: 'error', message: 'Backend not reachable' })
      })
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clothing Shop</h1>
        <p>Welcome to the Clothing Shop Application</p>
        {health && (
          <div className="health-status">
            <p>Backend Status: {health.status}</p>
            {health.timestamp && <p>Last Check: {new Date(health.timestamp).toLocaleString()}</p>}
          </div>
        )}
      </header>
      <main>
        <section>
          <h2>Features</h2>
          <ul>
            <li>User Management & Authentication</li>
            <li>Product Catalog</li>
            <li>Order Management</li>
            <li>Reports & Statistics</li>
          </ul>
        </section>
      </main>
    </div>
  )
}

export default App

