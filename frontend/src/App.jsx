import { useState } from 'react'
import Dashboard from './components/Dashboard'
import FakePayScanner from './components/FakePayScanner'
import LinkGuard from './components/LinkGuard'
import VoiceScam from './components/VoiceScam'
import ScanHistory from './components/ScanHistory'
import Settings from './components/Settings'
import ReportScreen from './components/ReportScreen'
import { AppProvider, useApp } from './context/AppContext'

function AppLayout() {
  const [activePage, setActivePage] = useState('home')
  const { isMobileView } = useApp();

  const goHome = () => setActivePage('home')

  let content = null;
  switch (activePage) {
    case 'home':
      content = <Dashboard onNavigate={setActivePage} />
      break
    case 'fakepay':
      content = <FakePayScanner onBack={goHome} />
      break
    case 'linkguard':
      content = <LinkGuard onBack={goHome} />
      break
    case 'voicescam':
      content = <VoiceScam onBack={goHome} />
      break
    case 'history':
      content = <ScanHistory onBack={goHome} />
      break
    case 'settings':
      content = <Settings onBack={goHome} />
      break
    case 'report':
      content = <ReportScreen onBack={goHome} />
      break
    default:
      content = <Dashboard onNavigate={setActivePage} />
  }

  return (
    <div className="transition-all duration-300" style={{
      maxWidth: isMobileView ? '430px' : '100%',
      margin: '0 auto',
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: isMobileView ? '0 4px 24px rgba(0,0,0,0.5)' : 'none'
    }}>
      {content}
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  )
}

export default App
