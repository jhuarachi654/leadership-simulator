import { useState } from 'react'
import ConflictSimulator from './components/ConflictSimulator'
import DesignRationale from './components/DesignRationale'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('simulator')

  return (
    <div className="app">
      <nav className="app-nav">
        <span className="app-nav-title">Conflict Resolution Simulator</span>
        <div className="app-nav-tabs">
          <button
            className={`app-nav-tab${tab === 'simulator' ? ' active' : ''}`}
            onClick={() => setTab('simulator')}
          >
            Simulator
          </button>
          <button
            className={`app-nav-tab${tab === 'rationale' ? ' active' : ''}`}
            onClick={() => setTab('rationale')}
          >
            Design Rationale
          </button>
        </div>
      </nav>
      {tab === 'simulator' ? <ConflictSimulator /> : <DesignRationale />}
    </div>
  )
}
