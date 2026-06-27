import { Fragment, useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import AssessmentPanel from './AssessmentPanel'
import ConflictSimulator from './components/ConflictSimulator'

// Star emojis
const StarInsight = () => <span className="star-emoji">✨</span>
const StarGoal = () => <span className="star-emoji">⭐</span>
const StarAction = () => <span className="star-emoji">💫</span>

// Fixed 6-module timeline from Leadership by Design course
const FIXED_WEEKS = [
  { 
    index: 0,
    start: new Date(2026, 5, 1), 
    end: new Date(2026, 5, 7),
    label: 'Module 1',
    title: 'Introduction',
    unlockDate: 'Jun 1, 2026'
  },
  { 
    index: 1,
    start: new Date(2026, 5, 8), 
    end: new Date(2026, 5, 14),
    label: 'Module 2',
    title: 'Self Leadership',
    unlockDate: 'Jun 8, 2026'
  },
  { 
    index: 2,
    start: new Date(2026, 5, 15), 
    end: new Date(2026, 5, 21),
    label: 'Module 3',
    title: 'Leading from the Whole',
    unlockDate: 'Jun 15, 2026'
  },
  { 
    index: 3,
    start: new Date(2026, 5, 22), 
    end: new Date(2026, 5, 28),
    label: 'Module 4',
    title: 'Leading from the Side',
    unlockDate: 'Jun 22, 2026'
  },
  { 
    index: 4,
    start: new Date(2026, 5, 29), 
    end: new Date(2026, 6, 5),
    label: 'Module 5',
    title: 'Leading from the Front',
    unlockDate: 'Jun 29, 2026'
  },
  { 
    index: 5,
    start: new Date(2026, 6, 6), 
    end: new Date(2026, 6, 11),
    label: 'Module 6',
    title: 'Wrapping Up',
    unlockDate: 'Jul 6, 2026'
  },
]

const getWeekIndexForDate = (timestamp) => {
  const d = new Date(timestamp)
  for (let i = 0; i < FIXED_WEEKS.length; i++) {
    const weekStart = FIXED_WEEKS[i].start.getTime()
    const nextWeekStart = i < FIXED_WEEKS.length - 1 ? FIXED_WEEKS[i + 1].start.getTime() : Infinity
    if (d.getTime() >= weekStart && d.getTime() < nextWeekStart) return i
  }
  return FIXED_WEEKS.length - 1
}

const ENTRY_TYPES = {
  insight: { label: 'Insight', color: '#3b82f6' },
  learning: { label: 'Learning', color: '#14b8a6' },
  growth: { label: 'Growth', color: '#10b981' },
  'speaker-notes': { label: 'Speaker Notes', color: '#f59e0b' },
  events: { label: 'Events', color: '#a855f7' },
  thought: { label: 'Thought', color: '#ec4899' }
}

// ─── Scatter placement ────────────────────────────────────────────────────────
const CARD_W = 340
const CARD_H = 230
const PHOTO_W = 190
const PHOTO_H = 180
const MIN_GAP = 32  // minimum gap between items (stricter)
const TOP_OFFSET = 72 // clear the week label

/**
 * Strict collision check with gap buffer on all sides.
 */
const checkOverlap = (ax, ay, aw, ah, bx, by, bw, bh) => {
  const aLeft = ax - MIN_GAP
  const aRight = ax + aw + MIN_GAP
  const aTop = ay - MIN_GAP
  const aBottom = ay + ah + MIN_GAP
  
  const bLeft = bx - MIN_GAP
  const bRight = bx + bw + MIN_GAP
  const bTop = by - MIN_GAP
  const bBottom = by + bh + MIN_GAP
  
  return !(aRight < bLeft || bRight < aLeft || aBottom < bTop || bBottom < aTop)
}

/**
 * Find a non-overlapping pixel position with STRICT collision.
 */
const placeItem = (isPhoto, placed, vw, vh) => {
  const w = isPhoto ? PHOTO_W : CARD_W
  const h = isPhoto ? PHOTO_H : CARD_H

  const zoneMinX = isPhoto ? MIN_GAP : Math.round(vw * 0.35)
  const zoneMaxX = isPhoto ? Math.round(vw * 0.38) : vw - w - MIN_GAP

  const minY = TOP_OFFSET
  const maxY = Math.max(minY + 50, vh - h - MIN_GAP)

  // Try 300 times with stricter collision
  for (let attempt = 0; attempt < 300; attempt++) {
    const left = zoneMinX + Math.random() * Math.max(1, zoneMaxX - zoneMinX)
    const top  = minY + Math.random() * Math.max(1, maxY - minY)

    const cl = Math.max(MIN_GAP, Math.min(left, vw - w - MIN_GAP))
    const ct = Math.max(minY, Math.min(top, vh - h - MIN_GAP))

    let hasOverlap = false
    for (const r of placed) {
      if (checkOverlap(cl, ct, w, h, r.x, r.y, r.w, r.h)) {
        hasOverlap = true
        break
      }
    }
    if (!hasOverlap) return { left: cl, top: ct }
  }

  // Fallback: stack vertically
  const maxY_existing = placed.length > 0 
    ? Math.max(...placed.map(r => r.y + r.h)) + MIN_GAP
    : minY
  
  return {
    left: Math.max(MIN_GAP, zoneMinX + Math.random() * 100),
    top: Math.min(maxY_existing, vh - h - MIN_GAP),
  }
}

/**
 * Build pixel positions for every entry in a week.
 */
const buildWeekPositions = (weekEntries, vw, vh) => {
  const placed = []
  const result = {}
  for (const entry of weekEntries) {
    const isPhoto = entry.type === 'photo'
    const pos = placeItem(isPhoto, placed, vw, vh)
    const w = isPhoto ? PHOTO_W : CARD_W
    const h = isPhoto ? PHOTO_H : CARD_H
    placed.push({ x: pos.left, y: pos.top, w, h })
    result[entry.id] = pos
  }
  return result
}
// ─────────────────────────────────────────────────────────────────────────────

const getContentPlaceholder = (type) => {
  const placeholders = {
    insight: 'What realization or insight did you have?',
    learning: 'What surprised you? What\'s one key takeaway?',
    growth: 'Where are you stretching? What\'s challenging you?',
    'speaker-notes': 'Key quotes or ideas from the speaker...',
    events: 'What happened? What was significant about this?',
    thought: 'What\'s on your mind?'
  }
  return placeholders[type] || 'Write your reflection...'
}

// Auth credentials — set VITE_AUTH_EMAIL and VITE_AUTH_PASSWORD in your .env file
const AUTH_EMAIL = import.meta.env.VITE_AUTH_EMAIL ?? ''
const AUTH_PASSWORD = import.meta.env.VITE_AUTH_PASSWORD ?? ''

const AUTH_HEADER = `Basic ${btoa(`${AUTH_EMAIL}:${AUTH_PASSWORD}`)}`

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'Authorization': AUTH_HEADER, ...options.headers },
  })

