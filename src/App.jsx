import React, { useState, useEffect } from 'react'
import { initFirebase } from './firebase.js'
import SetupScreen from './components/SetupScreen.jsx'
import Header from './components/Header.jsx'
import TabBar from './components/TabBar.jsx'
import CalendarTab from './components/CalendarTab.jsx'
import TodoTab from './components/TodoTab.jsx'
import GroceryTab from './components/GroceryTab.jsx'
import ScrumTab from './components/ScrumTab.jsx'

const TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'todo',     label: 'To-Do'    },
  { id: 'grocery',  label: 'Grocery'  },
  { id: 'scrum',    label: 'Scrum'    }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('calendar')
  const [isReady, setIsReady] = useState(false)
  const [userName, setUserName] = useState('')
  const [members, setMembers] = useState([])

  // Check for saved Firebase config
  useEffect(() => {
    const apiKey    = localStorage.getItem('fb_apiKey')
    const projectId = localStorage.getItem('fb_projectId')
    const name      = localStorage.getItem('fb_userName')

    if (apiKey && projectId && name) {
      const spouse = localStorage.getItem('fb_spouseName') || 'Wife'
      initFirebase(apiKey, projectId)
      setUserName(name)
      setMembers([name, spouse, 'Family'])
      setIsReady(true)
    }
  }, [])

  function handleSetupComplete({ apiKey, projectId, name, spouseName }) {
    localStorage.setItem('fb_apiKey',     apiKey)
    localStorage.setItem('fb_projectId',  projectId)
    localStorage.setItem('fb_userName',   name)
    localStorage.setItem('fb_spouseName', spouseName || 'Wife')

    initFirebase(apiKey, projectId)
    setUserName(name)
    setMembers([name, spouseName || 'Wife', 'Family'])
    setIsReady(true)
  }

  if (!isReady) {
    return <SetupScreen onComplete={handleSetupComplete} />
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} tabs={TABS} />
      <main className="main-content">
        {activeTab === 'calendar' && <CalendarTab members={members} ready={isReady} />}
        {activeTab === 'todo'     && <TodoTab     members={members} ready={isReady} />}
        {activeTab === 'grocery'  && <GroceryTab               ready={isReady} />}
        {activeTab === 'scrum'    && <ScrumTab    members={members} ready={isReady} />}
      </main>
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} tabs={TABS} />
    </div>
  )
}