function App() {
  const [entries, setEntries] = useState([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [editingPhotoCaption, setEditingPhotoCaption] = useState('')
  const [formData, setFormData] = useState({ type: 'insight', title: '', content: '' })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSignedIn, setIsSignedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('diarySignedIn') === 'true'
    }
    return false
  })
  const [showSignIn, setShowSignIn] = useState(false)
  const [signInEmail, setSignInEmail] = useState('')
  const [signInPassword, setSignInPassword] = useState('')
  const [signInError, setSignInError] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [activeTab, setActiveTab] = useState('diary')
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [photoCaption, setPhotoCaption] = useState('')
  const [draggingId, setDraggingId] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  // positions stores pixel coords: { [entryId]: { left, top } }
  const [positions, setPositions] = useState({})
  // viewport size of the scatter container (updated on mount / resize)
  const [containerSize, setContainerSize] = useState({ vw: window.innerWidth, vh: window.innerHeight - 65 })
  const scrollContainerRef = useRef(null)
  const captionInputRef = useRef(null)
  const scatterRef = useRef(null)

  // Load entries from D1 on mount
  useEffect(() => {
    fetch('/api/entries')
      .then(r => r.json())
      .then(data => setEntries(data))
      .catch(() => {})
  }, [])

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Focus caption input when photo is pending
  useEffect(() => {
    if (pendingPhoto && captionInputRef.current) {
      captionInputRef.current.focus()
    }
  }, [pendingPhoto])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  // Track container size for placement calculations
  useEffect(() => {
    const update = () => {
      setContainerSize({ vw: window.innerWidth, vh: window.innerHeight - 65 })
    }
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // Scroll to current week on load
  useEffect(() => {
    const today = new Date()
    let currentWeekIndex = 0
    
    for (let i = 0; i < FIXED_WEEKS.length; i++) {
      if (today >= FIXED_WEEKS[i].start && today <= FIXED_WEEKS[i].end) {
        currentWeekIndex = i
        break
      }
      // If today is after this week, keep track of index
      if (today > FIXED_WEEKS[i].end) {
        currentWeekIndex = i + 1
      }
    }
    
    // Scroll to current week
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollLeft = currentWeekIndex * window.innerWidth
      }, 100)
    }
  }, [])

  // When entries change, seed positions for any entry that doesn't have one yet
  useEffect(() => {
    const { vw, vh } = containerSize
    setPositions(prev => {
      const next = { ...prev }
      let changed = false

      // Group entries by week so we can do per-week collision detection
      const byWeek = {}
      for (const e of entries) {
        if (!byWeek[e.weekIndex]) byWeek[e.weekIndex] = []
        byWeek[e.weekIndex].push(e)
      }

      for (const [, weekEntries] of Object.entries(byWeek)) {
        // Build placed list from already-positioned entries in this week
        const placed = weekEntries
          .filter(e => next[e.id])
          .map(e => {
            const p = next[e.id]
            const isPhoto = e.type === 'photo'
            return { x: p.left, y: p.top, w: isPhoto ? PHOTO_W : CARD_W, h: isPhoto ? PHOTO_H : CARD_H }
          })

        for (const entry of weekEntries) {
          if (next[entry.id]) continue // already placed
          const isPhoto = entry.type === 'photo'
          const pos = placeItem(isPhoto, placed, vw, vh)
          const w = isPhoto ? PHOTO_W : CARD_W
          const h = isPhoto ? PHOTO_H : CARD_H
          placed.push({ x: pos.left, y: pos.top, w, h })
          next[entry.id] = pos
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [entries, containerSize])

  // Handle sign-in
  const handleSignIn = () => {
    setSignInError('')
    const email = signInEmail.trim()
    const password = signInPassword.trim()
    
    if (email === AUTH_EMAIL && password === AUTH_PASSWORD) {
      localStorage.setItem('diarySignedIn', 'true')
      setIsSignedIn(true)
      setSignInEmail('')
      setSignInPassword('')
      setShowSignIn(false)
    } else {
      setSignInError('Invalid email or password')
    }
  }

  // Handle sign-out
  const handleSignOut = () => {
    localStorage.removeItem('diarySignedIn')
    setIsSignedIn(false)
    setSelectedEntry(null)
    setShowNewEntry(false)
    setEditingEntry(null)
  }

  // Mouse drag handlers
  const handleMouseDown = (e, entryId) => {
    if (['BUTTON', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
    e.preventDefault()
    setDraggingId(entryId)
    const rect = e.currentTarget.getBoundingClientRect()
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseMove = useCallback((e) => {
    if (draggingId === null) return
    const containers = document.querySelectorAll('.week-scatter')
    let containerRect = null
    for (const c of containers) {
      const r = c.getBoundingClientRect()
      if (e.clientX >= r.left && e.clientX <= r.right &&
          e.clientY >= r.top  && e.clientY <= r.bottom) {
        containerRect = r
        break
      }
    }
    if (!containerRect && containers[0]) containerRect = containers[0].getBoundingClientRect()
    if (!containerRect) return

    const entry = entries.find(e2 => e2.id === draggingId)
    const isPhoto = entry?.type === 'photo'
    const w = isPhoto ? PHOTO_W : CARD_W
    const h = isPhoto ? PHOTO_H : CARD_H

    let newLeft = Math.max(0, Math.min(
      e.clientX - containerRect.left - dragOffset.x,
      containerRect.width - w
    ))
    let newTop = Math.max(0, Math.min(
      e.clientY - containerRect.top - dragOffset.y,
      containerRect.height - h
    ))

    // Check for collisions with other entries in the same week
    const weekEntries = entries.filter(e => e.weekIndex === entry.weekIndex && e.id !== draggingId)
    let hasCollision = false
    
    for (const other of weekEntries) {
      const otherPos = positions[other.id]
      if (!otherPos) continue
      
      const otherIsPhoto = other.type === 'photo'
      const otherW = otherIsPhoto ? PHOTO_W : CARD_W
      const otherH = otherIsPhoto ? PHOTO_H : CARD_H
      
      if (checkOverlap(newLeft, newTop, w, h, otherPos.left, otherPos.top, otherW, otherH)) {
        hasCollision = true
        break
      }
    }

    // If collision, revert to last valid position (don't update)
    if (hasCollision) {
      return
    }

    setPositions(prev => ({
      ...prev,
      [draggingId]: { left: newLeft, top: newTop },
    }))
  }, [draggingId, dragOffset, entries, positions])

  const handleMouseUp = useCallback(() => setDraggingId(null), [])

  useEffect(() => {
    if (draggingId !== null) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggingId, handleMouseMove, handleMouseUp])

  // Upload photo to R2
  const handlePhotoUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    
    setUploadingPhoto(true)
    try {
      const formData = new FormData()
      formData.append('photo', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      
      if (res.ok) {
        const { url } = await res.json()
        setPendingPhoto(url)
        setPhotoCaption('')
      } else {
        alert('Failed to upload photo')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert('Error uploading photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  // Save photo entry after caption
  const savePendingPhoto = async () => {
    if (!pendingPhoto) return

    const payload = {
      entryType: 'photo',
      weekIndex: getWeekIndexForDate(Date.now()),
      image: pendingPhoto,
      caption: photoCaption,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      timestamp: Date.now(),
    }

    const res = await authFetch('/api/entries', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const created = await res.json()
      setEntries([created, ...entries])
    }
    setPendingPhoto(null)
    setPhotoCaption('')
  }

  // Add / update text entry
  const handleAddEntry = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please add a title and content')
      return
    }

    const payload = {
      entryType: formData.type,
      weekIndex: getWeekIndexForDate(Date.now()),
      title: formData.title,
      content: formData.content,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      }),
      timestamp: Date.now(),
    }

    if (editingEntry) {
      const res = await authFetch(`/api/entries/${editingEntry.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const updated = await res.json()
        setEntries(entries.map(e => e.id === editingEntry.id ? updated : e))
      }
      setEditingEntry(null)
    } else {
      const res = await authFetch('/api/entries', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const created = await res.json()
        setEntries([created, ...entries])
      }
    }

    setFormData({ type: 'insight', title: '', content: '' })
    setShowNewEntry(false)
  }

  // Check if a week is in the past, current, or future
  const getWeekStatus = (weekIndex) => {
    const now = new Date()
    const weekStart = FIXED_WEEKS[weekIndex].start
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    if (now < weekStart) return 'future'
    if (now >= weekEnd) return 'past'
    return 'current'
  }

  const photoRotations = [-8, 5, 3, -5, 7]
  const cardRotations = [-3, 2, 1, -2]

  const currentTime_display = currentTime.toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
  }) + ' ' + currentTime.toLocaleTimeString('en-US')

  return (
    <div className={`app${darkMode ? ' dark' : ''}`}>
      {/* Assessment Panel */}
      <AssessmentPanel />

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>Leadership Diary</h1>
          <p className="tagline">{entries.length} entries</p>
        </div>
        <div className="header-timestamp">{currentTime_display}</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!isSignedIn ? (
            <button 
              onClick={() => setShowSignIn(true)}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0px',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '700'
              }}
            >
              Sign In
            </button>
          ) : (
            <button 
              onClick={handleSignOut}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                background: 'transparent',
                color: '#6b7280',
                border: '1px solid #d1d5db',
                borderRadius: '0px',
                cursor: 'pointer',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#9ca3af'
                e.target.style.color = '#374151'
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#d1d5db'
                e.target.style.color = '#6b7280'
              }}
              className="sign-out-btn"
            >
              Sign Out
            </button>
          )}
          <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} aria-label="Toggle dark mode">
          {darkMode ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-nav">
        <button
          className={`tab-btn${activeTab === 'diary' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('diary')}
        >
          Diary
        </button>
        <button
          className={`tab-btn${activeTab === 'simulator' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('simulator')}
        >
          Conflict Simulator
        </button>
      </div>

      {activeTab === 'simulator' && (
        <div className="simulator-view">
          <ConflictSimulator />
        </div>
      )}

      {/* Main Canvas - Horizontal Scrolling Weeks */}
      <div className="canvas" style={{ display: activeTab === 'diary' ? undefined : 'none' }}>
        <div className="weeks-scroll-container" ref={scrollContainerRef}>
          {FIXED_WEEKS.map((week) => {
            const weekEntries = entries.filter(e => e.weekIndex === week.index)
            const status = getWeekStatus(week.index)
            const isLocked = status === 'future'

            return (
              <div 
                key={week.index} 
                className={`week-container week-${status}`}
              >
                {/* Module Label - Top Left */}
                <div className="week-label">
                  <h2>{week.label}: {week.title}</h2>
                </div>

                {/* Unlock Notice - Future Modules */}
                {isLocked && (
                  <div className="week-overlay">
                    <div className="unlock-message">
                      <p>{week.label}: {week.title} (Will unlock on {week.unlockDate})</p>
                    </div>
                  </div>
                )}

                {/* Scattered Entries Container */}
                <div className="week-scatter" ref={scatterRef}>
                  {weekEntries.map((entry, i) => {
                    const pos = positions[entry.id]
                    if (!pos) return null // not yet placed

                    if (entry.type === 'photo') {
                      return (
                        <div
                          key={entry.id}
                          className="polaroid floating"
                          style={{
                            left: pos.left,
                            top: pos.top,
                            width: PHOTO_W,
                            transform: `rotate(${photoRotations[i % photoRotations.length]}deg)`,
                            cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                            zIndex: draggingId === entry.id ? 50 : 1,
                            position: 'absolute',
                          }}
                          onMouseDown={(e) => handleMouseDown(e, entry.id)}
                          onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                        >
                          <img src={entry.image} alt="memory" style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                          <div className="polaroid-content">
                            {entry.caption && <div className="polaroid-caption">{entry.caption}</div>}
                            <div className="polaroid-date">{entry.date}</div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={entry.id}
                        className="entry-card scattered floating"
                        style={{
                          left: pos.left,
                          top: pos.top,
                          width: CARD_W,
                          transform: `rotate(${cardRotations[i % cardRotations.length]}deg)`,
                          cursor: draggingId === entry.id ? 'grabbing' : 'grab',
                          zIndex: draggingId === entry.id ? 50 : 1,
                          position: 'absolute',
                        }}
                        onMouseDown={(e) => handleMouseDown(e, entry.id)}
                        onClick={() => setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)}
                      >
                        <div 
                          className="washi-tape" 
                          style={{ backgroundColor: ENTRY_TYPES[entry.entryType]?.color || '#3b82f6' }}
                        >
                          <span style={{ position: 'relative', color: 'white', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {ENTRY_TYPES[entry.entryType]?.label || 'Entry'}
                          </span>
                        </div>
                        <div className="card-inner">
                          <div className="card-preview">
                            <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 12px 0', color: '#000', lineHeight: '1.4' }}>
                              {entry.title}
                            </p>
                            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: '1.5', marginBottom: '16px' }}>
                              {entry.content}
                            </p>
                            <p style={{ fontSize: '11px', color: '#64748b', margin: '0', position: 'absolute', bottom: '12px', right: '12px' }}>
                              {entry.date}
                            </p>
                          </div>
                          {selectedEntry?.id === entry.id && isSignedIn && (
                            <>
                              {/* Delete X Button - Top Right Corner */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setDeleteConfirmId(entry.id)
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '8px',
                                  right: '8px',
                                  padding: '4px 8px',
                                  fontSize: '20px',
                                  background: 'transparent',
                                  color: '#dc2626',
                                  border: 'none',
                                  cursor: 'pointer',
                                  lineHeight: '1'
                                }}
                              >
                                ✕
                              </button>
                              {/* Edit Button - Bottom Right */}
                              <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
                                <button 
                                  className="edit-btn"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedEntry(null)
                                    setFormData({ type: entry.entryType, title: entry.title, content: entry.content })
                                    setEditingEntry(entry)
                                    setShowNewEntry(true)
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '12px',
                                    background: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Edit
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="envelope-flap"></div>
                      </div>
                    )
                  })}
                </div>

                {/* Add Button & Camera Button - Current Week Only & Signed In */}
                {status === 'current' && !isLocked && isSignedIn && (
                  <>
                    <button className="camera-button" onClick={() => document.getElementById('camera-input').click()} disabled={uploadingPhoto}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    </button>
                    <button className="plus-button" onClick={() => setShowNewEntry(true)}>+</button>
                  </>
                )}
              </div>
            )
          })}

          {/* Final "You made it!" Section */}
          <div className="week-container celebration">
            <div className="celebration-content">
              <h2>You've completed the Leadership by Design course! 🎉</h2>
              <p>Congratulations on your leadership journey.</p>
            </div>
          </div>
        </div>

        <input
          type="file"
          id="camera-input"
          accept="image/*"
          onChange={(e) => e.target.files && handlePhotoUpload(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div className="overlay" onClick={() => setShowNewEntry(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEntry ? 'Edit Entry' : 'New Entry'}</h2>
              <button className="close-btn" onClick={() => { setShowNewEntry(false); setEditingEntry(null) }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Entry Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="insight">{ENTRY_TYPES.insight.label}</option>
                  <option value="learning">{ENTRY_TYPES.learning.label}</option>
                  <option value="growth">{ENTRY_TYPES.growth.label}</option>
                  <option value="speaker-notes">{ENTRY_TYPES['speaker-notes'].label}</option>
                  <option value="events">{ENTRY_TYPES.events.label}</option>
                  <option value="thought">{ENTRY_TYPES.thought.label}</option>
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your entry a title..."
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={getContentPlaceholder(formData.type)}
                  rows="6"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-primary" onClick={handleAddEntry}>{editingEntry ? 'Update Entry' : 'Save Entry'}</button>
                {editingEntry && <button className="btn-secondary" onClick={() => { setEditingEntry(null); setShowNewEntry(false) }}>Cancel</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Caption Modal */}
      {pendingPhoto && (
        <div className="overlay" onClick={() => setPendingPhoto(null)}>
          <div className="modal photo-caption-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Caption</h2>
              <button className="close-btn" onClick={() => setPendingPhoto(null)}>✕</button>
            </div>
            <div className="modal-body">
              <img src={pendingPhoto} alt="preview" className="caption-preview" />
              <input
                ref={captionInputRef}
                type="text"
                placeholder="Optional caption..."
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') savePendingPhoto() }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#000000',
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '13px',
                  fontWeight: '400',
                  borderRadius: '0px',
                  boxSizing: 'border-box',
                  marginBottom: '16px',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
              />
              <div className="modal-actions">
                <button className="btn-primary" onClick={savePendingPhoto}>Save Photo</button>
                <button className="btn-secondary" onClick={() => setPendingPhoto(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="overlay" onClick={() => setSelectedEntry(null)}>
          <div className="modal entry-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedEntry.date}</h2>
                {selectedEntry.entryType && (
                  <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0 0' }}>
                    {ENTRY_TYPES[selectedEntry.entryType]?.label}
                  </p>
                )}
              </div>
              <button className="close-btn" onClick={() => setSelectedEntry(null)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedEntry.image && (
                <img src={selectedEntry.image} alt="entry" className="detail-image" />
              )}
              {selectedEntry.title && (
                <div className="detail-field">
                  <h3>{selectedEntry.title}</h3>
                </div>
              )}
              {selectedEntry.content && (
                <div className="detail-field">
                  <p>{selectedEntry.content}</p>
                </div>
              )}
              {selectedEntry.caption && (
                <div className="detail-field">
                  <h4>Photo Caption</h4>
                  <p>{selectedEntry.caption}</p>
                </div>
              )}
              {isSignedIn && (
                <button 
                  className="btn-primary"
                  onClick={() => {
                    if (selectedEntry.image) {
                      setEditingPhotoCaption(selectedEntry.caption || '')
                    } else {
                      setSelectedEntry(null)
                      setFormData({ type: selectedEntry.entryType, title: selectedEntry.title, content: selectedEntry.content })
                      setEditingEntry(selectedEntry)
                      setShowNewEntry(true)
                    }
                  }}
                  style={{ marginTop: '16px' }}
                >
                  {selectedEntry.image ? 'Edit Caption' : 'Edit Entry'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Photo Caption Edit Modal */}
      {editingPhotoCaption !== false && selectedEntry?.image && isSignedIn && (
        <div className="overlay" onClick={() => setEditingPhotoCaption(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Edit Photo Caption</h2>
              <button className="close-btn" onClick={() => setEditingPhotoCaption(false)}>✕</button>
            </div>
            <div className="modal-body">
              <img src={selectedEntry.image} alt="entry" style={{ width: '100%', marginBottom: '16px', maxHeight: '300px', objectFit: 'cover' }} />
              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  value={editingPhotoCaption}
                  onChange={(e) => setEditingPhotoCaption(e.target.value)}
                  placeholder="Optional caption..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    background: '#ffffff',
                    color: '#000000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    fontWeight: '400',
                    borderRadius: '0px',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.2s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  className="btn-primary"
                  onClick={async () => {
                    const res = await authFetch(`/api/entries/${selectedEntry.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({ caption: editingPhotoCaption }),
                    })
                    if (res.ok) {
                      const updated = await res.json()
                      setEntries(entries.map(e => e.id === selectedEntry.id ? updated : e))
                    }
                    setSelectedEntry(null)
                    setEditingPhotoCaption(false)
                  }}
                  style={{ flex: 1 }}
                >
                  Save Caption
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(selectedEntry.id)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: 'transparent',
                    color: '#14b8a6',
                    border: '1px solid #14b8a6',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Delete Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '350px' }}>
            <div className="modal-header">
              <h2>Delete Entry?</h2>
              <button className="close-btn" onClick={() => setDeleteConfirmId(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '24px' }}>
                Are you sure you want to delete this entry? This action cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={async () => {
                    await authFetch(`/api/entries/${deleteConfirmId}`, { method: 'DELETE' })
                    setEntries(entries.filter(e => e.id !== deleteConfirmId))
                    setSelectedEntry(null)
                    setDeleteConfirmId(null)
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    fontSize: '13px',
                    background: 'transparent',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '0px',
                    cursor: 'pointer',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '700'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="overlay" onClick={() => setShowSignIn(false)}>
          <div className="modal new-entry-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Sign In</h2>
              <button className="close-btn" onClick={() => setShowSignIn(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  placeholder="Enter your email"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    borderRadius: '0px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyPress={(e) => e.key === 'Enter' && handleSignIn()}
                  style={{
                    padding: '12px',
                    border: '1px solid #e5e7eb',
                    background: 'white',
                    color: '#000',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '13px',
                    borderRadius: '0px',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              {signInError && (
                <p style={{ color: '#dc2626', fontSize: '13px', margin: '8px 0', fontFamily: 'Space Grotesk, sans-serif' }}>
                  {signInError}
                </p>
              )}
              <button className="btn-primary" onClick={handleSignIn} style={{ width: '100%' }}>
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App